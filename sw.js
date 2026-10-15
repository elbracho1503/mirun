// Service Worker de MiRun - garantiza funcionamiento sin internet
// una vez que la app se cargo la primera vez.
// IMPORTANTE: si se cambia mirun.html, subir el numero de CACHE_NAME.
const CACHE_NAME = 'mirun-cache-v6';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './mirun.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
// Las letras (Google Fonts) tambien se guardan la primera vez que cargan,
// asi la app se ve igual sin internet.
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const sameSite = url.origin === self.location.origin;
  const isFont = FONT_HOSTS.includes(url.hostname);
  if (!sameSite && !isFont) return; // nada de afuera se guarda ni se intercepta

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fromNetwork = fetch(event.request).then((resp) => {
        // propias: solo respuestas 200; letras: se aceptan las "opacas" de Google
        if (resp && (resp.status === 200 || (isFont && resp.type === 'opaque'))) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return resp;
      }).catch(() => cached);
      // Lo guardado primero (funciona sin internet); se actualiza en segundo plano
      return cached || fromNetwork;
    })
  );
});
