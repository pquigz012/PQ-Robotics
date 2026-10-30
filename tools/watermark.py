#!/usr/bin/env python3
"""PQ Robotics photo watermark: the company logo inside a white ring, bottom-right.

Usage:
  python3 tools/watermark.py PHOTO [PHOTO ...]            # stamps in place
  python3 tools/watermark.py --safe-16x9 PHOTO ...        # for photos shown in 16:9 thumbnails
  python3 tools/watermark.py --out stamped/ PHOTO ...     # write copies instead

Only run it once per photo; it doesn't detect an existing badge.
Needs Pillow:  pip install pillow
"""
import argparse, os
from PIL import Image, ImageDraw, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(HERE, "..", "assets", "images", "pq-robotics-logo-1024.png")
SIZE = 0.09   # badge diameter as a share of the visible short side
PAD  = 0.03   # gap from the edges, same basis


def badge(d):
    S = d * 4; ring = max(4, int(S * 0.035)); gap = max(3, int(S * 0.02))
    out = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    m = Image.new("L", (S, S), 0); ImageDraw.Draw(m).ellipse((0, 0, S - 1, S - 1), fill=255)
    out.paste((255, 255, 255, 240), (0, 0), m)
    inner = S - 2 * ring
    disc = Image.new("L", (S, S), 0)
    ImageDraw.Draw(disc).ellipse((ring, ring, ring + inner - 1, ring + inner - 1), fill=255)
    out.paste((13, 22, 39, 255), (0, 0), disc)
    L = inner - 2 * gap
    lg = Image.open(LOGO).convert("RGBA").resize((L, L), Image.LANCZOS)
    clip = Image.new("L", (L, L), 0); ImageDraw.Draw(clip).ellipse((0, 0, L - 1, L - 1), fill=255)
    lg.putalpha(Image.composite(lg.split()[3], Image.new("L", (L, L), 0), clip))
    out.alpha_composite(lg, (ring + gap, ring + gap))
    return out.resize((d, d), Image.LANCZOS)


def stamp(img, safe_16x9=False, size=SIZE, pad=PAD):
    img = ImageOps.exif_transpose(img).convert("RGBA")
    W, H = img.size
    vis_h, crop_y = H, 0
    if safe_16x9 and H > W * 9 / 16:            # taller than 16:9: thumbnails crop top and bottom
        vis_h = round(W * 9 / 16); crop_y = (H - vis_h) // 2
    short = min(W, vis_h)
    d = max(48, round(short * size)); p = round(short * pad)
    x = W - p - d; y = H - crop_y - p - d
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    shm = Image.new("L", img.size, 0)
    ImageDraw.Draw(shm).ellipse((x, y + max(2, d // 40), x + d, y + d + max(2, d // 40)), fill=150)
    sh.putalpha(shm.filter(ImageFilter.GaussianBlur(max(3, d // 14))))
    img = Image.alpha_composite(img, sh)
    img.alpha_composite(badge(d), (x, y))
    return img


def save(img, path, like):
    ext = os.path.splitext(path)[1].lower()
    if ext in (".jpg", ".jpeg"):
        img.convert("RGB").save(path, quality=90, optimize=True, progressive=True)
    elif ext == ".png" and like.mode in ("RGB", "P", "L"):
        img.convert("RGB").save(path, optimize=True)
    else:
        img.save(path, optimize=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("photos", nargs="+")
    ap.add_argument("--safe-16x9", action="store_true", help="keep the badge inside a centered 16:9 crop")
    ap.add_argument("--out", help="folder for stamped copies (default: overwrite)")
    a = ap.parse_args()
    for src in a.photos:
        im = Image.open(src)
        dst = os.path.join(a.out, os.path.basename(src)) if a.out else src
        if a.out: os.makedirs(a.out, exist_ok=True)
        save(stamp(im, a.safe_16x9), dst, im)
        print("stamped", dst)
