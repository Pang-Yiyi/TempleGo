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
  $("introGuide").src = T.guide.poses.default;
  $("speaker").textContent = T.guide.name;
  $("guideImg").src = T.guide.poses.default;
  $("guideImg").alt = T.guide.name;

  const show = (id) => {
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
  };

  $("startBtn").onclick = showMap;
  $("mapHomeBtn").onclick = () => show("intro");
  $("homeBtn").onclick = () => { clearInterval(typing); typing = null; destroyPano(); showMap(); };
  $("replayBtn").onclick = () => startStop(stopIndex);
  $("toMapBtn").onclick = showMap;

  // ---------- 照片與資料來源 ----------
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function renderCredits() {
    const lic = T.photoLicense;
    const photos = Object.values(T.photos || {}).map((p) =>
      `<li>${esc(p.title)}：${esc(p.author)}／<a href="${esc(p.page)}" target="_blank" rel="noopener">Wikimedia Commons</a>（${esc(p.edit)}）</li>`).join("");
    $("creditsList").innerHTML = `
      <p class="note">以下照片依 <a href="${lic.url}" target="_blank" rel="noopener">${lic.name}</a> 授權使用；經縮放、裁切後的版本同樣以 ${lic.name} 釋出。</p>
      <ul>${photos}</ul>
      <p class="note">插畫、鳥瞰圖、正殿環景為本團隊繪製的示意圖，非實際比例。</p>
      <p class="note">導覽內容參考：邱民雄〈大茅埔泰興宮三山國王〉、徐登志〈犒將〉（教育部臺灣客語辭典）、《茅埔成庄》（臺中市文化局）、農業部〈我的幸福小地方〉、維基百科〈慶東泰興宮〉、東勢後生添手團〈泰興宮裝置藝術調查〉。</p>`;
  }
  $("creditsBtn").onclick = () => { renderCredits(); $("creditsSheet").hidden = false; };
  $("creditsClose").onclick = () => ($("creditsSheet").hidden = true);

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
    $("mapStamps").textContent = `印章 ${got} / ${ready.length}`;
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
    if (s.image) {
      showImage(s.image, () => playStep());
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
    const done = () => { scene.scrollLeft = 0; scene.scrollTop = 0; onReady?.(); };
    if (img.getAttribute("src") === src && img.complete) return done();
    img.onload = done;
    img.alt = meta?.title || stop().title;
    img.src = src;
  }

  function showCredit(meta) {
    const el = $("credit");
    if (!meta) { el.hidden = true; return; }
    el.href = meta.page;
    el.textContent = `照片：${meta.author}／Wikimedia Commons／${T.photoLicense.name}`;
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
    if (pano) scene.classList.remove("vertical");
    $("sceneInner").hidden = pano;
    $("pano").hidden = !pano;
    $("sceneHint").textContent = pano ? "拖曳畫面，或轉動手機看四周" : "← 左右滑動看看 →";
    $("sceneHint").classList.remove("gone");
    if (!pano) return;
    scene.scrollLeft = 0;
    const f = typeof focus === "object" && focus ? focus : { yaw: 0, pitch: 0 };
    if (viewer) return panoLook(f);
    if (!window.pannellum) { toast("環景元件載入失敗，請確認網路連線"); return; }
    viewer = pannellum.viewer("pano", {
      type: "equirectangular",
      panorama: stop().pano,
      autoLoad: true,
      showControls: false,
      compass: false,
      hfov: 100, minHfov: 50, maxHfov: 115,
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
    $("toMapBtn").textContent = got >= total ? "回到地圖" : "回到地圖，選下一站";
    $("stampLayer").hidden = false;
  }
})();
