// Service Worker for Báo Cáo Ban DVKH - Nhựa Tiền Phong PWA
const CACHE_NAME = 'baocao-dvkh-pwa-v292';
const NOEL_RUNTIME_CACHE = 'baocao-dvkh-noel-v292';
const NOEL_ASSET_PREFIX = '/assets/noel-window/v284/';

// Precache ONLY core app shell & default 365-day theme (Sắc Nước Ban Mai).
// Noel Window assets load lazily via NOEL_RUNTIME_CACHE so default users fetch 0 KiB of Christmas files.
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png?v=151',
  './favicon.ico',
  './favicon.ico?v=151',
  './icon-192.png?v=151',
  './icon-512.png?v=151',
  './apple-touch-icon.png?v=151',
  './tienphong_logo2.png',
  './banner_thang11_trianculture.jpg',
  './banner_tet_2027.jpg',
  './assets/plates/water-ribbon-left.png',
  './assets/plates/water-caustic-right.png',
  './assets/plates/brand-logo.png',
  './assets/snbm_theme_preview.png',
  './assets/fonts/be-vietnam-pro-vietnamese-400.woff2',
  './assets/fonts/be-vietnam-pro-latin-400.woff2',
  './assets/fonts/be-vietnam-pro-vietnamese-500.woff2',
  './assets/fonts/be-vietnam-pro-latin-500.woff2',
  './assets/fonts/be-vietnam-pro-vietnamese-600.woff2',
  './assets/fonts/be-vietnam-pro-latin-600.woff2',
  './assets/fonts/be-vietnam-pro-vietnamese-700.woff2',
  './assets/fonts/be-vietnam-pro-latin-700.woff2',
  './assets/fonts/be-vietnam-pro-vietnamese-800.woff2',
  './assets/fonts/be-vietnam-pro-latin-800.woff2'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => console.warn('PWA Cache item skip:', url, err))
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          const isOldCore = key.startsWith('baocao-dvkh-pwa-') && key !== CACHE_NAME;
          const isOldNoel = key.startsWith('baocao-dvkh-noel-') && key !== NOEL_RUNTIME_CACHE;
          if (isOldCore || isOldNoel) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Revalidate app files against the server instead of reusing a fresh HTTP-cache entry.
const APP_ASSET_PATHS = new Set(STATIC_ASSETS.map((url) => new URL(url, self.location.href).pathname));

async function serveRangeFromCachedResponse(cachedResponse, rangeHeader) {
  const buf = await cachedResponse.arrayBuffer();
  const total = buf.byteLength;
  const match = /bytes=(\d*)-(\d*)/i.exec(rangeHeader || '');
  if (!match) return cachedResponse;
  const start = match[1] ? parseInt(match[1], 10) : 0;
  const end = match[2] ? Math.min(total - 1, parseInt(match[2], 10)) : total - 1;
  if (start > end || start >= total) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
  }
  const slice = buf.slice(start, end + 1);
  return new Response(slice, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': cachedResponse.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Content-Length': String(slice.byteLength),
      'Accept-Ranges': 'bytes'
    }
  });
}

async function handleNoelRuntimeRequest(request) {
  const cache = await caches.open(NOEL_RUNTIME_CACHE);
  const rangeHeader = request.headers.get('range');

  if (rangeHeader) {
    try {
      const netRes = await fetch(request);
      if (netRes && (netRes.status === 200 || netRes.status === 206)) {
        return netRes;
      }
    } catch (e) { }
    const cachedFull = await cache.match(request.url, { ignoreSearch: true });
    if (cachedFull) return serveRangeFromCachedResponse(cachedFull, rangeHeader);
    return new Response('', { status: 503, statusText: 'Offline' });
  }

  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  const netRes = await fetch(request);
  if (netRes && netRes.status === 200 && netRes.type === 'basic') {
    cache.put(request, netRes.clone()).catch(() => {});
  }
  return netRes;
}

// Network-first strategy with cache fallback for static assets; runtime cache for Noel Window assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('supabase.co')) {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin === self.location.origin && requestUrl.pathname.includes(NOEL_ASSET_PREFIX)) {
    event.respondWith(handleNoelRuntimeRequest(event.request));
    return;
  }

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
