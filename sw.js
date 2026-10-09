// Guarda o app no celular para abrir sem internet. Com internet, pega sempre a versão mais nova.
const CACHE = "comidinhas-v2";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "https://cdn.tailwindcss.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(FILES.map(f => c.add(new Request(f, f.startsWith("http") ? {mode: "no-cors"} : {})).catch(() => {})))
  ));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const same = new URL(e.request.url).origin === location.origin;
  const save = res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return res; };
  if (same) {
    e.respondWith(fetch(e.request).then(save).catch(() =>
      caches.match(e.request, {ignoreSearch: true}).then(h => h || caches.match("./index.html"))));
  } else {
    e.respondWith(caches.match(e.request).then(h => h || fetch(e.request).then(save)));
  }
});
