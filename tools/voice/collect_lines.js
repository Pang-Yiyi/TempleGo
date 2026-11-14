// 收集網站上志永哥會「說」的每一句話，拆成句子，輸出錄音稿／語音產生清單
// 用法：node tools/voice/collect_lines.js  → 產生 tools/voice/lines.json 與 tools/voice/錄音稿.md
// 語音檔用句子內容的雜湊命名（assets/voice/<hash>.mp3），台詞改了雜湊就會變，網站會自動找不到舊檔、改成不出聲
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.join(__dirname, "..", "..");
const window = {};
eval(fs.readFileSync(path.join(root, "js", "data.js"), "utf8"));
const T = window.TOUR;
const fill = (s) => s.replaceAll("{name}", T.guide.name);

// 跟 js/app.js 的 splitSentences 一樣：在 。！？ 後面切開（引號、括號跟著前一句）
function splitSentences(text) {
  const out = [];
  let cur = "";
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    cur += chars[i];
    if ("。！？".includes(chars[i])) {
      while (i + 1 < chars.length && "」』）)".includes(chars[i + 1])) cur += chars[++i];
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
const hash = (s) => crypto.createHash("sha1").update(s, "utf8").digest("hex").slice(0, 12);

const lines = [];   // { where, text }
const add = (where, text) => { if (text && !text.includes("{")) lines.push({ where, text: fill(text) }); };

add("總覽圖", T.overview?.say);
add("地圖", T.map.say);
add("地圖（全部走完）", T.map.doneSay);
// 只配音總覽圖、鳥瞰圖和全部走完；進到各站以後只看文字

// 拆句、去重複
const seen = new Map();
for (const l of lines) {
  for (const sent of splitSentences(l.text)) {
    const h = hash(sent);
    if (!seen.has(h)) seen.set(h, { hash: h, text: sent, where: [l.where] });
    else seen.get(h).where.push(l.where);
  }
}
const list = [...seen.values()];
fs.writeFileSync(path.join(__dirname, "lines.json"), JSON.stringify(list, null, 1), "utf8");
const md = ["# 志永哥語音：錄音稿／產生清單", "", `共 ${list.length} 句，${list.reduce((n, x) => n + [...x.text].length, 0)} 字。`, "",
  "| # | 編號 | 句子 | 出現在 |", "|---|---|---|---|",
  ...list.map((x, i) => `| ${i + 1} | ${x.hash} | ${x.text} | ${x.where[0]}${x.where.length > 1 ? ` 等 ${x.where.length} 處` : ""} |`)];
fs.writeFileSync(path.join(__dirname, "錄音稿.md"), md.join("\n") + "\n", "utf8");
console.log(list.length, "sentences");
