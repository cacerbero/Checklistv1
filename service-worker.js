const CACHE_NAME = "to-do-pwa-cache-v1";
const FILES_TO_CACHE = [
  "/Checklistv1/",
  "Checklistv1/index.html",
  "Checklistv1/style.css",
  "Checklistv1/app.js",
  "Checklistv1/manifest.json",
  "Checklistv1/icons/icon-128.png",
  "Checklistv1/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(FILES_TO_CACHE)
            .catch((error) => {
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
