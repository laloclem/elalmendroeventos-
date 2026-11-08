// App de reservas El Almendro: guarda la pantalla para que abra rápido.
// Las reservas siempre se piden en vivo a n8n (no se guardan acá).
var CACHE = "reservas-v2";
var ARCHIVOS = ["reservas.html", "reservas.webmanifest", "icono-192.png", "icono-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Primero la red (para tener siempre la última versión); si no hay señal, la copia guardada.
  e.respondWith(
    fetch(e.request).then(function (r) {
      // Solo se guardan respuestas buenas (no páginas de error).
      if (r.ok) { var copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copia); }); }
      return r;
    }).catch(function () { return caches.match(e.request); })
  );
});
