import urllib.request
import xml.etree.ElementTree as ET
import json
import datetime

ALERT_FEEDS = [
    {"label": "Atlanta Drone",                  "url": "https://www.google.com/alerts/feeds/14071526862971928921/11257640413982761547"},
    {"label": "Drone competition Atlanta",       "url": "https://www.google.com/alerts/feeds/14071526862971928921/17148330842456058979"},
    {"label": "Drone contracts Atlanta/Georgia", "url": "https://www.google.com/alerts/feeds/14071526862971928921/1264784910286108843"},
    {"label": "Drone regulation Georgia",        "url": "https://www.google.com/alerts/feeds/14071526862971928921/7079306208049522120"},
]

FILLER_FEED = {"label": "Atlanta Drone (Google News)", "url": "https://news.google.com/rss/search?q=Atlanta+Drone&hl=en-US&gl=US&ceid=US:en"}

ATOM_NS = {'atom': 'http://www.w3.org/2005/Atom'}

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as r:
        return r.read()

def parse_atom(xml_bytes, label):
    root = ET.fromstring(xml_bytes)
    items = []
    for entry in root.findall('atom:entry', ATOM_NS):
        title_el   = entry.find('atom:title', ATOM_NS)
        link_el    = entry.find('atom:link', ATOM_NS)
        updated_el = entry.find('atom:updated', ATOM_NS)
        content_el = entry.find('atom:content', ATOM_NS)
        items.append({
            'title':       title_el.text   if title_el   is not None else '',
            'link':        link_el.get('href', '') if link_el is not None else '',
            'pubDate':     updated_el.text if updated_el is not None else '',
            'description': content_el.text if content_el is not None else '',
            'feedLabel':   label,
        })
    return items

def parse_rss(xml_bytes, label):
    root = ET.fromstring(xml_bytes)
    channel = root.find('channel')
    items = []
    for item in channel.findall('item'):
        title_el   = item.find('title')
        link_el    = item.find('link')
        pubdate_el = item.find('pubDate')
        desc_el    = item.find('description')
        items.append({
            'title':       title_el.text   if title_el   is not None else '',
            'link':        link_el.text    if link_el    is not None else '',
            'pubDate':     pubdate_el.text if pubdate_el is not None else '',
            'description': desc_el.text   if desc_el    is not None else '',
            'feedLabel':   label,
        })
    return items

all_items = []
errors = []

# Primary: Google Alert feeds
for feed in ALERT_FEEDS:
    try:
        xml_bytes = fetch(feed['url'])
        items = parse_atom(xml_bytes, feed['label'])
        all_items.extend(items)
        print(f"OK  {feed['label']}: {len(items)} items")
    except Exception as e:
        errors.append(f"{feed['label']}: {e}")
        print(f"ERR {feed['label']}: {e}")

# Filler: Google News RSS — only used if alerts returned nothing
if len(all_items) == 0:
    print("Alerts empty — falling back to Google News filler feed")
    try:
        xml_bytes = fetch(FILLER_FEED['url'])
        items = parse_rss(xml_bytes, FILLER_FEED['label'])
        all_items.extend(items)
        print(f"OK  {FILLER_FEED['label']}: {len(items)} items")
    except Exception as e:
        errors.append(f"{FILLER_FEED['label']}: {e}")
        print(f"ERR {FILLER_FEED['label']}: {e}")

all_items.sort(key=lambda x: x.get('pubDate', ''), reverse=True)

output = {
    'updated': datetime.datetime.utcnow().isoformat() + 'Z',
    'errors':  errors,
    'items':   all_items,
}

with open('feed-cache.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"Saved {len(all_items)} total items.")
