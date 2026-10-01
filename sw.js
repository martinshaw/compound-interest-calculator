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
const BUILD_ASSETS = [
  "./404.html",
  "./_next/static/Oz1YUnv-myyVpWSg82U6a/_buildManifest.js",
  "./_next/static/Oz1YUnv-myyVpWSg82U6a/_ssgManifest.js",
  "./_next/static/chunks/23-c5eda63760aea314.js",
  "./_next/static/chunks/522-45f39c796ce3327c.js",
  "./_next/static/chunks/app/_not-found/page-0710dd79b10a2a7b.js",
  "./_next/static/chunks/app/layout-0d15127e3f83a16c.js",
  "./_next/static/chunks/app/page-a32df38bb1254020.js",
  "./_next/static/chunks/fd9d1056-8350035ff3fde82d.js",
  "./_next/static/chunks/framework-f66176bb897dc684.js",
  "./_next/static/chunks/main-app-bb42700a9e3d74b2.js",
  "./_next/static/chunks/main-d6b4fd9036669d94.js",
  "./_next/static/chunks/pages/_app-6a626577ffa902a4.js",
  "./_next/static/chunks/pages/_error-1be831200e60c5c0.js",
  "./_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",
  "./_next/static/chunks/webpack-ef672d13198c644a.js",
  "./_next/static/css/1d87d8ade6a47eff.css",
  "./_next/static/media/19cfc7226ec3afaa-s.woff2",
  "./_next/static/media/21350d82a1f187e9-s.woff2",
  "./_next/static/media/8e9860b6e62d6359-s.woff2",
  "./_next/static/media/ba9851c3c22cd980-s.woff2",
  "./_next/static/media/c5fe6dc8356a8c31-s.woff2",
  "./_next/static/media/df0a9ae256c0569c-s.woff2",
  "./_next/static/media/e4af272ccee01ff0-s.p.woff2",
  "./favicon.ico",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./manifest.webmanifest",
  "./offline.html"
];

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
