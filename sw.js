/* Mizan service worker — precache the app shell so it works offline */
const VERSION = 'mizan-v1.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/app.css',
  './assets/fonts/bricolage-grotesque.woff2',
  './assets/fonts/atkinson-hyperlegible-next.woff2',
  './assets/fonts/atkinson-hyperlegible-next-ext.woff2',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon-32.png',
  './assets/js/core.js',
  './assets/js/data-templates.js',
  './assets/js/calc.js',
  './assets/js/praytimes.js',
  './assets/js/data-growth.js',
  './assets/js/data-foods.js',
  './assets/js/mealplan.js',
  './assets/js/data-exercises.js',
  './assets/js/ui.js',
  './assets/js/views-today.js',
  './assets/js/views-plan.js',
  './assets/js/views-habits.js',
  './assets/js/views-body.js',
  './assets/js/views-food.js',
  './assets/js/views-more.js',
  './assets/js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Pages: network first so updates arrive, cached copy when offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Static files: cache first, refresh in the background
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
