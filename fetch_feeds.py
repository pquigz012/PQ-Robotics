import urllib.request
import xml.etree.ElementTree as ET
import json
import datetime

FEEDS = [
    {"label": "Atlanta Drone",                   "url": "https://www.google.com/alerts/feeds/14071526862971928921/11257640413982761547"},
    {"label": "Drone competition Atlanta",        "url": "https://www.google.com/alerts/feeds/14071526862971928921/17148330842456058979"},
    {"label": "Drone contracts Atlanta/Georgia",  "url": "https://www.google.com/alerts/feeds/14071526862971928921/1264784910286108843"},
    {"label": "Drone regulation Georgia",         "url": "https://www.google.com/alerts/feeds/14071526862971928921/7079306208049522120"},
]

NS = {
    'atom': 'http://www.w3.org/2005/Atom',
}

def fetch_feed(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read()

def parse_feed(xml_bytes, label):
    root = ET.fromstring(xml_bytes)
    items = []
    for entry in root.findall('atom:entry', NS):
        title_el   = entry.find('atom:title', NS)
        link_el    = entry.find('atom:link', NS)
        updated_el = entry.find('atom:updated', NS)
        content_el = entry.find('atom:content', NS)
        items.append({
            'title':       title_el.text   if title_el   is not None else '',
            'link':        link_el.get('href', '') if link_el is not None else '',
            'pubDate':     updated_el.text if updated_el is not None else '',
            'description': content_el.text if content_el is not None else '',
            'feedLabel':   label,
        })
    return items

all_items = []
errors = []

for feed in FEEDS:
    try:
        xml_bytes = fetch_feed(feed['url'])
        items = parse_feed(xml_bytes, feed['label'])
        all_items.extend(items)
        print(f"OK  {feed['label']}: {len(items)} items")
    except Exception as e:
        errors.append(f"{feed['label']}: {e}")
        print(f"ERR {feed['label']}: {e}")

all_items.sort(key=lambda x: x.get('pubDate', ''), reverse=True)

output = {
    'updated': datetime.datetime.utcnow().isoformat() + 'Z',
    'errors':  errors,
    'items':   all_items,
}

with open('feed-cache.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"Saved {len(all_items)} total items.")
