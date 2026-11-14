# 台詞的念法（數字改國字）；make_voice.py 與 check_voice.py 共用
import re

DIG = "零一二三四五六七八九"
def num_zh(n):  # 1–99
    n = int(n)
    if n < 10: return DIG[n]
    t, o = divmod(n, 10)
    return ("十" if t == 1 else DIG[t] + "十") + (DIG[o] if o else "")

def speak_text(s):
    """只改念法，不改檔名（檔名用原句雜湊）。"""
    s = re.sub(r"（\d{4}）", "", s)                                     # 道光二年（1822）→ 不念西元
    s = re.sub(r"[「」『』“”]", "", s)                                  # 引號不念，留著反而會讓模型亂停頓
    s = s.replace("吧？", "！")                                         # 「很好記吧？」去掉吧變成問句會怪，改肯定語氣
    s = re.sub(r"[喔啦呢吧啊呀耶哦囉嘛唷哇](?=[，。！？、]|$)", "", s)          # 句尾語助詞不念（AI 念起來很假）；「嗎」是問句要留
    s = s.replace("921", "九二一")
    s = re.sub(r"(\d{4}) ?年", lambda m: "".join(DIG[int(c)] for c in m.group(1)) + "年", s)
    s = re.sub(r"(第|民國) ?(\d{1,2}) ?", lambda m: m.group(1) + num_zh(m.group(2)), s)
    return re.sub(r" +", "", s)
