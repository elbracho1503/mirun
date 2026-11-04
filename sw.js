// Service Worker de MiRun - garantiza funcionamiento sin internet
// una vez que la app se cargo la primera vez.
// IMPORTANTE: si se cambia mirun.html, css/app.css o js/app.js, subir el numero de CACHE_NAME.
const CACHE_NAME = 'mirun-cache-v15';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './mirun.html',
  './css/app.css',
  './js/app.js',
  './manifest.json',
  './img/iconos/icon-192.png',
  './img/iconos/icon-512.png',
  './img/iconos/icon-180.png',
  // siluetas del cuerpo (la que se muestra depende del sexo del perfil)
  './img/siluetas/masculina.png',
  './img/siluetas/femenina.png',
  './img/siluetas/neutra.png',
  // mascota: solo las poses que usa la app (lista MASCOT en app.js y la de pantallas en mirun.html)
  './img/mascota/01_aprobacion.png',
  './img/mascota/02_pesas.png',
  './img/mascota/03_corriendo.png',
  './img/mascota/04_carino.png',
  './img/mascota/06_pensando.png',
  './img/mascota/07_emocionado.png',
  './img/mascota/09_celebrando.png',
  './img/mascota/10_cansado.png',
  './img/mascota/12_estudiando.png',
  './img/mascota/13_tu_puedes.png',
  './img/mascota/14_durmiendo.png',
  './img/mascota/15_asomado.png',
  './lib/leaflet.js',
  './lib/leaflet.css'
];
// Las imagenes de calles (OpenStreetMap) NO se guardan: se piden solo con internet.
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
