// Name of the cache
const CACHE_NAME = 'surLinkAI-cache-v1';
// List of files to cache
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
		'/sections/feedback.html',
		'/sections/history.html',
		'/sections/stats.html',
		'/sections/status.html',
		// Add more assets as needed
];

// Install event: cache files
self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then(cache => cache.addAll(ASSETS_TO_CACHE))
			.then(() => self.skipWaiting())
	);
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(keys =>
			Promise.all(
				keys.filter(key => key !== CACHE_NAME)
						.map(key => caches.delete(key))
			)
		).then(() => self.clients.claim())
	);
});

// Fetch event: serve from cache, fall back to network
self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request)
			.then(response => response || fetch(event.request))
	);
});
