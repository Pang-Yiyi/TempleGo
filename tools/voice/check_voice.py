# 用語音辨識把 assets/voice/*.mp3 轉回文字，跟原句比對拼音，列出可能念錯的句子
# 用法：tools/voice/.venv/Scripts/python.exe tools/voice/check_voice.py  → tools/voice/work/check.md
import json, os, re, difflib
import _env
import soundfile as sf, torch
from pypinyin import lazy_pinyin
from transformers import pipeline
from make_voice_text import speak_text

lines = json.load(open(os.path.join(_env.HERE, "lines.json"), encoding="utf-8"))
asr = pipeline("automatic-speech-recognition", model="openai/whisper-large-v3-turbo", dtype=torch.float16, device="cuda:0")
py = lambda s: lazy_pinyin(re.sub(r"[^\u4e00-\u9fff]", "", s))
rows = []
for l in lines:
    x, sr = sf.read(os.path.join(_env.ROOT, "assets", "voice", l["hash"] + ".mp3"), dtype="float32")
    got = asr({"raw": x, "sampling_rate": sr}, generate_kwargs={"language": "zh"})["text"]
    a, b = py(speak_text(l["text"])), py(got)
    score = difflib.SequenceMatcher(None, a, b).ratio()
    rows.append((score, l["hash"], l["text"], got, len(x) / sr))
rows.sort()
md = ["# 語音檢查（拼音相似度低的排前面）", "", "| 相似度 | 秒 | 編號 | 原句 | 辨識結果 |", "|---|---|---|---|---|"]
md += [f"| {s:.2f} | {d:.1f} | {h} | {t} | {g} |" for s, h, t, g, d in rows]
open(os.path.join(_env.WORK, "check.md"), "w", encoding="utf-8").write("\n".join(md))
for s, h, t, g, d in rows[:25]:
    print(f"{s:.2f} {d:4.1f}s {h} {t} || {g}")
print("below 0.8:", sum(r[0] < 0.8 for r in rows), "/", len(rows))
