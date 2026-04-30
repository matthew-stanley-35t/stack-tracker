// PepBros Gainz Service Worker
// Network-first strategy: always fetches the latest version from GitHub when online.
// Falls back to cache when offline. localStorage (your data) is never touched.

const CACHE = 'pepbros-gainz-v2';

self.addEventListener('install', () => {
  self.skipWaiting(); // activate immediately, don't wait for old SW to expire
});

self.addEventListener('activate', event => {
  // Remove any old caches from previous versions
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache a copy of every successful response
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request)) // offline fallback
  );
});
