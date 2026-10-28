"""
Builds feed-cache.json for Drone Hospital Daily.

Runs hourly in GitHub Actions (.github/workflows/fetch-feeds.yml).
Every source below is tagged with the topic it feeds. Every story also lands in
General drone news, and the page adds more topics based on each headline.

Topics: robotics, military, consumer (DJI & consumer), laws (Laws & politics).
topic None means General only.
"""
import datetime
import html
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime


def google_news(query):
    """Google News search as RSS. 'when:7d' style terms limit how far back it looks."""
    return ("https://news.google.com/rss/search?q=" + urllib.parse.quote(query)
            + "&hl=en-US&gl=US&ceid=US:en")


GOOGLE_ALERTS = "https://www.google.com/alerts/feeds/14071526862971928921/"

# label: shown nowhere on the page, only in logs; source: publisher name for the byline
# max: most stories taken from this source per run, so no single feed crowds out the rest
FEEDS = [
    # ---- General drone news: local first, then the day's drone headlines
    {"label": "Atlanta drone (Google News)", "topic": None, "max": 30, "local": True,
     "url": google_news("Atlanta drone when:30d")},
    {"label": "Georgia drone (Google News)", "topic": None, "max": 30, "local": True,
     "url": google_news("Georgia drone when:30d")},
    {"label": "Drone headlines today (Google News)", "topic": None, "max": 40,
     "url": google_news("drones when:1d")},
    {"label": "DroneXL", "source": "DroneXL", "topic": None, "max": 15,
     "url": "https://dronexl.co/feed.xml"},
    {"label": "DroneLife", "source": "DroneLife", "topic": None, "max": 10,
     "url": "https://dronelife.com/feed/"},

    # ---- Robotics
    {"label": "Robotics (Google News)", "topic": "robotics", "max": 25,
     "url": google_news('(drone OR drones) (autonomous OR robotics OR robot OR AI OR swarm) when:7d')},

    # ---- Military
    {"label": "Military (Google News)", "topic": "military", "max": 25,
     "url": google_news('(drone OR drones) (military OR defense OR Pentagon OR "counter-drone") when:3d')},
    {"label": "The War Zone", "source": "The War Zone", "topic": "military", "max": 15,
     "url": "https://www.twz.com/feed"},

    # ---- DJI & consumer
    {"label": "DJI (Google News)", "topic": "consumer", "max": 20,
     "url": google_news("DJI drone when:14d")},
    {"label": "Consumer use (Google News)", "topic": "consumer", "max": 20,
     "url": google_news('(drone OR drones) (consumer OR hobbyist OR delivery OR "drone show" OR photography) when:7d')},
    {"label": "DroneDJ", "source": "DroneDJ", "topic": "consumer", "max": 15,
     "url": "https://dronedj.com/feed/"},

    # ---- Laws & politics
    {"label": "Laws & politics (Google News)", "topic": "laws", "max": 25,
     "url": google_news('(drone OR drones) (FAA OR law OR lawmakers OR bill OR legislation OR Congress OR senator '
                        'OR ban OR ordinance OR regulation OR "Remote ID" OR "Part 107" OR tariff '
                        'OR "Commerce Department") when:7d')},
    {"label": "Georgia drone laws (Google News)", "topic": "laws", "max": 15, "local": True,
     "url": google_news("(drone OR drones) Georgia (law OR bill OR lawmakers OR ordinance OR council OR FAA) when:30d")},

    # ---- Original Google Alerts (light volume, kept as extra local coverage)
    {"label": "Alert: Atlanta Drone", "local": True, "topic": None, "max": 10, "url": GOOGLE_ALERTS + "11257640413982761547"},
    {"label": "Alert: Drone competition Atlanta", "local": True, "topic": None, "max": 10, "url": GOOGLE_ALERTS + "17148330842456058979"},
    {"label": "Alert: Drone contracts Atlanta/Georgia", "local": True, "topic": None, "max": 10, "url": GOOGLE_ALERTS + "1264784910286108843"},
    {"label": "Alert: Drone regulation Georgia", "local": True, "topic": "laws", "max": 10, "url": GOOGLE_ALERTS + "7079306208049522120"},
]

MAX_AGE_DAYS = 30
MAX_ITEMS = 200          # whole paper; local Atlanta/Georgia stories are always kept on top of the newest national ones
SNIPPET_CHARS = 420

# Every story has to be drone news
DRONE = re.compile(r"drone|beyond-visual-line|\bbvlos\b|\buav|\buas\b|unmanned aircraft|unmanned aerial|quadcopter|"
                   r"multirotor|\bfpv\b|counter-drone|remote id|part 10[78]\b|\bdji\b|mavic", re.I)

# Press-release mills that post "drone market will reach $X" reports
BLOCKED_SOURCES = re.compile(r"openpr|ein presswire|einpresswire", re.I)
MARKET_REPORT = re.compile(r"\bmarket (size|share|report|to reach|will reach|forecast|growth|analysis|outlook|research)\b|\bCAGR\b", re.I)

ATOM = "{http://www.w3.org/2005/Atom}"
NOW = datetime.datetime.now(datetime.timezone.utc)
CUTOFF = NOW - datetime.timedelta(days=MAX_AGE_DAYS)
EPOCH = datetime.datetime(1970, 1, 1, tzinfo=datetime.timezone.utc)


def fetch(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; DroneHospitalDaily/1.0; +https://pq-robotics.com/drone-news.html)"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()


def parse_date(text):
    if not text:
        return None
    text = text.strip()
    for parse in (lambda t: datetime.datetime.fromisoformat(t.replace("Z", "+00:00")), parsedate_to_datetime):
        try:
            dt = parse(text)
            return dt if dt.tzinfo else dt.replace(tzinfo=datetime.timezone.utc)
        except Exception:
            continue
    return None


def plain(text):
    """Strip tags and entities, collapse whitespace."""
    text = re.sub(r"<[^>]+>", " ", text or "")
    text = html.unescape(html.unescape(text))
    return re.sub(r"\s+", " ", text).strip()


def snippet(desc, title):
    """Short plain-text summary. Google News descriptions only repeat the headline, so those come back empty."""
    text = plain(desc)
    t = re.sub(r"\s+[-|]\s+[^-|]{2,48}$", "", plain(title))
    if not text or text.lower().startswith(t[:40].lower()):
        return ""
    if len(text) > SNIPPET_CHARS:
        text = text[:SNIPPET_CHARS].rsplit(" ", 1)[0] + "…"
    return text


def headline_only(title):
    return re.sub(r"\s+[-|]\s+[^-|]{2,60}$", "", title)


def is_english(title):
    """Keep English headlines. Publisher names in other scripts are fine; the headline itself must be Latin script."""
    letters = re.findall(r"[^\W\d_]", headline_only(title))
    return not letters or sum(c.isascii() for c in letters) / len(letters) >= 0.8


def text_of(el):
    return (el.text or "").strip() if el is not None else ""


def parse_feed(xml_bytes, feed):
    root = ET.fromstring(xml_bytes)
    items = []
    if root.tag == ATOM + "feed":                      # Google Alerts (Atom)
        for e in root.findall(ATOM + "entry"):
            link = e.find(ATOM + "link")
            items.append({
                "title": text_of(e.find(ATOM + "title")),
                "link": link.get("href", "") if link is not None else "",
                "pubDate": text_of(e.find(ATOM + "updated")) or text_of(e.find(ATOM + "published")),
                "description": text_of(e.find(ATOM + "content")),
                "source": "",
            })
    else:                                               # RSS 2.0 (Google News, publishers)
        channel = root.find("channel")
        for i in (channel.findall("item") if channel is not None else []):
            items.append({
                "title": text_of(i.find("title")),
                "link": text_of(i.find("link")),
                "pubDate": text_of(i.find("pubDate")),
                "description": text_of(i.find("description")),
                "source": text_of(i.find("source")) or feed.get("source", ""),
            })

    kept = []
    for it in items:
        dt = parse_date(it["pubDate"])
        if dt is not None and dt < CUTOFF:
            continue
        title = plain(it["title"])
        if not DRONE.search(title + " " + plain(it["description"])):
            continue
        if not is_english(title) or MARKET_REPORT.search(title):
            continue
        if BLOCKED_SOURCES.search(it["source"] or "") or BLOCKED_SOURCES.search(it["link"] or "") or BLOCKED_SOURCES.search(title):
            continue
        kept.append({
            "title": plain(it["title"]),
            "link": it["link"],
            "pubDate": dt.isoformat().replace("+00:00", "Z") if dt else it["pubDate"],
            "description": snippet(it["description"], it["title"]),
            "source": it["source"],
            "feedLabel": feed["label"],
            "topics": [feed["topic"]] if feed["topic"] else [],
            "local": bool(feed.get("local")),
        })
    kept.sort(key=lambda x: parse_date(x["pubDate"]) or EPOCH, reverse=True)
    return kept[: feed["max"]]


def real_url(link):
    """Google Alerts wraps links in google.com/url?url=...; unwrap so duplicates match."""
    try:
        u = urllib.parse.urlparse(link)
        if u.netloc.endswith("google.com") and u.path == "/url":
            q = urllib.parse.parse_qs(u.query)
            return (q.get("url") or q.get("q") or [link])[0]
    except Exception:
        pass
    return link


def title_key(title):
    t = re.sub(r"\s+[-|]\s+[^-|]{2,48}$", "", title or "")   # drop " - Publisher" suffix
    return re.sub(r"[^a-z0-9]", "", t.lower())[:80]


def main():
    all_items, errors = [], []
    for feed in FEEDS:
        try:
            items = parse_feed(fetch(feed["url"]), feed)
            all_items.extend(items)
            print(f"OK  {feed['label']}: {len(items)} drone stories")
        except Exception as e:
            errors.append(f"{feed['label']}: {e}")
            print(f"ERR {feed['label']}: {e}")

    # The same story often arrives from several sources: keep one copy and merge its topics
    by_url, by_title, unique = {}, {}, []
    for item in all_items:
        u, k = real_url(item["link"]), title_key(item["title"])
        first = (by_url.get(u) if u else None) or (by_title.get(k) if k else None)
        if first is not None:
            for t in item["topics"]:
                if t not in first["topics"]:
                    first["topics"].append(t)
            if item["source"] and not first["source"]:
                first["source"] = item["source"]
            if item["description"] and not first["description"]:
                first["description"] = item["description"]
            first["local"] = first["local"] or item["local"]
            continue
        if u:
            by_url[u] = item
        if k:
            by_title[k] = item
        unique.append(item)

    # Fill the paper: every local story, then the newest of everything else, then newest first overall
    by_date = lambda x: parse_date(x["pubDate"]) or EPOCH
    local = sorted((i for i in unique if i["local"]), key=by_date, reverse=True)
    rest = sorted((i for i in unique if not i["local"]), key=by_date, reverse=True)
    unique = sorted(local + rest[: max(0, MAX_ITEMS - len(local))], key=by_date, reverse=True)

    counts = {"general": len(unique), "local": sum(1 for i in unique if i["local"])}
    for t in ("robotics", "military", "consumer", "laws"):
        counts[t] = sum(1 for i in unique if t in i["topics"])

    output = {
        "updated": NOW.isoformat().replace("+00:00", "Z"),
        "errors": errors,
        "counts": counts,
        "items": unique,
    }
    with open("feed-cache.json", "w") as f:
        json.dump(output, f, indent=1, ensure_ascii=False)
    print(f"Saved {len(unique)} drone stories from the last {MAX_AGE_DAYS} days. Topic counts: {counts}")


if __name__ == "__main__":
    main()
