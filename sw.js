/* ─── Service Worker — Auditorías KTMEX 2026 ─── */
var CACHE_NAME = 'ktmex-audit-v1';
var FILES_TO_CACHE = [
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

/* Instalar y cachear archivos */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/* Activar y limpiar caches viejos */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key)   { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

/* Interceptar peticiones — primero cache, luego red */
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request).then(function(response) {
        /* Guardar en cache si es una petición válida */
        if (event.request.method === 'GET' && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(function() {
        /* Sin red y sin cache — devuelve la app principal */
        return caches.match('/index.html');
      });
    })
  );
});
