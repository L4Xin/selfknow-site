"""
Subset Noto Sans SC to only the chars we need for type cards.

Usage:
  pip install fonttools brotli
  # 下载 NotoSansSC-Bold.otf 从 https://fonts.google.com/noto/specimen/Noto+Sans+SC
  # 放到 scripts/NotoSansSC-Bold.otf
  python scripts/subset-font.py
"""
import sys
from pathlib import Path
from fontTools.subset import Subsetter, Options
from fontTools.ttLib import TTFont

CHARS = set()

# 8 类型名 + 标语
LABELS = [
    "热情主导", "你是被点燃的人",
    "隐藏火种", "光还没亮起，但燃料已就位",
    "舒适专家", "扎根的人有最深的视野",
    "观察者", "你看世界，世界也在被你看见",
    "多面探索", "边界对你不是问题",
    "中间地带", "克制是一种被低估的力量",
    "热情中立", "温度刚好，不烫手",
    "沉淀蓄势", "地下的根比地上的枝长",
]
for s in LABELS:
    CHARS.update(s)

CHARS.update("认识自我")
CHARS.update("你的认知地图")
CHARS.update("selfknow.site")
CHARS.update("0123456789")
CHARS.update(".,;:!?'\"-—()/")

print(f"Subset: {len(CHARS)} chars")
print(f"Sample: {''.join(sorted(CHARS)[:30])}...")

src_otf = Path(__file__).parent / "NotoSansSC-Bold.otf"
src_ttf = Path(__file__).parent / "NotoSansSC-Bold.ttf"
src = src_otf if src_otf.exists() else src_ttf
if not src.exists():
    print(f"ERROR: neither {src_otf} nor {src_ttf} found.")
    print(f"Download from: https://fonts.google.com/noto/specimen/Noto+Sans+SC")
    sys.exit(1)

dst = Path(__file__).parent.parent / "public" / "fonts" / "noto-sans-sc-subset.woff"
dst.parent.mkdir(parents=True, exist_ok=True)

font = TTFont(str(src))
options = Options(flavor="woff")
sub = Subsetter(options=options)
sub.populate(text="".join(CHARS))
sub.subset(font)
font.flavor = "woff"
font.save(str(dst))

src_size = src.stat().st_size
dst_size = dst.stat().st_size
print(f"Done: {src_size//1024}KB → {dst_size//1024}KB ({dst_size*100//src_size}%)")
print(f"  Output: {dst}")
