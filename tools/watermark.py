#!/usr/bin/env python3
"""PQ Robotics / Drone Hospital photo watermark.

Smoked-glass badge in the bottom-right corner: the photo behind it is blurred and
darkened, with DRONE HOSPITAL around the ring and the PQ Robotics logo inside.
The badge artwork lives in assets/images/watermark-badge.png.

Usage:
  python3 tools/watermark.py PHOTO [PHOTO ...]          # stamps in place
  python3 tools/watermark.py --safe-16x9 PHOTO ...      # photos shown in 16:9 thumbnails
  python3 tools/watermark.py --out stamped/ PHOTO ...   # write copies instead

Run it once per photo; it doesn't detect an existing badge.
Needs Pillow:  pip install pillow
"""
import argparse, os
from PIL import Image, ImageDraw, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
BADGE = os.path.join(HERE, "..", "assets", "images", "watermark-badge.png")
SIZE = 0.20   # badge diameter as a share of the visible short side
PAD = 0.03    # gap from the edges, same basis


def stamp(img, safe_16x9=False, size=SIZE, pad=PAD):
    img = ImageOps.exif_transpose(img).convert("RGBA")
    W, H = img.size
    vis_h, crop_y = H, 0
    if safe_16x9 and H > W * 9 / 16:          # thumbnails crop the top and bottom of taller photos
        vis_h = round(W * 9 / 16); crop_y = (H - vis_h) // 2
    short = min(W, vis_h)
    d = max(64, round(short * size)); p = round(short * pad)
    x, y = W - p - d, H - crop_y - p - d

    # soft drop shadow
    shm = Image.new("L", img.size, 0)
    off = max(2, d // 40)
    ImageDraw.Draw(shm).ellipse((x, y + off, x + d, y + d + off), fill=90)
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0)); sh.putalpha(shm.filter(ImageFilter.GaussianBlur(max(4, d // 20))))
    img = Image.alpha_composite(img, sh)

    # frosted backdrop: blur the photo under the badge, clipped to the circle
    region = img.crop((x, y, x + d, y + d)).filter(ImageFilter.GaussianBlur(max(2, d * 0.05)))
    k = 4; m = Image.new("L", (d * k, d * k), 0); ImageDraw.Draw(m).ellipse((0, 0, d * k - 1, d * k - 1), fill=255)
    img.paste(region, (x, y), m.resize((d, d), Image.LANCZOS))

    # glass, ring text and logo
    img.alpha_composite(Image.open(BADGE).convert("RGBA").resize((d, d), Image.LANCZOS), (x, y))
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
