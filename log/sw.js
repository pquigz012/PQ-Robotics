// Keeps the app working offline. Tries the network first so updates show up,
// and falls back to the saved copy with no signal. GitHub backup calls are never cached.
const CACHE = "pq-log-v7";
const SHELL = ["./", "index.html", "app.js?v=7", "app.css?v=7", "manifest.webmanifest", "icon-180.png", "icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.hostname === "api.github.com") return;
  const sameSite = url.origin === self.location.origin;
  const fonts = url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com");
  if (!sameSite && !fonts) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => { if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); } return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: false }).then((hit) => hit || caches.match("index.html")))
  );
});
