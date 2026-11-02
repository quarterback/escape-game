// Coalition service worker, build 15577f24be.
// Rules: a request never dies inside the worker. The page goes network first and falls back to the
// cached copy, then to a short offline note; other files go cache first and fall back to the network.
// Only the game page is treated as the app shell; about.html and anything else load as themselves.
const CACHE = 'coalition-15577f24be';
const SHELL = ['index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
const OFFLINE = '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Coalition</title><body style="margin:0;background:#150F2E;color:#F6F1FF;font:18px/1.5 Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px"><div><p>Coalition could not load. Check the connection and try again.</p><p><a href="./" style="color:#FFC93C">Reload</a></p></div></body>';
const isPage = (url) => { const p = new URL(url).pathname; return p.endsWith('/') || p.endsWith('/index.html'); };
self.addEventListener('install', (e) => {
  // the page first, then the rest one by one, so one missing icon never fails the install
  e.waitUntil(caches.open(CACHE).then(async (c) => { await c.add('index.html'); for (const f of SHELL.slice(1)) { try { await c.add(f); } catch (err) { /* served from the network when asked */ } } }));
});
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    if (!isPage(req.url)) { e.respondWith(fetch(req).catch(() => caches.match(req).then(r => r || new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })))); return; }
    e.respondWith(fetch(req).then((res) => { if (res && res.ok) caches.open(CACHE).then(c => c.put('index.html', res.clone())).catch(() => {}); return res; })
      .catch(() => caches.match('index.html').then(r => r || new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then((res) => { if (res && res.ok && new URL(req.url).origin === location.origin) caches.open(CACHE).then(c => c.put(req, res.clone())).catch(() => {}); return res; }))
    .catch(() => new Response('', { status: 503, statusText: 'offline' })));
});
