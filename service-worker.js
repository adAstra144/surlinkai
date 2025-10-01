// Use a versioned cache name that updates on every deploy
const CACHE_VERSION = 'v5'; // Increment this on deploy
const CACHE_NAME = `surlinkai-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/normalize.css',
  '/manifest.json',
  '/onboarding.js',
  '/questions.js',
  '/questions.tl.js',
  '/assets/logo.avif',
  '/sounds/correct.mp3',
  '/sounds/level-up.mp3',
  '/sounds/wrong.mp3',
];

// Install event: cache files
// Install event: cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting(); // Activate worker immediately
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim(); // Take control of all clients
});

// Fetch event: serve from cache, network fallback
self.addEventListener('fetch', event => {
  // Always bypass cache for HTML/CSS/JS to get latest
  const url = event.request.url;
  if (url.endsWith('.html') || url.endsWith('.css') || url.endsWith('.js')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  if (url.includes('/explain')) {
    // Network-first for API
    event.respondWith(fetch(event.request));
    return;
  }
  // Default: cache-first
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

// Listen for skipWaiting message from client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
