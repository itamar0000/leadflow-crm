// Simple service worker for PWA installability
const CACHE_NAME = "leadflow-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Network-first strategy for simplicity
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
