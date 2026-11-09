// Service Worker de MiRun - garantiza funcionamiento sin internet
// una vez que la app se cargo la primera vez.
// IMPORTANTE: si se cambia mirun.html, css/app.css o js/app.js, subir el numero de CACHE_NAME.
const CACHE_NAME = 'mirun-cache-v27';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './mirun.html',
  './css/app.css',
  './js/app.js',
  './manifest.json',
  './img/iconos/icon-192.png',
  './img/iconos/icon-512.png',
  './img/iconos/icon-512-maskable.png',
  './img/iconos/icon-180.png',
  './img/bienvenida.jpg', // pantalla de bienvenida (el original bienvenida-original.jpg NO va al caché)
  // siluetas del cuerpo (la que se muestra depende del sexo del perfil)
  './img/siluetas/masculina.png',
  './img/siluetas/femenina.png',
  './img/siluetas/neutra.png',
  // mascota: NO se descarga aquí. El teléfono guarda solo las imágenes del compañero elegido
  // (la app las pide con el mensaje 'mascota', más abajo).
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

// Mascota: la app manda {type:'mascota', keep:[rutas del compañero elegido], spare:[muestras del selector]}.
// Se descargan las de keep y se borran del caché las de los otros personajes (menos las de spare ya guardadas).
const CHAR_DIRS = ['/img/mascota/', '/img/zafira/', '/img/nova/', '/img/tizon/'];
self.addEventListener('message', (event) => {
  const d = event.data || {};
  if (d.type !== 'mascota' || !Array.isArray(d.keep)) return;
  const abs = (f) => new URL(f, self.registration.scope).href;
  const keep = d.keep.map(abs), stay = new Set(keep.concat((d.spare || []).map(abs)));
  event.waitUntil(caches.open(CACHE_NAME).then((cache) =>
    cache.addAll(keep)
      .then(() => cache.keys())
      .then((reqs) => Promise.all(reqs
        .filter((r) => CHAR_DIRS.some((dir) => new URL(r.url).pathname.includes(dir)) && !stay.has(r.url))
        .map((r) => cache.delete(r))))
      .catch(() => {}))); // sin internet: se intenta otra vez la próxima vez
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
