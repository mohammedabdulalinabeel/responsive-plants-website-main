const CACHE_NAME = "farmer-ai-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./chatbot.html",
  "./farmers.html",
  "./assets/css/styles.css",
  "./assets/css/chatbot.css",
  "./assets/js/main.js",
  "./assets/js/chatbot.js",
  "./assets/img/favicon.png",
  "./assets/img/logo.png"
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => console.log('Caching failed during install', err));
    })
  );
});

// Fetch event (Stale-while-revalidate strategy)
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') return;
  // Skip external API calls
  if (event.request.url.includes('googleapis.com') || event.request.url.includes('onrender.com')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
          return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
