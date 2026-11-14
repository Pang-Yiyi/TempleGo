# 把 素材/語音/原始音訊/*.wav 轉成有時間軸的文字，輸出 tools/voice/work/transcripts.json 與 .md
# 用法：tools/voice/.venv/Scripts/python.exe tools/voice/transcribe.py
import glob, json, os
import _env
import torch, soundfile as sf, numpy as np
from transformers import pipeline

src = sorted(glob.glob(os.path.join(_env.ROOT, "素材", "語音", "原始音訊", "*.wav")))
asr = pipeline("automatic-speech-recognition", model="openai/whisper-large-v3-turbo",
               torch_dtype=torch.float16, device="cuda:0")
out, md = {}, ["# 現場錄音逐字稿（自動辨識，可能有錯字）", ""]
for f in src:
    audio, sr = sf.read(f, dtype="float32")
    r = asr({"raw": audio, "sampling_rate": sr}, return_timestamps=True, chunk_length_s=30, batch_size=8,
            generate_kwargs={"language": "zh", "task": "transcribe"})
    segs = [{"start": c["timestamp"][0], "end": c["timestamp"][1], "text": c["text"].strip()} for c in r["chunks"]]
    name = os.path.basename(f)
    out[name] = segs
    md += [f"## {name}", ""] + [f"- `{s['start']:.1f}–{(s['end'] or 0):.1f}` {s['text']}" for s in segs] + [""]
    print(name, len(segs), "segments")
json.dump(out, open(os.path.join(_env.WORK, "transcripts.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(_env.WORK, "transcripts.md"), "w", encoding="utf-8").write("\n".join(md))
