const CACHE_NAME = 'whale-pwa-cache-v2';
const OFFLINE_URL = '/offline';

// Add whitelisted paths to cache, or just do a simple network-first strategy
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache the offline page
      return cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});

// A simple network-first strategy for a dynamic app
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  // Don't intercept API calls, external API calls, or supabase
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;
  if (url.origin !== self.location.origin) return; // Do not intercept external requests (Supabase, Twilio etc.)

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache the successful response
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // On network failure, try the cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If it's a navigation request and we have no cache, return the offline page
        if (event.request.mode === 'navigate') {
          const offlineCache = await caches.match(OFFLINE_URL);
          if (offlineCache) {
            return offlineCache;
          }
        }
        
        // If neither network nor cache, fail
        throw new Error('Network and cache failed');
      })
  );
});
