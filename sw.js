// Service Worker for Báo Cáo Ban DVKH - Nhựa Tiền Phong PWA
const CACHE_NAME = 'baocao-dvkh-pwa-v149';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png?v=149',
  './favicon.ico',
  './favicon-v149.ico',
  './icon-192.png?v=149',
  './icon-512.png?v=149',
  './apple-touch-icon.png?v=149',
  './tienphong_logo2.png',
  './banner_thang11_trianculture.jpg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch((err) => console.warn('PWA Cache item skip:', url, err)))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key.startsWith('baocao-dvkh-pwa-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Revalidate app files against the server instead of reusing a fresh HTTP-cache entry.
const APP_ASSET_PATHS = new Set(STATIC_ASSETS.map((url) => new URL(url, self.location.href).pathname));

// Network-first strategy with cache fallback for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('supabase.co')) {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isAppAsset = requestUrl.origin === self.location.origin &&
    (event.request.mode === 'navigate' || APP_ASSET_PATHS.has(requestUrl.pathname));

  event.respondWith(
    fetch(event.request, isAppAsset ? { cache: 'no-cache' } : undefined)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
            return cache.put(event.request, responseToCache);
          }));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
