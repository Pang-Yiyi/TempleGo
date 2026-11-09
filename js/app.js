(() => {
  const T = window.TOUR;
  const $ = (id) => document.getElementById(id);

  // ---------- 印章存檔（失敗也不影響使用） ----------
  const STAMP_KEY = "templego-stamps";
  const loadStamps = () => {
    try { return JSON.parse(localStorage.getItem(STAMP_KEY)) || []; } catch { return []; }
  };
  const saveStamp = (id) => {
    const s = new Set(loadStamps()); s.add(id);
    try { localStorage.setItem(STAMP_KEY, JSON.stringify([...s])); } catch {}
    return s.size;
  };

  // ---------- 狀態 ----------
  let stopIndex = 0;
  let step = 0;
  let typing = null;
  let lineFull = "";
  let mode = "talk";          // talk | quiz | explore | busy
  let seen = new Set();

  const stop = () => T.stops[stopIndex];
  const line = () => stop().script[step];
  const fill = (s) => s.replaceAll("{name}", T.guide.name).replaceAll("{lunarHint}", lunarHint);

  // ---------- 農曆犒將日提示（瀏覽器不支援農曆時改用通用說法） ----------
  function lunarHint() {
    const fallback = "每月農曆初二、十六下午三點到五點來，就有機會看到犒將喔！";
    try {
      const parts = new Intl.DateTimeFormat("zh-TW-u-ca-chinese", { month: "long", day: "numeric" })
        .formatToParts(new Date());
      const month = parts.find((p) => p.type === "month")?.value;
      const day = Number(parts.find((p) => p.type === "day")?.value);
      if (!month || !(day >= 1 && day <= 30)) return fallback;
      const n = "一二三四五六七八九十";
      const dayName = day <= 10 ? "初" + n[day - 1]
        : day < 20 ? "十" + n[day - 11]
        : day === 20 ? "二十"
        : day < 30 ? "廿" + n[day - 21] : "三十";
      const today = `今天是農曆${month}${dayName}`;
      if (day === 2 || day === 16) return `${today}，剛好就是犒將日！下午三點到五點來，就有機會看到。`;
      const next = day < 2 ? "這個月初二" : day < 16 ? "這個月十六" : "下個月初二";
      return `${today}，下一次犒將是${next}下午，有空可以再來看看！`;
    } catch {
      return fallback;
    }
  }

  // ---------- 開場 ----------
  $("templeName").textContent = T.temple.name;
  $("templeSub").textContent = T.temple.subtitle;
  T.guide.poses = T.guide.styles[T.guide.style] || T.guide.styles.q;
  $("introGuide").src = T.guide.poses.intro || T.guide.poses.default;
  $("speaker").textContent = T.guide.name;
  $("guideImg").src = T.guide.poses.default;
  $("guideImg").alt = T.guide.name;

  const show = (id) => {
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
  };

  $("startBtn").onclick = showOverview;
  $("mapHomeBtn").onclick = showOverview;
  $("ovHomeBtn").onclick = () => show("intro");
  $("homeBtn").onclick = () => { clearInterval(typing); typing = null; destroyPano(); showMap(); };
  $("replayBtn").onclick = () => startStop(stopIndex);
  $("toMapBtn").onclick = showMap;

  // ---------- 照片與資料來源 ----------
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function renderCredits() {
    const lic = T.photoLicense;
    const all = Object.values(T.photos || {});
    const own = all.filter((p) => p.own).map((p) => esc(p.title)).join("、");
    const photos = all.filter((p) => !p.own).map((p) =>
      `<li>${esc(p.title)}：${esc(p.author)}／<a href="${esc(p.page)}" target="_blank" rel="noopener">Wikimedia Commons</a>（${esc(p.edit)}）</li>`).join("");
    $("creditsList").innerHTML = `
      <p class="note">以下照片依 <a href="${lic.url}" target="_blank" rel="noopener">${lic.name}</a> 授權使用；經縮放、裁切後的版本同樣以 ${lic.name} 釋出。</p>
      <ul>${photos}</ul>
      ${own ? `<p class="note">${own}：本團隊 2026 年 11 月實地拍攝，路人臉部與車牌已模糊處理。</p>` : ""}
      <p class="note">插畫、鳥瞰圖、正殿環景為本團隊繪製的示意圖，非實際比例。</p>
      <p class="note">導覽內容參考：邱民雄〈大茅埔泰興宮三山國王〉、徐登志〈犒將〉（教育部臺灣客語辭典）、《茅埔成庄》（臺中市文化局）、農業部〈我的幸福小地方〉、維基百科〈慶東泰興宮〉、東勢後生添手團〈泰興宮裝置藝術調查〉。</p>`;
  }
  $("creditsBtn").onclick = () => { renderCredits(); $("creditsSheet").hidden = false; };
  $("creditsClose").onclick = () => ($("creditsSheet").hidden = true);

  // ---------- 大茅埔總覽圖 ----------
  const OV = T.overview;
  $("ovImg").src = OV.image;
  $("ovWrap").style.setProperty("--ov-aspect", OV.aspect);
  $("ovGuideImg").src = T.guide.poses.point || T.guide.poses.default;
  $("ovSpeaker").textContent = T.guide.name;
  $("ovLine").textContent = fill(OV.say);
  {
    const t = document.createElement("button");
    t.className = "ov-temple";
    t.style.left = OV.temple.x + "%"; t.style.top = OV.temple.y + "%";
    t.textContent = OV.temple.label;
    t.onclick = showMap;
    $("ovWrap").appendChild(t);
    OV.camps.forEach((c) => {
      const b = document.createElement("button");
      b.className = "ov-camp";
      b.style.left = c.x + "%"; b.style.top = c.y + "%";
      b.setAttribute("aria-label", c.name);
      b.onclick = () => {
        $("campTitle").textContent = c.name;
        $("campDesc").textContent = c.desc || OV.campDesc;
        $("campSheet").hidden = false;
      };
      $("ovWrap").appendChild(b);
    });
  }
  $("campClose").onclick = () => ($("campSheet").hidden = true);

  let ovCentered = false;
  function showOverview() {
    show("overview");
    $("campSheet").hidden = true;
    if (ovCentered) return;
    const center = () => {
      const a = $("ovArea"), w = $("ovWrap").offsetWidth;
      if (!w) return;
      a.scrollLeft = Math.max(0, w * OV.focus / 100 - a.clientWidth / 2);
      ovCentered = true;
    };
    requestAnimationFrame(center);
    $("ovImg").addEventListener("load", center, { once: true });
  }

  // ---------- 鳥瞰地圖 ----------
  $("mapImg").src = T.map.image;
  $("mapWrap").style.setProperty("--map-aspect", T.map.aspect);
  $("mapGuideImg").src = T.guide.poses.default;
  $("mapSpeaker").textContent = T.guide.name;
  $("mapLine").textContent = fill(T.map.say);

  let pinStop = null;

  function showMap() {
    show("map");
    $("pinSheet").hidden = true;
    const done = new Set(loadStamps());
    const ready = T.stops.filter((s) => s.ready);
    const got = ready.filter((s) => done.has(s.id)).length;
    $("mapStamps").textContent = got === ready.length ? "🏅 完成卡" : `印章 ${got} / ${ready.length} ›`;
    $("mapStamps").classList.toggle("complete", got === ready.length);
    $("mapLine").textContent = fill(got === ready.length && T.map.doneSay ? T.map.doneSay : T.map.say);
    $("mapWrap").querySelectorAll(".pin").forEach((p) => p.remove());
    T.stops.forEach((s, i) => {
      if (!s.pin) return;
      const b = document.createElement("button");
      const state = done.has(s.id) ? "done" : s.ready ? "ready" : "soon";
      b.className = `pin ${state}`;
      b.style.left = s.pin.x + "%";
      b.style.top = s.pin.y + "%";
      b.innerHTML = `<span class="dot">${state === "done" ? "✓" : s.pin.n}</span><span class="tag">${s.title}</span>`;
      b.onclick = () => openPin(i);
      $("mapWrap").appendChild(b);
    });
  }

  function openPin(i) {
    const s = T.stops[i];
    pinStop = i;
    $("pinNo").textContent = s.pin.n;
    $("pinTitle").textContent = s.title;
    $("pinIntro").textContent = s.intro || "";
    const done = loadStamps().includes(s.id);
    $("pinGo").disabled = !s.ready;
    $("pinGo").textContent = !s.ready ? "製作中，敬請期待" : done ? "再看一次" : "進入導覽";
    $("pinSheet").hidden = false;
  }
  $("pinGo").onclick = () => { if (T.stops[pinStop].ready) startStop(pinStop); };
  $("pinClose").onclick = () => ($("pinSheet").hidden = true);

  // ---------- 導覽點 ----------
  function startStop(i) {
    stopIndex = i; step = 0; seen = new Set();
    const s = stop();
    show("stop");
    $("stopTitle").textContent = s.title;
    $("progress").textContent = s.pin ? `第 ${s.pin.n} 站` : "";
    ["stampLayer", "lookup", "sheet", "counter", "choice"].forEach((id) => ($(id).hidden = true));
    clearHotspots();
    destroyPano();
    currentImage = null;
    // 第一句有指定 image（例如先看實景照片）就直接開那張，不會先閃過長卷
    // 第一句是 scene: "pano" 的站（例如先看中庭環景），直接開環景
    const first = s.script[0]?.scene === "pano" && s.pano ? null : s.script[0]?.image || s.image;
    if (first) {
      showImage(first, () => playStep());
    } else {
      setScene("pano", s.script[0]?.focus);
      playStep();
    }
  }

  // ---------- 切換圖片（長卷、照片） ----------
  // step 加 image: "路徑" 可在同一站換成另一張圖；照片會自動顯示來源標示
  let currentImage = null;
  function showImage(src, onReady) {
    const img = $("sceneImg");
    const meta = T.photos?.[src];
    const vertical = meta?.fit === "width";
    currentImage = src;
    scene.classList.toggle("vertical", vertical);
    setScene("image");
    $("sceneHint").textContent = vertical ? "↑ 上下滑動看看 ↓" : "← 左右滑動看看 →";
    showCredit(meta);
    const inner = $("sceneInner");
    const done = () => { scene.scrollLeft = 0; scene.scrollTop = 0; inner.classList.remove("fading"); onReady?.(); };
    if (img.getAttribute("src") === src && img.complete) return done();
    inner.classList.add("fading");
    img.onload = done;
    img.onerror = done;
    img.alt = meta?.title || stop().title;
    img.src = src;
  }

  function showCredit(meta) {
    const el = $("credit");
    if (!meta) { el.hidden = true; return; }
    if (meta.own) {
      el.removeAttribute("href");
      el.textContent = "照片：團隊實地拍攝";
    } else {
      el.href = meta.page;
      el.textContent = `照片：${meta.author}／Wikimedia Commons／${T.photoLicense.name}`;
    }
    el.hidden = false;
  }

  function playStep() {
    const l = line();
    if (!l) return finishStop();
    setPose(l.pose);
    if (l.image && (l.image !== currentImage || sceneMode !== "image")) {
      clearHotspots();
      // 換圖要等圖片載入後，才能捲到 focus 的位置、放熱點
      return showImage(l.image, () => runStep(l, true));
    }
    runStep(l, false);
  }

  function runStep(l, imageJustChanged) {
    if (l.scene && l.scene !== sceneMode) {
      clearHotspots();
      showCredit(null);
      setScene(l.scene, l.focus);
    } else if (l.focus != null) {
      typeof l.focus === "object" ? panoLook(l.focus) : focusOn(l.focus, imageJustChanged);
    }

    mode = "talk";
    if (l.type === "quiz") {
      mode = "quiz";
      renderHotspots(stop().hotspots.filter((h) => l.choices.includes(h.id)), "?");
    } else if (l.type === "explore") {
      mode = "explore";
      renderHotspots(exploreTargets(), "");
      updateCounter();
    } else if (l.type === "choice") {
      mode = "choice";
      renderChoice(l);
    } else if (l.type === "lookup") {
      mode = "busy";
      $("lookupText").textContent = fill(l.say);
      $("lookup").hidden = false;
    }
    say(fill(l.say));
  }

  function next() {
    if (typing) return finishTyping();
    if (mode !== "talk") return;
    step++;
    playStep();
  }
  $("guidePanel").onclick = next;

  // ---------- 對話打字效果 ----------
  function say(text) {
    lineFull = text;
    const p = $("line");
    p.textContent = "";
    $("bubble").classList.toggle("waiting", mode !== "talk");
    $("guideImg").classList.remove("talk", "hop");
    void $("guideImg").offsetWidth;
    $("guideImg").classList.add("talk");
    let i = 0;
    clearInterval(typing);
    typing = setInterval(() => {
      p.textContent = text.slice(0, ++i);
      if (i >= text.length) finishTyping();
    }, 35);
  }
  function finishTyping() {
    clearInterval(typing); typing = null;
    $("line").textContent = lineFull;
  }

  function setPose(pose) {
    $("guideImg").src = T.guide.poses[pose] || T.guide.poses.default;
  }
  function cheer() {
    $("guideImg").classList.remove("talk", "hop");
    void $("guideImg").offsetWidth;
    $("guideImg").classList.add("hop");
  }

  // ---------- 場景捲動 ----------
  const scene = $("scene");
  // 橫式圖：pct 是水平位置；直式照片（上下滑動）：pct 是垂直位置
  function focusOn(pct, instant) {
    gyroPause(800);
    const behavior = instant ? "auto" : "smooth";
    if (scene.classList.contains("vertical")) {
      const h = $("sceneInner").scrollHeight;
      scene.scrollTo({ top: h * pct / 100 - scene.clientHeight / 2, behavior });
      return;
    }
    const w = $("sceneInner").scrollWidth;
    scene.scrollTo({ left: w * pct / 100 - scene.clientWidth / 2, behavior });
  }
  scene.addEventListener("scroll", () => $("sceneHint").classList.add("gone"), { passive: true });

  // ---------- 轉動手機看（陀螺儀） ----------
  // 以開啟當下的方向為基準：往右轉 → 畫面往右；轉約 ±45° 就能看到長卷兩端
  const gyro = { on: false, got: false, a0: null, base: 0, target: 0, pauseUntil: 0, raf: 0 };
  const DEG_RANGE = 90;

  function toast(msg, ms = 2600) {
    $("toast").textContent = msg;
    $("toast").hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => ($("toast").hidden = true), ms);
  }

  function gyroPause(ms) {
    gyro.pauseUntil = performance.now() + ms;
    gyro.a0 = null; // 暫停結束後，從當時的位置重新對準
  }

  function onOrientation(e) {
    if (e.alpha == null) return;
    gyro.got = true;
    if (!gyro.on || performance.now() < gyro.pauseUntil) return;
    if (gyro.a0 === null) { gyro.a0 = e.alpha; gyro.base = scene.scrollLeft; }
    const turnedLeft = ((e.alpha - gyro.a0 + 540) % 360) - 180; // alpha 往左轉會變大
    const range = scene.scrollWidth - scene.clientWidth;
    gyro.target = Math.max(0, Math.min(range, gyro.base - turnedLeft * range / DEG_RANGE));
  }

  function gyroLoop() {
    if (!gyro.on) return;
    if (sceneMode === "image" && !scene.classList.contains("vertical") && gyro.a0 !== null && performance.now() >= gyro.pauseUntil) {
      const cur = scene.scrollLeft;
      const next = cur + (gyro.target - cur) * 0.18;
      if (Math.abs(gyro.target - cur) > 0.5) scene.scrollLeft = next;
    }
    gyro.raf = requestAnimationFrame(gyroLoop);
  }

  async function setGyro(on) {
    if (on) {
      const DOE = window.DeviceOrientationEvent;
      if (!DOE) return toast("這台裝置不支援轉動感測，請用手指滑動");
      if (typeof DOE.requestPermission === "function") {
        try {
          if ((await DOE.requestPermission()) !== "granted") return toast("需要允許「動作與方向」才能轉動手機看");
        } catch { return toast("需要允許「動作與方向」才能轉動手機看"); }
      }
      window.addEventListener("deviceorientation", onOrientation);
      gyro.on = true; gyro.a0 = null; gyro.pauseUntil = 0;
      cancelAnimationFrame(gyro.raf); gyroLoop();
      toast("舉起手機，原地慢慢左右轉身看看！");
      setTimeout(() => {
        if (gyro.on && !gyro.got) { setGyro(false); toast("偵測不到手機轉動，請用手指滑動"); }
      }, 1500);
    } else {
      gyro.on = false;
      window.removeEventListener("deviceorientation", onOrientation);
      cancelAnimationFrame(gyro.raf);
    }
    $("gyroBtn").setAttribute("aria-pressed", String(gyro.on));
    renderGyroBtn();
    onGyroChange?.(gyro.on);
  }
  let onGyroChange = null;
  const PHONE_ICON = '<svg width="12" height="16" viewBox="0 0 12 16" aria-hidden="true"><rect x="1" y="1" width="10" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="6" cy="12.3" r="1" fill="currentColor"/></svg>';
  function renderGyroBtn() {
    $("gyroBtn").innerHTML = PHONE_ICON + (gyro.on ? "轉動中・點此關閉" : "轉動手機看");
  }
  renderGyroBtn();
  $("gyroBtn").onclick = () => setGyro(!gyro.on);
  // 手指滑動時暫停感測，放開後從新位置接續
  scene.addEventListener("touchstart", () => gyroPause(1e9), { passive: true });
  scene.addEventListener("touchend", () => gyroPause(150), { passive: true });

  // ---------- 360° 環景（Pannellum） ----------
  // 有 yaw / pitch 的熱點屬於環景；step 加 scene: "pano" 或 "image" 可在同一站切換場景
  let sceneMode = "image";
  let viewer = null;
  let panoDivs = {};

  function setScene(mode, focus) {
    sceneMode = mode;
    const pano = mode === "pano";
    scene.classList.toggle("pano-mode", pano);
    // 照片與環景滿版（標題列浮在上面）；插畫長卷的標題在圖上，標題列改回一般位置
    $("stop").classList.toggle("immersive", pano || !!T.photos?.[currentImage]);
    if (pano) { scene.classList.remove("vertical"); showCredit(T.photos?.[stop().pano]); }
    $("sceneInner").hidden = pano;
    $("pano").hidden = !pano;
    $("sceneHint").textContent = pano ? "拖曳畫面，或轉動手機看四周" : "← 左右滑動看看 →";
    $("sceneHint").classList.remove("gone");
    if (!pano) return;
    scene.scrollLeft = 0;
    const f = typeof focus === "object" && focus ? focus : { yaw: 0, pitch: 0 };
    if (viewer) return panoLook(f);
    if (!window.pannellum) { toast("環景元件載入失敗，請確認網路連線"); return; }
    // 半圈環景（手機全景模式拍的）：panoView 設定水平 / 垂直涵蓋角度，畫面不會轉出照片外
    const pv = stop().panoView;
    let fov = { hfov: 100, minHfov: 50, maxHfov: 115 };
    if (pv) {
      // 直式螢幕的上下視角比左右大，依螢幕比例算出不會露出照片上下邊界的最大左右視角
      const el = $("pano"), ar = (el.clientHeight || 600) / (el.clientWidth || 390);
      const rad = Math.PI / 180;
      const fit = 2 * Math.atan(Math.tan((pv.vaov / 2) * rad) / ar) / rad * 0.96;
      const h = Math.min(100, fit);
      fov = { hfov: h, minHfov: Math.min(30, h), maxHfov: h };
    }
    viewer = pannellum.viewer("pano", {
      type: "equirectangular",
      panorama: stop().pano,
      autoLoad: true,
      showControls: false,
      compass: false,
      ...fov,
      // 不用 avoidShowingBackground（Pannellum 2.5.6 搭配半圈環景會算出 NaN、畫面變黑），改用明確的上下左右邊界
      ...(pv ? { haov: pv.haov, vaov: pv.vaov, vOffset: pv.vOffset || 0,
        minYaw: -pv.haov / 2, maxYaw: pv.haov / 2, minPitch: -pv.vaov / 2, maxPitch: pv.vaov / 2 } : {}),
      yaw: f.yaw, pitch: f.pitch,
      hotSpots: [],
    });
    viewer.on("load", () => { if (gyro.on) viewer.startOrientation(); });
    const hideHint = () => $("sceneHint").classList.add("gone");
    viewer.on("mousedown", hideHint);
    viewer.on("touchstart", hideHint);
    // 手指拖曳會中斷轉動感測，放開後自動接續
    const resume = () => { if (gyro.on) setTimeout(() => viewer?.startOrientation(), 300); };
    viewer.on("mouseup", resume);
    viewer.on("touchend", resume);
  }

  function panoLook(f) {
    if (!viewer) return;
    try { viewer.lookAt(f.pitch ?? 0, f.yaw ?? 0, viewer.getHfov(), 900); } catch {}
  }

  function destroyPano() {
    panoDivs = {};
    if (viewer) { try { viewer.destroy(); } catch {} viewer = null; }
    $("pano").innerHTML = "";
  }

  onGyroChange = (on) => {
    if (!viewer || sceneMode !== "pano") return;
    try { on ? viewer.startOrientation() : viewer.stopOrientation(); } catch {}
  };

  // ---------- 熱點 ----------
  function clearHotspots() {
    $("sceneInner").querySelectorAll(".hotspot").forEach((h) => h.remove());
    if (viewer) Object.keys(panoDivs).forEach((id) => { try { viewer.removeHotSpot(id); } catch {} });
    panoDivs = {};
  }
  function renderHotspots(list, label) {
    clearHotspots();
    for (const h of list) {
      if (h.yaw != null) {
        if (!viewer) continue;
        viewer.addHotSpot({
          id: h.id, pitch: h.pitch, yaw: h.yaw,
          cssClass: "hotspot pano-hs" + (mode === "explore" && seen.has(h.id) ? " seen" : ""),
          createTooltipFunc: (div) => {
            div.innerHTML = `<span>${label}</span>`;
            div.setAttribute("aria-label", h.title);
            div.setAttribute("role", "button");
            panoDivs[h.id] = div;
          },
          clickHandlerFunc: (e) => { e.stopPropagation(); onHotspot(h, panoDivs[h.id]); },
        });
        continue;
      }
      // 只放屬於目前這張圖的熱點（沒寫 img 的熱點屬於這一站的主圖）
      if ((h.img || stop().image) !== currentImage) continue;
      const b = document.createElement("button");
      b.className = "hotspot" + (mode === "explore" && seen.has(h.id) ? " seen" : "");
      b.style.left = h.x + "%";
      b.style.top = h.y + "%";
      b.setAttribute("aria-label", h.title);
      b.innerHTML = `<span>${label}</span>`;
      b.onclick = (e) => { e.stopPropagation(); onHotspot(h, b); };
      $("sceneInner").appendChild(b);
    }
  }

  function onHotspot(h, el) {
    const l = line();
    if (mode === "quiz") {
      if (h.id === l.answer) {
        el.classList.add("right");
        mode = "talk";
        cheer();
        say(fill(l.right));
        openSheet(h);
        setTimeout(clearHotspots, 600);
      } else {
        el.classList.remove("wrong"); void el.offsetWidth; el.classList.add("wrong");
        say(fill(l.wrong));
        $("bubble").classList.add("waiting");
      }
    } else if (mode === "explore") {
      seen.add(h.id);
      el.classList.add("seen");
      openSheet(h);
      updateCounter();
    }
  }

  // 找細節：有寫 targets 就只用那幾個熱點，否則用所有 explore: true 的熱點
  function exploreTargets() {
    const t = line().targets;
    return t ? stop().hotspots.filter((h) => t.includes(h.id))
             : stop().hotspots.filter((h) => h.explore);
  }

  // ---------- 選擇題 ----------
  function renderChoice(l) {
    const box = $("choice");
    box.innerHTML = "";
    l.options.forEach((text, i) => {
      const b = document.createElement("button");
      b.textContent = text;
      b.onclick = () => {
        if (mode !== "choice") return;
        if (i === l.answer) {
          b.classList.add("right");
          mode = "talk";
          cheer();
          say(fill(l.right));
          setTimeout(() => (box.hidden = true), 700);
        } else {
          b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong");
          say(fill(l.wrong));
        }
      };
      box.appendChild(b);
    });
    box.hidden = false;
  }

  function updateCounter() {
    const need = exploreTargets();
    const got = need.filter((h) => seen.has(h.id)).length;
    $("sceneHint").classList.add("gone");
    $("counter").hidden = false;
    $("counter").textContent = `已發現 ${got} / ${need.length}`;
    if (got === need.length) {
      $("counter").textContent = "全部找到了！";
      mode = "talk";
      $("bubble").classList.remove("waiting");
    }
  }

  // ---------- 說明卡 ----------
  function openSheet(h) {
    $("sheetTitle").textContent = h.title;
    $("sheetDesc").textContent = h.desc;
    $("sheet").hidden = false;
  }
  $("sheetClose").onclick = () => {
    $("sheet").hidden = true;
    if (mode === "talk" && line()?.type === "explore") {
      cheer();
      say(fill(line().done || "厲害喔，細節都被你找到了！"));
      $("counter").hidden = true;
      clearHotspots();
    }
  };

  // ---------- 抬頭看 ----------
  $("lookupDone").onclick = () => {
    $("lookup").hidden = true;
    step++;
    playStep();
  };

  // ---------- 離線快取 ----------
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
    // 有新版離線快取接手時，自動重新整理一次，遊客就不會一直看到舊版
    // （第一次造訪沒有舊版，不需要重新整理）
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      location.reload();
    });
  }
  window.addEventListener("offline", () => toast("目前沒有網路，導覽會使用手機裡已存好的內容"));

  // ---------- 蓋章 ----------
  function finishStop() {
    mode = "busy";
    const s = stop();
    $("stampName").textContent = s.stamp;
    const got = saveStamp(s.id);
    const total = T.stops.filter((x) => x.ready).length;
    $("stampMsg").innerHTML = got >= total
      ? `🎉 恭喜！${total} 枚印章全部收集完成<br>謝謝你走完泰興宮！`
      : `已收集 <b>${got}</b> / ${total} 枚印章`;
    const complete = got >= total;
    if (complete && !store.get(DONE_KEY)) store.set(DONE_KEY, new Date().toISOString());
    $("cardFromStamp").hidden = !complete;
    $("toMapBtn").className = complete ? "btn ghost" : "btn primary";
    $("toMapBtn").textContent = complete ? "回到地圖" : "回到地圖，選下一站";
    $("stampLayer").hidden = false;
  }

  // ---------- 求藥籤（文化體驗，不顯示藥方） ----------
  const Y = T.yaoqian;
  const zhNum = (n) => {
    const d = "零一二三四五六七八九";
    if (n === 100) return "一百";
    if (n < 10) return d[n];
    const t = Math.floor(n / 10), o = n % 10;
    return (t === 1 ? "十" : d[t] + "十") + (o ? d[o] : "");
  };
  const TUBE_SVG = `<svg class="tube" viewBox="0 0 160 230" aria-hidden="true">
    ${[30, 44, 58, 72, 86, 100, 114, 128].map((x, i) =>
      `<rect x="${x - 4}" y="${8 + (i % 3) * 9}" width="8" height="120" rx="3" fill="${i % 2 ? "#e2bd72" : "#cfa257"}"/>`).join("")}
    <path d="M18 70 h124 l-8 150 a8 8 0 0 1 -8 8 h-92 a8 8 0 0 1 -8 -8 z" fill="#7a1712"/>
    <path d="M18 70 h124 l-1.2 18 h-121.6 z" fill="#a3241b"/>
    <rect x="22" y="196" width="116" height="10" fill="#5a100c"/>
    <rect x="52" y="104" width="56" height="78" rx="4" fill="#f4e7c8"/>
    <text x="80" y="136" text-anchor="middle" font-family="Noto Serif TC, serif" font-weight="900" font-size="26" fill="#7a1712">藥</text>
    <text x="80" y="168" text-anchor="middle" font-family="Noto Serif TC, serif" font-weight="900" font-size="26" fill="#7a1712">籤</text>
  </svg>`;
  // 筊杯：flat = 平面朝上，round = 凸面朝上
  const jiaoSvg = (face, cls) => `<svg class="jiao ${cls}" viewBox="0 0 120 70" aria-hidden="true">
    <path d="M6 58 C14 2, 106 2, 114 58 C92 46, 28 46, 6 58 Z"
      fill="${face === "flat" ? "#d9573f" : "#9b2418"}" stroke="#4a0d08" stroke-width="2.5" stroke-linejoin="round"/>
    ${face === "flat"
      ? `<path d="M20 50 C28 16, 92 16, 100 50 C82 42, 38 42, 20 50 Z" fill="#f0b48f" opacity=".55"/>`
      : `<path d="M28 30 C40 14, 70 10, 86 18" stroke="#fff" stroke-opacity=".4" stroke-width="6" fill="none" stroke-linecap="round"/>`}
  </svg>`;

  let qian = { kind: null, num: 0, fails: 0, introStep: 0 };
  const qSay = (s) => ($("qianLine").textContent = s);
  const qStage = (html) => ($("qianStage").innerHTML = html);

  function openQian() {
    qian = { kind: null, num: 0, fails: 0, introStep: 0 };
    $("qianGuide").src = T.guide.poses.wave || T.guide.poses.default;
    $("qianSpeaker").textContent = T.guide.name;
    $("qianLayer").hidden = false;
    qianIntro();
  }
  function qianIntro() {
    const last = qian.introStep >= Y.intro.length - 1;
    qSay(Y.intro[qian.introStep]);
    qStage(`${TUBE_SVG}<button class="btn primary" id="qNext">${last ? "我要求籤" : "繼續聽"}</button>`);
    $("qNext").onclick = () => {
      if (last) return qianPick();
      qian.introStep++;
      $("qianGuide").src = T.guide.poses.default;
      qianIntro();
    };
  }
  function qianPick() {
    $("qianGuide").src = T.guide.poses.point || T.guide.poses.default;
    qSay("先選要抽哪一種籤。");
    qStage(`${TUBE_SVG}<div class="qian-kinds">${Y.kinds.map((k) =>
      `<button data-k="${k.id}">${k.label}<small>${k.sub}</small></button>`).join("")}</div>`);
    $("qianStage").querySelectorAll("[data-k]").forEach((b) => {
      b.onclick = () => { qian.kind = Y.kinds.find((k) => k.id === b.dataset.k); qianShake(); };
    });
  }
  function qianShake() {
    $("qianGuide").src = T.guide.poses.default;
    qSay(Y.shakeSay);
    qStage(`${TUBE_SVG}<button class="btn primary" id="qShake">搖籤筒</button>`);
    $("qShake").onclick = () => {
      $("qShake").disabled = true;
      $("qianStage").querySelector(".tube").classList.add("shaking");
      setTimeout(() => {
        qian.num = 1 + Math.floor(Math.random() * 100);
        const label = `${qian.kind.name}第${zhNum(qian.num)}首`;
        qSay(Y.jiaoSay);
        $("qianGuide").src = T.guide.poses.think || T.guide.poses.default;
        qStage(`<div class="stick">${label}</div>
          <p class="qian-num">抽到：${label}</p>
          <button class="btn primary" id="qJiao">擲筊</button>`);
        $("qJiao").onclick = qianJiao;
      }, 1250);
    };
  }
  function qianJiao() {
    // 擲兩次沒擲到聖筊，第三次一定是聖筊，免得遊客卡太久
    const r = qian.fails >= 2 ? "sheng" : ["sheng", "sheng", "xiao", "yin"][Math.floor(Math.random() * 4)];
    const faces = r === "sheng" ? (Math.random() < .5 ? ["flat", "round"] : ["round", "flat"])
                : r === "xiao" ? ["flat", "flat"] : ["round", "round"];
    qStage(`<div class="jiao-pair">${jiaoSvg(faces[0], "toss a")}${jiaoSvg(faces[1], "toss b")}</div>
      <p class="jiao-result" id="qRes"></p><div id="qAct"></div>`);
    setTimeout(() => {
      const j = Y.jiao[r];
      $("qRes").innerHTML = `<b>${j.name}</b>${j.desc}`;
      if (r === "sheng") {
        $("qianGuide").src = T.guide.poses.happy || T.guide.poses.default;
        $("qAct").innerHTML = `<button class="btn primary" id="qShow">看籤</button>`;
        $("qShow").onclick = qianResult;
      } else {
        qian.fails++;
        $("qAct").innerHTML = `<button class="btn primary" id="qAgain">重抽一支</button>`;
        $("qAgain").onclick = qianShake;
      }
    }, 900);
  }
  function qianResult() {
    const bless = Y.blessings[(qian.num - 1) % Y.blessings.length];
    qSay(Y.resultSay);
    qStage(`<div class="qian-paper">
        <h3>第${zhNum(qian.num)}首</h3>
        <p class="kind">${qian.kind.name}藥籤</p>
        <p class="bless">${bless}</p>
        <p class="note">${Y.disclaimer}</p>
      </div>
      <button class="btn primary" id="qRedo">再抽一支</button>
      <button class="btn ghost" id="qBack">回到地圖</button>`);
    $("qRedo").onclick = () => { qian.fails = 0; qianPick(); };
    $("qBack").onclick = () => ($("qianLayer").hidden = true);
  }
  // 藥籤因法規不公開（2026-11-10 下架）；這套搖籤、擲筊畫面之後改給果籤用
  if (Y) { $("qianBtn").hidden = false; $("qianBtn").onclick = openQian; }
  $("qianClose").onclick = () => ($("qianLayer").hidden = true);

  // ---------- 集章卡（canvas 畫成 PNG，可分享或存檔） ----------
  const DONE_KEY = "templego-complete";
  const NAME_KEY = "templego-name";
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const CW = 1080, CH = 1350;
  const SERIF = '"Noto Serif TC", serif', SANS = '"Noto Sans TC", sans-serif';
  let card = { blob: null, url: null, token: 0 };

  const loadImg = (src) => new Promise((res) => {
    const im = new Image();
    im.onload = () => res(im); im.onerror = () => res(null);
    im.src = src;
  });
  const fmtDate = (d) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  function rrect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  function drawStamp(g, x, y, r, deg, word, seed) {
    g.save(); g.translate(x, y); g.rotate(deg * Math.PI / 180);
    const ink = "rgba(200,42,32,.92)";
    g.fillStyle = "rgba(217,56,44,.07)"; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
    g.strokeStyle = ink;
    g.lineWidth = 9; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r - 16, 0, 7); g.stroke();
    g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `700 24px ${SERIF}`; g.fillText("泰 興 宮", 0, -r * 0.56);
    g.font = `900 ${word.length > 2 ? 54 : 72}px ${SERIF}`; g.fillText(word, 0, 4);
    g.font = `700 22px ${SERIF}`; g.fillText("到 此 一 遊", 0, r * 0.56);
    // 印泥斑駁感：用紙色點掉一些（固定亂數，每次畫都一樣）
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    g.fillStyle = "rgba(251,245,233,.55)";
    for (let i = 0; i < 70; i++) {
      const a = rnd() * 6.283, d = rnd() * (r + 6);
      g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, 1 + rnd() * 3.2, 0, 7); g.fill();
    }
    g.restore();
  }
  function drawEmpty(g, x, y, r, n) {
    g.save();
    g.strokeStyle = "#cdbda6"; g.lineWidth = 4; g.setLineDash([14, 12]);
    g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
    g.fillStyle = "#cdbda6"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `900 72px ${SERIF}`; g.fillText(String(n), x, y + 4);
    g.restore();
  }

  async function renderCard() {
    const token = ++card.token;
    const ready = T.stops.filter((s) => s.ready);
    const done = new Set(loadStamps());
    const got = ready.filter((s) => done.has(s.id)).length;
    const complete = got === ready.length;
    const name = $("cardName").value.trim();
    const doneAt = store.get(DONE_KEY);
    const date = complete && doneAt ? new Date(doneAt) : new Date();

    const title = "泰興宮 集章卡";
    const sub = complete ? `${ready.length} 站全部走完，印章收集完成！` : `已收集 ${got} / ${ready.length} 枚印章`;
    const say = complete ? ["謝謝你走完泰興宮，", "歡迎再來大茅埔坐坐！"]
                         : [`還有 ${ready.length - got} 站等你，`, "走完再來領完成卡！"];
    const who = `${name || "旅人"} 到此一遊`;
    const labels = ready.map((s) => s.title.split("・")[0]);
    const allText = [title, sub, ...say, who, ...labels, ...ready.map((s) => s.stamp),
      "泰興宮到此一遊台中東勢大茅埔手機導覽完成—0123456789./", T.guide.name].join("");
    try {
      await Promise.all([
        document.fonts.load(`900 80px "Noto Serif TC"`, allText),
        document.fonts.load(`600 40px "Noto Serif TC"`, allText),
        document.fonts.load(`500 30px "Noto Sans TC"`, allText),
      ]);
    } catch {}
    const guide = await loadImg(T.guide.poses[complete ? "happy" : "default"] || T.guide.poses.default);
    if (token !== card.token) return;

    const c = document.createElement("canvas"); c.width = CW; c.height = CH;
    const g = c.getContext("2d");
    // 底：紅框＋米色紙＋金線
    g.fillStyle = "#7a1712"; g.fillRect(0, 0, CW, CH);
    g.fillStyle = "#fbf5e9"; rrect(g, 36, 36, CW - 72, CH - 72, 28); g.fill();
    g.save(); rrect(g, 36, 36, CW - 72, CH - 72, 28); g.clip();

    g.textAlign = "center"; g.textBaseline = "alphabetic";
    g.fillStyle = "#6d5c4f"; g.font = `500 30px ${SANS}`;
    g.fillText("台中・東勢・大茅埔", CW / 2, 140);
    g.fillStyle = "#7a1712"; g.font = `900 92px ${SERIF}`;
    g.fillText(title, CW / 2, 250);
    g.fillStyle = "#1d1410"; g.font = `500 34px ${SANS}`;
    g.fillText(sub, CW / 2, 318);

    // 印章：每排最多 3 個
    const r = 118, rows = [], degs = [-9, 6, -4, 8, -6, 4];
    for (let i = 0; i < ready.length; i += 3) rows.push(ready.slice(i, i + 3));
    rows.forEach((row, ri) => {
      const y = 510 + ri * 300;
      row.forEach((s, j) => {
        const i = ri * 3 + j;
        const x = CW / 2 + (j - (row.length - 1) / 2) * 300;
        if (done.has(s.id)) drawStamp(g, x, y, r, degs[i % degs.length], s.stamp, i + 1);
        else drawEmpty(g, x, y, r, s.pin?.n || i + 1);
        g.fillStyle = done.has(s.id) ? "#1d1410" : "#a8977f";
        g.textAlign = "center"; g.textBaseline = "alphabetic";
        g.font = `600 32px ${SERIF}`; g.fillText(labels[i], x, y + r + 52);
      });
    });

    // 志永哥＋對話框
    const baseY = CH - 60;
    if (guide) {
      const h = 330, w = h * guide.width / guide.height;
      g.drawImage(guide, 250 - w / 2, baseY - h, w, h);
    }
    const bx = 430, by = 1004, bw = 570, bh = 150;
    g.fillStyle = "#fff"; g.strokeStyle = "#7a1712"; g.lineWidth = 4;
    rrect(g, bx, by, bw, bh, 26); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(bx + 2, by + 60); g.lineTo(bx - 30, by + 88); g.lineTo(bx + 2, by + 96);
    g.fill(); g.beginPath(); g.moveTo(bx, by + 60); g.lineTo(bx - 30, by + 88); g.lineTo(bx, by + 96); g.stroke();
    g.textAlign = "left"; g.fillStyle = "#1d1410"; g.font = `600 36px ${SERIF}`;
    g.fillText(say[0], bx + 32, by + 64); g.fillText(say[1], bx + 32, by + 116);

    g.fillStyle = "#7a1712"; g.font = `900 46px ${SERIF}`;
    g.fillText(who, bx + 4, 1222, bw);
    g.fillStyle = "#6d5c4f"; g.font = `500 28px ${SANS}`;
    g.fillText(`${fmtDate(date)}${complete ? " 完成" : ""}　｜　泰興宮手機導覽`, bx + 4, 1268, bw);
    g.restore();

    // 金色內框
    g.strokeStyle = "#e3b54a"; g.lineWidth = 4; rrect(g, 54, 54, CW - 108, CH - 108, 18); g.stroke();

    const blob = await new Promise((res) => c.toBlob(res, "image/png"));
    if (token !== card.token || !blob) return;
    if (card.url) URL.revokeObjectURL(card.url);
    card.blob = blob; card.url = URL.createObjectURL(blob);
    $("cardImg").src = card.url;
    const file = new File([blob], "泰興宮集章卡.png", { type: "image/png" });
    $("cardShare").hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
  }

  function openCard() {
    $("cardName").value = store.get(NAME_KEY) || "";
    $("cardLayer").hidden = false;
    renderCard();
  }
  let nameTimer = null;
  $("cardName").oninput = () => {
    clearTimeout(nameTimer);
    nameTimer = setTimeout(() => { store.set(NAME_KEY, $("cardName").value.trim()); renderCard(); }, 350);
  };
  $("mapStamps").onclick = openCard;
  $("cardFromStamp").onclick = openCard;
  $("cardClose").onclick = () => ($("cardLayer").hidden = true);
  $("cardSave").onclick = () => {
    if (!card.url) return;
    const a = document.createElement("a");
    a.href = card.url; a.download = "泰興宮集章卡.png";
    document.body.appendChild(a); a.click(); a.remove();
  };
  $("cardShare").onclick = async () => {
    if (!card.blob) return;
    const file = new File([card.blob], "泰興宮集章卡.png", { type: "image/png" });
    try {
      await navigator.share({ files: [file], title: "泰興宮集章卡", text: "我在台中東勢大茅埔泰興宮集章！" });
    } catch (e) {
      if (e.name !== "AbortError") toast("這支手機不支援直接分享，請改用「存成圖片」");
    }
  };
})();
