// Temporary no-op service worker to clean up stale caches from previous deployments.
// This prevents old index.html from pointing to removed hashed JS chunks.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', () => {
  // Intentionally no caching.
});
