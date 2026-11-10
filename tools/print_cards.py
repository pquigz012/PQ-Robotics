#!/usr/bin/env python3
"""Print-ready PQ Robotics cards with QR codes.

Makes three PDFs in --out (default ~/PQ Print):
  crash-less-card_10up.pdf   "Crash less" card for every repaired drone (front + back sheets, Avery 8371 / 5371 layout)
  review-card_10up.pdf       Google review card that doubles as a business card (front + back sheets)
  counter-sign_5x7.pdf       5 x 7 in counter sign with the review QR code

Business cards are 3.5 x 2 in. The 10-up sheets match Avery 8371/5371 (letter, 0.5 in top, 0.75 in sides).
Print page 1, flip the sheet on the long edge, print page 2 on the back.

Usage:  python3 tools/print_cards.py --discount 25
Needs:  pip install reportlab
"""
import argparse
from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

NAVY = HexColor("#0d1a33")
RED = HexColor("#e53935")
PAPER = HexColor("#f6f3ec")
MUTED = Color(13 / 255, 26 / 255, 51 / 255, alpha=0.62)
LOGO = Path(__file__).resolve().parent.parent / "assets" / "images" / "pq-robotics-logo-512.png"

REVIEW_URL = "https://g.page/r/CZclEzNK8hfgEBM/review"
LESSON_URL = "https://pq-robotics.com/drone-classes-atlanta.html#contact"
SITE = "pq-robotics.com"
PHONE = "(404) 408-9063"
ADDRESS = "6059 Boylston Dr NE, Atlanta, GA 30328"

CW, CH = 3.5 * inch, 2 * inch


def qr(c, url, x, y, size, dark=NAVY):
    w = QrCodeWidget(url, barLevel="M")
    w.barFillColor = dark
    w.barStrokeColor = dark
    b = w.getBounds()
    bw, bh = b[2] - b[0], b[3] - b[1]
    d = Drawing(size, size, transform=[size / bw, 0, 0, size / bh, 0, 0])
    d.add(w)
    renderPDF.draw(d, c, x, y)


def spaced(c, x, y, text, font, size, gap, color, align="left"):
    c.setFont(font, size)
    c.setFillColor(color)
    width = sum(c.stringWidth(ch, font, size) for ch in text) + gap * (len(text) - 1)
    if align == "center":
        x -= width / 2
    elif align == "right":
        x -= width
    for ch in text:
        c.drawString(x, y, ch)
        x += c.stringWidth(ch, font, size) + gap


def wordmark(c, x, y, size, on_dark):
    w = sum(c.stringWidth(ch, "Helvetica-Bold", size) for ch in "PQ ") + size * 0.25 * 2
    spaced(c, x, y, "PQ ", "Helvetica-Bold", size, size * 0.25, white if on_dark else NAVY)
    spaced(c, x + w + size * 0.25, y, "ROBOTICS", "Helvetica-Bold", size, size * 0.25, RED)


def cross(c, cx, cy, arm, t, color):
    c.setFillColor(color)
    c.rect(cx - t / 2, cy - arm, t, arm * 2, stroke=0, fill=1)
    c.rect(cx - arm, cy - t / 2, arm * 2, t, stroke=0, fill=1)


# ---------- card faces (drawn with the card's lower-left corner at 0,0) ----------

def crash_front(c, discount):
    c.setFillColor(NAVY); c.rect(0, 0, CW, CH, stroke=0, fill=1)
    cross(c, CW - 30, CH - 30, 14, 5, Color(229 / 255, 57 / 255, 53 / 255, alpha=0.9))
    spaced(c, 16, CH - 28, "DRONE HOSPITAL", "Helvetica-Bold", 7, 1.6, RED)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 21)
    c.drawString(16, CH - 62, "Back in the air.")
    c.setFillColor(Color(1, 1, 1, alpha=0.78)); c.setFont("Helvetica", 13)
    c.drawString(16, CH - 80, "Let's keep it there.")
    c.setStrokeColor(Color(1, 1, 1, alpha=0.25)); c.setLineWidth(0.6); c.line(16, 34, CW - 16, 34)
    wordmark(c, 16, 18, 8, on_dark=True)
    c.setFillColor(Color(1, 1, 1, alpha=0.7)); c.setFont("Helvetica", 7.5)
    c.drawRightString(CW - 16, 18, f"Flip for ${discount} off a lesson")


def crash_back(c, discount):
    c.setFillColor(PAPER); c.rect(0, 0, CW, CH, stroke=0, fill=1)
    # left: the lesson offer
    spaced(c, 14, CH - 22, "PQ ROBOTICS EDUCATION", "Helvetica-Bold", 6, 1.3, RED)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 22)
    c.drawString(14, CH - 48, f"${discount} off")
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(14, CH - 61, "your first flight lesson")
    c.setFillColor(MUTED); c.setFont("Helvetica", 7)
    c.drawString(14, CH - 74, "A 90-minute private lesson")
    c.drawString(14, CH - 83, "to keep it out of the trees.")
    qr(c, LESSON_URL, 12, 9, 42)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 6.5)
    c.drawString(60, 34, "SCAN TO BOOK")
    c.setFillColor(MUTED); c.setFont("Helvetica", 6.5)
    c.drawString(60, 25, "Mention code")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 7)
    c.drawString(60, 16, "CRASHLESS")
    # divider, then the review ask (separate from the discount on purpose)
    c.setStrokeColor(Color(13 / 255, 26 / 255, 51 / 255, alpha=0.25)); c.setLineWidth(0.6)
    c.line(CW / 2 + 8, 12, CW / 2 + 8, CH - 12)
    spaced(c, CW - 14, CH - 22, "HOW DID WE DO?", "Helvetica-Bold", 6, 1.3, NAVY, align="right")
    qr(c, REVIEW_URL, CW - 14 - 62, CH - 96, 62)
    c.setFillColor(MUTED); c.setFont("Helvetica", 6.8)
    c.drawRightString(CW - 14, CH - 106, "Scan to leave a Google review.")
    c.drawRightString(CW - 14, CH - 115, "It helps other pilots find us.")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 7)
    c.drawRightString(CW - 14, 12, PHONE)


def review_front(c, _):
    c.setFillColor(PAPER); c.rect(0, 0, CW, CH, stroke=0, fill=1)
    c.setFillColor(NAVY); c.rect(0, 0, 8, CH, stroke=0, fill=1)
    spaced(c, 22, CH - 24, "THANK YOU FOR FLYING WITH US", "Helvetica-Bold", 6, 1.3, RED)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 16)
    c.drawString(22, CH - 50, "How did we do?")
    c.setFillColor(MUTED); c.setFont("Helvetica", 8)
    for i, line in enumerate(["A quick Google review takes a", "minute and helps other drone", "pilots in Atlanta find us.",
                              "Tell people what we did for you."]):
        c.drawString(22, CH - 70 - i * 10.5, line)
    qr(c, REVIEW_URL, CW - 14 - 76, 24, 76)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 6.5)
    c.drawCentredString(CW - 14 - 38, 13, "SCAN TO REVIEW")


def review_back(c, _):
    c.setFillColor(NAVY); c.rect(0, 0, CW, CH, stroke=0, fill=1)
    if LOGO.exists():
        c.drawImage(str(LOGO), 16, CH - 62, 44, 44, mask="auto")
    wordmark(c, 70, CH - 34, 11, on_dark=True)
    c.setFillColor(Color(1, 1, 1, alpha=0.7)); c.setFont("Helvetica", 7.5)
    c.drawString(70, CH - 48, "Drone Hospital  ·  PQ Robotics Education")
    c.setStrokeColor(Color(1, 1, 1, alpha=0.22)); c.setLineWidth(0.6); c.line(16, 64, CW - 16, 64)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 12)
    c.drawString(16, 44, PHONE)
    c.setFillColor(Color(1, 1, 1, alpha=0.75)); c.setFont("Helvetica", 7.5)
    c.drawString(16, 30, ADDRESS)
    c.drawString(16, 18, f"{SITE}  ·  Repairs  ·  Lessons  ·  Part 107 classes")


# ---------- sheets ----------

def sheet(path, front, back, arg):
    c = canvas.Canvas(str(path), pagesize=letter)
    W, H = letter
    left, top = 0.75 * inch, 0.5 * inch
    for face, mirror in ((front, False), (back, True)):
        for row in range(5):
            for col in range(2):
                # backs are mirrored left-right so they line up after a long-edge flip
                cx = col if not mirror else 1 - col
                x = left + cx * CW
                y = H - top - (row + 1) * CH
                c.saveState(); c.translate(x, y)
                p = c.beginPath(); p.rect(0, 0, CW, CH); c.clipPath(p, stroke=0)
                face(c, arg)
                c.restoreState()
        # light cut guides in the margins
        c.setStrokeColor(Color(0, 0, 0, alpha=0.35)); c.setLineWidth(0.3)
        for i in range(6):
            y = H - top - i * CH
            c.line(0.2 * inch, y, 0.6 * inch, y); c.line(W - 0.6 * inch, y, W - 0.2 * inch, y)
        for x in (left, left + CW, left + 2 * CW):
            c.line(x, H - 0.4 * inch, x, H - 0.1 * inch); c.line(x, 0.1 * inch, x, 0.4 * inch)
        c.showPage()
    c.save()


def counter_sign(path):
    W, H = 5 * inch, 7 * inch
    c = canvas.Canvas(str(path), pagesize=(W, H))
    c.setFillColor(PAPER); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(NAVY); c.rect(0, H - 1.25 * inch, W, 1.25 * inch, stroke=0, fill=1)
    if LOGO.exists():
        c.drawImage(str(LOGO), 0.4 * inch, H - 1.02 * inch, 0.8 * inch, 0.8 * inch, mask="auto")
    wordmark(c, 1.4 * inch, H - 0.62 * inch, 15, on_dark=True)
    c.setFillColor(Color(1, 1, 1, alpha=0.72)); c.setFont("Helvetica", 9)
    c.drawString(1.4 * inch, H - 0.86 * inch, "Drone Hospital  ·  PQ Robotics Education")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(W / 2, H - 1.95 * inch, "How did we do?")
    c.setFillColor(MUTED); c.setFont("Helvetica", 12)
    c.drawCentredString(W / 2, H - 2.3 * inch, "Scan to leave a Google review.")
    c.drawCentredString(W / 2, H - 2.52 * inch, "It takes a minute and helps other pilots find us.")
    size = 2.5 * inch
    qr(c, REVIEW_URL, (W - size) / 2, 1.05 * inch, size)
    cross(c, W - 0.5 * inch, 0.55 * inch, 9, 3.2, RED)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(W / 2, 0.62 * inch, PHONE + "  ·  " + SITE)
    c.showPage(); c.save()


def main():
    ap = argparse.ArgumentParser(description="Make print-ready PQ Robotics QR cards.")
    ap.add_argument("--discount", type=int, default=25, help="Dollar discount on the first lesson (crash-less card)")
    ap.add_argument("--out", default=str(Path.home() / "PQ Print"))
    a = ap.parse_args()
    out = Path(a.out).expanduser(); out.mkdir(parents=True, exist_ok=True)
    sheet(out / "crash-less-card_10up.pdf", crash_front, crash_back, a.discount)
    sheet(out / "review-card_10up.pdf", review_front, review_back, None)
    counter_sign(out / "counter-sign_5x7.pdf")
    for f in sorted(out.glob("*.pdf")):
        print(f)


if __name__ == "__main__":
    main()
