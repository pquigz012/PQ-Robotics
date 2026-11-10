#!/usr/bin/env python3
"""Make a printable PQ Robotics gift certificate (PDF) and log it.

Examples:
  python3 tools/gift_certificate.py --to "Alex" --gift first-flight
  python3 tools/gift_certificate.py --to "Jordan Lee" --from "Mom & Dad" --gift flight-week --message "Happy birthday, pilot!"
  python3 tools/gift_certificate.py --to "Sam" --gift amount --amount 120

Certificates and the log (certificates.csv) are saved OUTSIDE the website folder,
in ~/PQ Gift Certificates by default, so customer names never end up on GitHub.
Needs: pip install reportlab
"""
import argparse
import csv
import datetime as dt
import secrets
from pathlib import Path

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas

GIFTS = {
    "first-flight":   ("First-Flight Lesson", 149, "90-minute private drone lesson"),
    "coaching-3":     ("Coaching 3-Pack", 285, "Three one-hour private coaching sessions"),
    "flight-week":    ("Flight Week", 495, "Five-day beginner drone course"),
    "build":          ("Guided Drone Build", 299, "About six hours of build instruction. Parts quoted separately at cost"),
    "p107-in-person": ("Part 107 Prep, In Person", 399, "One-day FAA Part 107 test prep at the shop. FAA exam fee not included"),
    "p107-online":    ("Part 107 Prep, Live Online", 199, "Two live online Part 107 sessions. FAA exam fee not included"),
    "bundle":         ("License + First Flight", 499, "In-person Part 107 prep plus a First-Flight Lesson. FAA exam fee not included"),
    "amount":         ("Gift Certificate", None, "Good toward any lesson, course, build or Drone Hospital repair"),
}

NAVY = HexColor("#0d1a33")
RED = HexColor("#e53935")
PAPER = HexColor("#f6f3ec")
MUTED = Color(13 / 255, 26 / 255, 51 / 255, alpha=0.6)
LINE = Color(13 / 255, 26 / 255, 51 / 255, alpha=0.35)

LOGO = Path(__file__).resolve().parent.parent / "assets" / "images" / "pq-robotics-logo-512.png"


def make_code(today):
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O or 1/I
    return f"PQ-{today:%y%m}-" + "".join(secrets.choice(alphabet) for _ in range(4))


def plus_years(d, years):
    try:
        return d.replace(year=d.year + years)
    except ValueError:  # Feb 29
        return d.replace(year=d.year + years, day=28)


def spaced(c, x, y, text, font, size, gap, color, align="left"):
    """Letter-spaced text, like the site's uppercase labels."""
    c.setFont(font, size)
    c.setFillColor(color)
    width = sum(c.stringWidth(ch, font, size) for ch in text) + gap * (len(text) - 1)
    if align == "right":
        x -= width
    elif align == "center":
        x -= width / 2
    for ch in text:
        c.drawString(x, y, ch)
        x += c.stringWidth(ch, font, size) + gap
    return width


def draw(path, to, frm, gift_name, value, detail, message, code, issued, expires):
    W, H = landscape(letter)
    c = canvas.Canvas(str(path), pagesize=(W, H))
    c.setTitle(f"PQ Robotics gift certificate {code}")
    c.setAuthor("PQ Technologies LLC")

    # paper and double frame
    c.setFillColor(PAPER); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setStrokeColor(NAVY); c.setLineWidth(2); c.rect(28, 28, W - 56, H - 56)
    c.setStrokeColor(LINE); c.setLineWidth(0.8); c.rect(36, 36, W - 72, H - 72)

    # faint red cross watermark
    L, R = 72, W - 72
    top = H - 86

    c.saveState()
    c.setFillColor(Color(229 / 255, 57 / 255, 53 / 255, alpha=0.09))
    cx, cy, arm, t = R - 52, top - 118, 46, 16
    c.rect(cx - t / 2, cy - arm, t, arm * 2, stroke=0, fill=1)
    c.rect(cx - arm, cy - t / 2, arm * 2, t, stroke=0, fill=1)
    c.restoreState()

    # header: logo, wordmark, label
    if LOGO.exists():
        c.drawImage(str(LOGO), L, top - 34, 46, 46, mask="auto")
    w = spaced(c, L + 60, top - 4, "PQ ", "Helvetica-Bold", 13, 3.2, NAVY)
    spaced(c, L + 60 + w + 3, top - 4, "ROBOTICS", "Helvetica-Bold", 13, 3.2, RED)
    spaced(c, L + 60, top - 24, "EDUCATION  ·  ATLANTA, GEORGIA", "Helvetica", 8, 2, MUTED)

    label = "GIFT CERTIFICATE"
    c.setFont("Helvetica-Bold", 10)
    lw = sum(c.stringWidth(ch, "Helvetica-Bold", 10) for ch in label) + 2.4 * (len(label) - 1)
    c.setStrokeColor(NAVY); c.setLineWidth(1.2)
    c.rect(R - lw - 24, top - 22, lw + 24, 26)
    spaced(c, R - 12, top - 13, label, "Helvetica-Bold", 10, 2.4, NAVY, align="right")

    c.setStrokeColor(NAVY); c.setLineWidth(2.5); c.line(L, top - 52, R, top - 52)

    # title and gift
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 40)
    c.drawString(L, top - 112, "You're cleared for takeoff.")
    c.setFillColor(RED); c.setFont("Helvetica-Bold", 24)
    c.drawString(L, top - 148, gift_name)
    c.setFillColor(MUTED); c.setFont("Helvetica", 11.5)
    c.drawString(L, top - 168, detail)

    # for / from / value lines
    def field(x, y, width, lab, val, size=20):
        spaced(c, x, y + 30, lab, "Helvetica", 8, 2, MUTED)
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", size); c.drawString(x, y + 8, val)
        c.setStrokeColor(LINE); c.setLineWidth(0.8); c.line(x, y, x + width, y)

    row = top - 236
    col = (R - L - 60) / 3
    field(L, row, col, "FOR", to)
    field(L + col + 30, row, col, "FROM", frm or "")
    field(L + 2 * (col + 30), row, col, "VALUE", f"${value:,.0f}")

    if message:
        c.setFillColor(NAVY); c.setFont("Helvetica-Oblique", 14)
        c.drawString(L, row - 40, f"“{message}”")

    # footer: how to book, code, dates
    base = 92
    spaced(c, L, base + 30, "TO BOOK, CALL OR TEXT", "Helvetica", 8, 2, MUTED)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 15)
    c.drawString(L, base + 10, "(404) 408-9063")
    c.setFont("Helvetica", 10); c.setFillColor(MUTED)
    c.drawString(L, base - 6, "6059 Boylston Dr NE, Atlanta, GA 30328  ·  pq-robotics.com")

    spaced(c, R, base + 30, "CERTIFICATE CODE", "Helvetica", 8, 2, MUTED, align="right")
    spaced(c, R, base + 9, code, "Courier-Bold", 17, 2.2, NAVY, align="right")
    c.setFont("Helvetica", 10); c.setFillColor(MUTED)
    c.drawRightString(R, base - 6, f"Issued {issued:%b %d, %Y}  ·  Valid through {expires:%b %d, %Y}")

    c.setFont("Helvetica", 7.5); c.setFillColor(MUTED)
    c.drawCentredString(W / 2, 46, "Good toward any PQ Robotics Education service or Drone Hospital repair of equal value. "
                                   "Not redeemable for cash. Issued by PQ Technologies LLC.")
    c.showPage(); c.save()


def main():
    ap = argparse.ArgumentParser(description="Make a PQ Robotics gift certificate PDF.")
    ap.add_argument("--to", required=True, help="Recipient name")
    ap.add_argument("--from", dest="frm", default="", help="Who it's from, as printed")
    ap.add_argument("--gift", required=True, choices=sorted(GIFTS), help="Which gift")
    ap.add_argument("--amount", type=float, help="Dollar value, for --gift amount (or to override)")
    ap.add_argument("--message", default="", help="Short message (about 70 characters fits best)")
    ap.add_argument("--buyer", default="", help="Buyer name and email, for the log only")
    ap.add_argument("--paid", default="", help="How it was paid, e.g. 'Zelle 11/12', for the log only")
    ap.add_argument("--out", default=str(Path.home() / "PQ Gift Certificates"), help="Folder for PDFs and the log")
    a = ap.parse_args()

    name, price, detail = GIFTS[a.gift]
    value = a.amount if a.amount is not None else price
    if value is None:
        ap.error("--gift amount needs --amount")
    if a.gift == "amount":
        name = f"${value:,.0f} Gift Certificate"

    out = Path(a.out).expanduser(); out.mkdir(parents=True, exist_ok=True)
    issued = dt.date.today()
    expires = plus_years(issued, 5)
    code = make_code(issued)
    safe = "".join(ch for ch in a.to if ch.isalnum() or ch in " -_").strip().replace(" ", "-") or "gift"
    pdf = out / f"{code}_{safe}.pdf"

    draw(pdf, a.to, a.frm, name, value, detail, a.message[:90], code, issued, expires)

    log = out / "certificates.csv"
    new = not log.exists()
    with log.open("a", newline="") as f:
        wr = csv.writer(f)
        if new:
            wr.writerow(["code", "issued", "valid_through", "gift", "value", "to", "from", "buyer", "paid", "redeemed_on", "notes"])
        wr.writerow([code, issued.isoformat(), expires.isoformat(), name, f"{value:.2f}", a.to, a.frm, a.buyer, a.paid, "", ""])

    print(f"Certificate: {pdf}")
    print(f"Logged in:   {log}")


if __name__ == "__main__":
    main()
