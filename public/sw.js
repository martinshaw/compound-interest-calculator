/* Compound Interest Calculator — full offline app shell for GitHub Pages / PWA.
 * CACHE_NAME is injected from package.json on build (see scripts/prepare-sw.js).
 */
const CACHE_NAME = 'compound-interest-v2.0.1';

/** Relative to the service worker scope (works with /compound-interest-calculator/). */
const PRECACHE_URLS = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/icon-maskable-512.png',
];

// Extra hashed Next assets are appended at build time into dist/sw.js
const BUILD_ASSETS = [];

self.addEventListener('install', (event) => {
  const urls = PRECACHE_URLS.concat(BUILD_ASSETS);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.all(
          urls.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[sw] precache failed', url, err);
            })
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: try network, then cached app shell, then offline page.
  // The calculator itself is fully client-side once JS/CSS are cached.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('./', copy);
            cache.put('./index.html', response.clone());
          });
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (
            (await cache.match('./')) ||
            (await cache.match('./index.html')) ||
            (await cache.match('./offline.html')) ||
            new Response('Offline', { status: 503, statusText: 'Offline' })
          );
        })
    );
    return;
  }

  // Same-origin assets: cache-first, then network and store (enables full offline after first visit)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      }).catch(async () => {
        if (request.destination === 'document') {
          return caches.match('./offline.html');
        }
        return Response.error();
      });
    })
  );
});
