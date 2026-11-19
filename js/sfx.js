// 求籤音效
// 搖籤、出籤（同一段搖籤錄音裡的單聲）、擲筊、翻紙用真實錄音（assets/sfx/，Freesound CC0，來源見「照片與資料來源」）；
// 磬聲用 Web Audio 合成。錄音還沒載入完時，先用合成的聲音代替
// SfxKit(ctx, out, noise, buf) 回傳一組函式，每個都吃「從幾秒開始」t（AudioContext 時間）；buf 是載入好的錄音
window.SfxKit = (c, out, noise, buf = {}) => {
  const rnd = (a, b) => a + Math.random() * (b - a);
  // shake.mp3 裡比較響的單聲「喀」的起點（秒）；每擺一下籤筒就播其中一聲，跟畫面對齊
  const HITS = [.103, .422, .758, .948, 1.073, 1.375, 1.7, 2.031];
  const grain = (t, vol) => sample("shake", t, { from: HITS[Math.floor(Math.random() * HITS.length)], dur: .13, vol });

  // 正在播的錄音：換畫面時要能收掉，免得上一段的尾巴拖到下一個畫面
  const playing = new Set();
  // 播一段錄音；沒載入就回傳 false
  function sample(name, t, { from = 0, dur = 0, vol = 1 } = {}) {
    const b = buf[name];
    if (!b) return false;
    const src = c.createBufferSource(); src.buffer = b;
    const g = c.createGain();
    const item = { src, g };
    playing.add(item);
    src.onended = () => playing.delete(item);
    g.gain.setValueAtTime(vol, t);
    if (dur) { g.gain.setValueAtTime(vol, t + Math.max(0, dur - .05)); g.gain.linearRampToValueAtTime(0, t + dur); }
    src.connect(g).connect(out);
    dur ? src.start(t, from, dur + .01) : src.start(t, from);
    return true;
  }

  // 一次敲擊：modes = [[頻率, Q, 音量], ...]
  function hit(t, modes, vol, { len = .004, click = 0 } = {}) {
    const src = c.createBufferSource(); src.buffer = noise;
    const ex = c.createGain();
    ex.gain.setValueAtTime(vol, t);
    ex.gain.exponentialRampToValueAtTime(.0001, t + len);
    src.connect(ex);
    for (const [f, q, v] of modes) {
      const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = q;
      const g = c.createGain(); g.gain.value = v * Math.sqrt(q) * 3;   // Q 越高通過的能量越少，補回來
      ex.connect(bp).connect(g).connect(out);
    }
    if (click) {   // 硬東西碰到地板那一下「喀」
      const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3500;
      const g = c.createGain(); g.gain.value = click;
      ex.connect(hp).connect(g).connect(out);
    }
    src.start(t, rnd(0, .5), len + .01);
  }
  function tone(t, f, dur, vol) {
    const o = c.createOscillator(); o.frequency.value = f;
    const g = c.createGain();
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + .004);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(out);
    o.start(t); o.stop(t + dur + .05);
  }
  function hiss(t, dur, { type = "bandpass", f = 3000, f2 = 0, q = 1, vol = .5, atk = .003 } = {}) {
    const src = c.createBufferSource(); src.buffer = noise;
    const flt = c.createBiquadFilter(); flt.type = type; flt.Q.value = q;
    flt.frequency.setValueAtTime(f, t);
    if (f2) flt.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + atk);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.connect(flt).connect(g).connect(out);
    src.start(t, rnd(0, .5), dur + .05);
  }

  // 一根竹籤：細竹片，聲音偏高、很短
  const stick = (f) => [[f, 14, 1], [f * 1.58, 11, .5], [f * 2.4, 8, .25]];
  // 筊：中空的木頭，聲音比較厚
  const block = (f) => [[f, 10, 1], [f * 2.3, 11, .55], [f * 3.9, 8, .3]];

  return {
    // 收掉還在播（或排好還沒播）的錄音
    hush(t) {
      for (const { src, g } of playing) {
        try { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + .04); src.stop(t + .05); } catch {}
      }
      playing.clear();
    },
    // 搖一下籤筒：籤筒換方向時一群竹籤撞在一起（前面最密），加上撞到筒壁的低一點的聲音
    // power 0~1：搖得越用力，碰撞越多、越大聲
    rattle(t, power = .5) {
      if (grain(t, .55 + power * .45)) return;
      const n = Math.round(8 + power * 14);
      for (let i = 0; i < n; i++) {
        const dt = .13 * Math.pow(Math.random(), 1.8);
        hit(t + dt, stick(rnd(1900, 4300)), rnd(.25, 1) * (.6 + power * .4) * (1 - dt * 3));
      }
      for (let i = 0; i < 2 + Math.round(power * 2); i++) {
        hit(t + rnd(0, .05), [[rnd(380, 460), 6, 1], [rnd(1000, 1200), 9, .45]], rnd(.5, .9) * (.6 + power * .4));
      }
    },
    // 點的抽籤：籤筒左右擺（CSS tubeShake 每 .14 秒擺到底一次，共 8 次），每擺到底響一聲
    rattleRun(t, secs) {
      for (let k = 1; k <= 8 && k * .14 <= secs + .001; k++) {
        if (!grain(t + k * .14 + .01, rnd(.7, 1))) this.rattle(t + k * .14 + .01, .5);
      }
    },
    // 在供桌上點籤筒：籤筒底座「叩」一聲（木頭聲濾掉高音，聽起來比筊悶），竹籤跟著晃（CSS 晃 5 下，每 .14 秒）
    pick(t) {
      if (buf.jiao) {
        const src = c.createBufferSource(); src.buffer = buf.jiao;
        const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400;
        const g = c.createGain();
        g.gain.setValueAtTime(1.1, t); g.gain.setValueAtTime(1.1, t + .1); g.gain.linearRampToValueAtTime(0, t + .14);
        src.connect(lp).connect(g).connect(out);
        src.start(t, 0, .15);
      } else hit(t, [[420, 6, 1], [1100, 9, .45]], .8);
      for (let k = 1; k <= 5; k++) grain(t + k * .14 + .01, rnd(.22, .34));
    },
    // 一支籤掉到桌上：用搖籤錄音裡竹籤的「喀」（比筊輕、比較尖，才不會聽成擲筊），落地一聲、彈起再落一聲
    // 時間對齊 CSS stickDrop：t 落地，t + .234 第二次落地
    drop(t) {
      if (sample("shake", t - .005, { from: .758, dur: .12, vol: 1 })) {
        sample("shake", t + .229, { from: 1.073, dur: .1, vol: .45 });
        return;
      }
      const f = rnd(1600, 1800);
      [[0, 1], [.065, .45], [.11, .25], [.145, .12]].forEach(([d, v], i) => {
        hit(t + d, stick(f * rnd(.97, 1.03)), v * 1.6, { click: i ? 0 : .6 });
      });
      hit(t, [[240, 4, .5]], .6);   // 桌面「咚」一點點
    },
    // 一片筊落地：重重一下，接著越彈越快、越小，最後在地上晃幾下
    land(t, f = 700) {
      const bounces = [[0, 1], [.17, .55], [.28, .4], [.355, .28], [.405, .2], [.44, .14]];
      bounces.forEach(([d, v], i) => hit(t + d, block(f * rnd(.98, 1.02)), v * 1.9, { click: v * .6, len: i ? .003 : .006 }));
      for (let k = 0; k < 4; k++) hit(t + .47 + k * .028, block(f), (.1 - k * .02) * 1.9);
    },
    // 一對筊：兩片差一點點落地
    pair(t) {
      // 錄音（約 1 秒，用木頭落地聲排成）：第一片 0 秒落地、第二片 0.11 秒，第一片 0.50 秒彈一下、0.60 和 0.83 秒在地上晃（CSS tossA／tossB 照這個排）
      if (sample("jiao", t)) return;
      this.land(t, rnd(660, 720)); this.land(t + .08, rnd(760, 820)); },
    // 聖筊：磬聲「噹～」（不成諧音的泛音，餘音長）
    bell(t) {
      const f = 988;
      [[1, .32, 3], [2.76, .1, 1.6], [5.4, .045, .8], [8.9, .02, .4]].forEach(([r, v, d]) => tone(t, f * r, d, v));
      tone(t, f * 1.004, 2.6, .12);   // 稍微走音的第二層，聽起來會「嗡」
      hiss(t, .02, { f: 4000, q: 2, vol: .15 });
    },
    // 笑筊、陰筊：低一點、短一點，不做成「失敗」的聲音
    soft(t) {
      tone(t, 523, .6, .2);
      tone(t, 523 * 2.76, .25, .05);
    },
    // 籤詩攤開：翻紙「唰」（錄音 0.68 秒，最響在 0.46 秒）
    paper(t) {
      if (sample("paper", t, { vol: .9 })) return;
      hiss(t, .3, { f: 900, f2: 5200, q: .7, vol: .3, atk: .07 });
      hiss(t + .05, .18, { type: "highpass", f: 3500, vol: .1, atk: .04 });
    },
  };
};
