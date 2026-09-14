// Service worker minimal — sert surtout à rendre l'app installable (critère Chrome/Android).
// Cache l'essentiel pour un chargement plus rapide et un minimum de résilience hors-ligne,
// sans jamais servir une version périmée de l'app elle-même.
const CACHE_NAME = 'besafe-v1';
const PRECACHE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Réseau d'abord pour l'HTML principal (toujours la dernière version de l'app),
  // cache en secours si hors-ligne ; cache d'abord pour le reste (icônes, manifest).
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
