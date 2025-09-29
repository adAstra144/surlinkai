// Automatically generate a cache name based on timestamp
const CACHE_NAME = `surlinkai-${Date.now()}`;

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
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
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
  self.clients.claim();
});

// Fetch event: serve from cache, network fallback
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/explain')) {
    // Network-first for API
    event.respondWith(fetch(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(resp => resp || fetch(event.request))
    );
  }
});
