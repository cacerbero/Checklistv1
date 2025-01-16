const CACHE_NAME = "to-do-pwa-cache-v1";
const FILES_TO_CACHE = [
  "/Checklist/",
  "Checklist/index.html",
  "Checklist/style.css",
  "Checklist/app.js",
  "Checklist/manifest.json",
  "Checklist/icons/icon-128.png",
  "Checklist/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(FILES_TO_CACHE)
            .catch(() => {
                console.error('Caching failed:', error);
            });
        })
        .catch((error) => {
            console.error('Cache open failed', error);

        })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
