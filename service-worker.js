const CACHE_NAME = 'dx-vpn-pwa-cache-v1';
const urlsToCache = [
  '/',
  './index.html',
  './vite.svg',
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Use a "Network falling back to cache" strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      // If the request is successful, cache it and return it
      if (response && (response.status === 200 || response.type === 'opaque')) {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
      }
      return response;
    }).catch(() => {
      // If the network request fails, try to serve from the cache
      return caches.match(event.request);
    })
  );
});

// Clean up old caches when a new service worker is activated
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
      caches.keys().then(cacheNames => Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      ))
    );
});
