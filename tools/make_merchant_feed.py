#!/usr/bin/env python3
"""Build the Google Merchant Center product files from the parts page.

Reads the Product markup (JSON-LD) on drone-shop-atlanta.html, so price and
stock always match what the page shows. Writes two tab-separated files to the
site root, where Merchant Center can fetch them once a day:

  merchant-feed.tsv          products (Merchant Center: primary data source)
  merchant-local-inventory.tsv  what is on the shelf at the shop (local inventory)

To change a price or mark something sold out, edit the page markup
(price / availability), then run:  python3 tools/make_merchant_feed.py
"""
import csv, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "drone-shop-atlanta.html"
PAGE_URL = "https://pq-robotics.com/drone-shop-atlanta.html"

# Must match the store code in Google Business Profile
# (Business Profile > Edit profile > Business information > Advanced settings > Store code).
STORE_CODE = "PQ-ATL-1"

# Hand-written titles and descriptions: model first, the way people search.
# Key = (product anchor, offer name). Anything not listed gets an automatic title.
ITEMS = {
    ("a1", None): ("a1",
        "Antigravity A1 8K 360 Drone Essential Bundle with Vision Goggles, New",
        "New Antigravity A1 8K 360 camera drone, under 249 g. Essential Bundle: drone, Vision goggles, Grip motion controller, two flight batteries, charging hub, carry case, sling bag, landing pad and a Lexar 256 GB microSD card. In stock at our Atlanta shop. Reserve online and pick up at 6059 Boylston Dr NE, Suite 010."),
    ("item-rc2", "RC 2"): ("rc2",
        "DJI RC 2 Remote Controller with Screen, Used",
        "Used DJI RC 2 controller with a built-in screen, so you don't need your phone to fly. Fits DJI Mini 4 Pro, Air 3, Air 3S and Neo. Used and working. In stock in Atlanta, reserve online and pick up today."),
    ("item-rc-n", "RC-N1"): ("rc-n1",
        "DJI RC-N1 Remote Controller for Mini 3 / Mini 3 Pro, Used",
        "Used DJI RC-N1 standard controller (uses your phone as the screen). Fits DJI Mini 3 and Mini 3 Pro. Used and working. In stock in Atlanta, reserve online and pick up today."),
    ("item-rc-n", "RC-N2"): ("rc-n2",
        "DJI RC-N2 Remote Controller for Mini 4 Pro, Used",
        "Used DJI RC-N2 standard controller (uses your phone as the screen). Fits DJI Mini 4 Pro. Used and working. In stock in Atlanta, reserve online and pick up today."),
    ("item-rc-n", "RC-N3"): ("rc-n3",
        "DJI RC-N3 Remote Controller for Mini 4 Pro / Mini 5 Pro, Used",
        "Used DJI RC-N3 standard controller (uses your phone as the screen). Fits DJI Mini 4 Pro and Mini 5 Pro. Used and working. In stock in Atlanta, reserve online and pick up today."),
    ("item-mini4pro-arms", "Per arm"): ("mini4pro-arm",
        "DJI Mini 4 Pro Replacement Arm with Motor, Any Position, Used",
        "Used DJI Mini 4 Pro replacement arm with the motor attached. Front left, front right, rear left or rear right, priced per arm. In stock in Atlanta. Pick it up today, or have the Drone Hospital install it for you."),
    ("item-mini5pro-arms", "Front arm"): ("mini5pro-arm-front",
        "DJI Mini 5 Pro Front Arm with Motor, Used, Left or Right",
        "Used DJI Mini 5 Pro front replacement arm with the motor attached, left or right, priced per arm. In stock in Atlanta. Pick it up today, or have the Drone Hospital install it for you."),
    ("item-mini5pro-arms", "Rear arm"): ("mini5pro-arm-rear",
        "DJI Mini 5 Pro Rear Arm with Motor, Used, Left or Right",
        "Used DJI Mini 5 Pro rear replacement arm with the motor attached, left or right, priced per arm. In stock in Atlanta. Pick it up today, or have the Drone Hospital install it for you."),
    ("item-mini3-arms", "Front arm"): ("mini3pro-arm-front",
        "DJI Mini 3 Pro Front Arm with Motor, Used, Left or Right",
        "Used DJI Mini 3 Pro front replacement arm with the motor attached, left or right, priced per arm. Mini 3 Pro only (does not fit the plain Mini 3). In stock in Atlanta. Pick it up today, or have the Drone Hospital install it."),
    ("item-mini3-arms", "Rear arm"): ("mini3pro-arm-rear",
        "DJI Mini 3 Pro Rear Arm with Motor, Used, Left or Right",
        "Used DJI Mini 3 Pro rear replacement arm with the motor attached, left or right, priced per arm. Mini 3 Pro only (does not fit the plain Mini 3). In stock in Atlanta. Pick it up today, or have the Drone Hospital install it."),
    ("item-axis-springs", "Single axis"): ("axis-springs",
        "Front Arm Axis Spring for DJI Mini 4 Pro / Mini 3 / Mini 3 Pro, Used",
        "Front arm hinge shaft with spring for DJI Mini 4 Pro, Mini 3 and Mini 3 Pro. Single axis. In stock in Atlanta."),
    ("item-axis-springs", "Kit of 2 with tools"): ("axis-springs-kit",
        "Front Arm Axis Spring Kit with Tools for DJI Mini 4 Pro / Mini 3 Pro",
        "Two front arm hinge shafts with springs plus spudger, tweezers and screwdriver. Fits DJI Mini 4 Pro, Mini 3 and Mini 3 Pro. In stock in Atlanta."),
    ("item-mini4pro-case", "Case"): ("mini4pro-case",
        "HPRC 2300 Hard Case for DJI Mini 4 Pro with Custom Foam, Used",
        "Used HPRC 2300 hard case with foam cut for the DJI Mini 4 Pro, an RC 2 or RC-N2 controller, batteries, the two-way charging hub and cables. In stock in Atlanta."),
    ("item-mini4pro-batteries", "Full set"): ("mini4pro-batteries",
        "DJI Mini 4 Pro Batteries (2) + Two-Way Charging Hub Set, Used",
        "Used DJI Mini 4 Pro Intelligent Flight Battery set: two batteries, the two-way charging hub and a USB-C cable. Fits Mini 4 Pro and Mini 3 Pro. Used and working. In stock in Atlanta."),
    ("item-mini4pro-batteries", "Single battery"): ("mini4pro-battery",
        "DJI Mini 4 Pro Intelligent Flight Battery, Used",
        "One used DJI Mini 4 Pro Intelligent Flight Battery. Fits Mini 4 Pro and Mini 3 Pro. Used and working. In stock in Atlanta."),
    ("item-gimbal-dampers", "Pair"): ("gimbal-dampers",
        "Gimbal Rubber Dampers for DJI Mini 3 / Mini 3 Pro / Mini 4 Pro, New, Pair",
        "New left and right gimbal rubber damper pair for DJI Mini 3, Mini 3 Pro and Mini 4 Pro. In stock in Atlanta."),
}

PRODUCT_TYPE = {
    "a1": "Drones > Antigravity A1",
    "item-rc2": "Drone parts > Controllers", "item-rc-n": "Drone parts > Controllers",
    "item-mini4pro-arms": "Drone parts > Arms > DJI Mini 4 Pro",
    "item-mini5pro-arms": "Drone parts > Arms > DJI Mini 5 Pro",
    "item-mini3-arms": "Drone parts > Arms > DJI Mini 3 Pro",
    "item-axis-springs": "Drone parts > Arms > Axis springs",
    "item-mini4pro-case": "Drone accessories > Cases",
    "item-mini4pro-batteries": "Drone parts > Batteries",
    "item-gimbal-dampers": "Drone parts > Gimbal",
}

AVAIL = {"InStock": "in_stock", "OutOfStock": "out_of_stock", "SoldOut": "out_of_stock",
         "PreOrder": "preorder", "BackOrder": "backorder", "LimitedAvailability": "in_stock"}
COND = {"NewCondition": "new", "UsedCondition": "used", "RefurbishedCondition": "refurbished"}


def products(html):
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        data = json.loads(m.group(1))
        for it in data.get("@graph", [data]) if isinstance(data, dict) else data:
            if it.get("@type") == "Product":
                yield it


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def main():
    html = PAGE.read_text(encoding="utf-8")
    feed, local = [], []
    for p in products(html):
        url = p.get("url") or PAGE_URL
        anchor = url.split("#", 1)[1] if "#" in url else "a1"
        link = url if "#" in url else PAGE_URL + "#bundle"
        images = p.get("image") or []
        images = [images] if isinstance(images, str) else images
        offers = p["offers"] if isinstance(p["offers"], list) else [p["offers"]]
        brand = (p.get("brand") or {}).get("name", "")
        for o in offers:
            key = (anchor, o.get("name")) if (anchor, o.get("name")) in ITEMS else (anchor, None)
            if key in ITEMS:
                iid, title, desc = ITEMS[key]
            else:
                iid = slug(anchor.replace("item-", "") + "-" + (o.get("name") or ""))
                title = f'{p["name"]}, {o.get("name")}' if o.get("name") else p["name"]
                desc = p.get("description", "")
                print(f"note: no hand-written title for {iid}, using '{title}'", file=sys.stderr)
            avail = AVAIL.get(o.get("availability", "").rsplit("/", 1)[-1], "in_stock")
            cond = COND.get(o.get("itemCondition", "").rsplit("/", 1)[-1], "used")
            price = f'{float(o["price"]):.2f} {o.get("priceCurrency", "USD")}'
            feed.append({
                "id": iid, "title": title[:150], "description": desc[:5000],
                "link": link, "image_link": images[0] if images else "",
                "additional_image_link": ",".join(images[1:10]),
                "availability": avail, "price": price, "condition": cond,
                "brand": brand or "Generic",
                # Used and unbranded parts have no barcode. Add a GTIN (UPC from the box)
                # for new branded items when you have it.
                "gtin": p.get("gtin") or p.get("gtin12") or p.get("gtin13") or "",
                "mpn": p.get("mpn") or "",
                "identifier_exists": "yes" if (p.get("gtin") or p.get("gtin12") or p.get("gtin13") or p.get("mpn")) else "no",
                "product_type": PRODUCT_TYPE.get(anchor, "Drone parts"),
                "custom_label_0": "drone hospital parts",
            })
            local.append({"store_code": STORE_CODE, "id": iid, "availability": avail,
                          "price": price, "pickup_method": "reserve", "pickup_sla": "same day"})

    for name, rows in (("merchant-feed.tsv", feed), ("merchant-local-inventory.tsv", local)):
        with open(ROOT / name, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0]), delimiter="\t", lineterminator="\n")
            w.writeheader(); w.writerows(rows)
        print(f"wrote {name}: {len(rows)} items")


if __name__ == "__main__":
    main()
