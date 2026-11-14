# 共用設定：載入假 numba、專案路徑
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "stubs"))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
WORK = os.path.join(HERE, "work")
os.makedirs(WORK, exist_ok=True)

def stub_datasets():
    """F5-TTS 的訓練程式會 import datasets（需要被擋掉的 pyarrow DLL）；只做推論用不到，先放一個空殼。"""
    import types
    m = types.ModuleType("datasets")
    class Dataset: pass
    m.Dataset = Dataset
    m.load_from_disk = lambda *a, **k: None
    sys.modules.setdefault("datasets", m)

def patch_torchaudio():
    """torchaudio 2.9 的 load/save 改用 torchcodec，它的 DLL 也會被擋；改用 soundfile 讀寫。"""
    import torch, torchaudio, soundfile as sf
    def load(path, *a, **k):
        x, sr = sf.read(path, dtype="float32", always_2d=True)
        return torch.from_numpy(x.T.copy()), sr
    def save(path, wav, sr, *a, **k):
        sf.write(path, wav.detach().cpu().numpy().T, sr)
    torchaudio.load, torchaudio.save = load, save
