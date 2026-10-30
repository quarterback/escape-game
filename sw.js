// Coalition service worker, build 5494286988. Cache first; navigations answer with the cached page.
const CACHE = 'coalition-5494286988';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') { e.respondWith(caches.match('index.html').then(r => r || fetch(e.request))); return; }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
