# 用 F5-TTS 模仿志永哥的聲音，把 lines.json 每一句產生成 assets/voice/<hash>.mp3，並寫 assets/voice/index.json
# 用法：
#   node tools/voice/collect_lines.js                          先更新台詞清單
#   tools/voice/.venv/Scripts/python.exe tools/voice/make_voice.py      已經有的檔案會跳過
#   ... make_voice.py --force <hash> <hash>                    重新產生指定句子（換 seed）
# 樣本：tools/voice/ref/zhiyong.wav（2026-11-08 現場錄音 IMG_6352 107.95–111.98 秒）＋ zhiyong.txt（樣本逐字稿，要跟聲音一字不差）
import json, os, re, subprocess, sys, tempfile
import _env; _env.stub_datasets(); _env.patch_torchaudio()
import numpy as np, soundfile as sf
from f5_tts.api import F5TTS

HERE = _env.HERE
REF = os.path.join(HERE, "ref", "zhiyong.wav")
REF_TEXT = open(os.path.join(HERE, "ref", "zhiyong.txt"), encoding="utf-8").read().strip()
OUT = os.path.join(_env.ROOT, "assets", "voice")
SPEED = 1.0
os.makedirs(OUT, exist_ok=True)

from make_voice_text import speak_text

lines = json.load(open(os.path.join(HERE, "lines.json"), encoding="utf-8"))
force = set(sys.argv[sys.argv.index("--force") + 1:]) if "--force" in sys.argv else set()
tts = F5TTS(model="F5TTS_v1_Base")

def trim(x, sr, th=0.02, pad=0.12):
    idx = np.where(np.abs(x) > th)[0]
    if not len(idx): return x
    a, b = max(0, idx[0] - int(pad * sr)), min(len(x), idx[-1] + int(pad * sr))
    return x[a:b]

done = 0
for i, l in enumerate(lines):
    mp3 = os.path.join(OUT, l["hash"] + ".mp3")
    if os.path.exists(mp3) and l["hash"] not in force:
        continue
    seed = 7 + (100 if l["hash"] in force else 0)
    wav, sr, _ = tts.infer(ref_file=REF, ref_text=REF_TEXT, gen_text=speak_text(l["text"]), seed=seed,
                           speed=SPEED, remove_silence=False, show_info=lambda *a: None)
    wav = trim(np.asarray(wav, dtype="float32"), sr)
    wav = wav / (np.abs(wav).max() + 1e-9) * 0.89
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as t:
        sf.write(t.name, wav, sr)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", t.name, "-ac", "1", "-ar", "24000", "-b:a", "48k", mp3], check=True)
    os.remove(t.name)
    done += 1
    print(f"[{i + 1}/{len(lines)}] {l['hash']} {l['text']}", flush=True)

have = sorted(l["hash"] for l in lines if os.path.exists(os.path.join(OUT, l["hash"] + ".mp3")))
json.dump(have, open(os.path.join(OUT, "index.json"), "w", encoding="utf-8"))
print("generated", done, "| index.json:", len(have), "of", len(lines))
