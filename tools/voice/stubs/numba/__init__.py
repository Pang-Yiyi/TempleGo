# 假的 numba：Windows「智慧型應用程式控制」會擋掉 numba/llvmlite 沒簽章的 DLL。
# librosa 只是在 import 時用 numba 裝飾函式；F5-TTS 用到的部分（梅爾濾波器）是純 numpy，不需要真的 JIT。
# 只在 tools/voice 的腳本裡把這個資料夾放到 sys.path 最前面時才會用到。
import builtins

def _deco(*a, **k):
    if len(a) == 1 and callable(a[0]) and not k:
        return a[0]
    return lambda f: f

jit = njit = vectorize = guvectorize = stencil = generated_jit = _deco
prange = builtins.range
uint = int
__version__ = "0.0-stub"
