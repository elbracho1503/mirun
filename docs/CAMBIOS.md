# Registro de cambios

Costo = tokens aproximados de la sesión de IA para ese cambio (lectura + escritura + pruebas).
Una línea por cambio, el más nuevo arriba.

| Fecha | Cambio | Archivos | Costo aprox. |
|---|---|---|---|
| 2026-11-04 | Rama `prueba/unidades` (unida a main y publicada): unidades km/mi y kg/lb en Perfil (convierte al mostrar y al leer; conserva el valor exacto si solo cambió la unidad). Caché v15 | `js/app.js`, `mirun.html`, `sw.js`, `docs/*` | ~110k tokens |
| 2026-11-03 | Ícono nuevo de la app (192, 512, maskable, 180 iPhone), siluetas del cuerpo con medidas en Cuerpo, originales en `img/`, `png_lib.js` lee PNG RGB y reduce tamaño, F4 sin paréntesis repetido. Caché v14 | `img/*`, `manifest.json`, `mirun.html`, `css/app.css`, `js/app.js`, `sw.js`, `.claude/herramientas/png_lib.js`, `docs/*`, `CLAUDE.md` | ~60k tokens |
| 2026-11-02 | Modo bolsillo (bloqueo de toques, mantener presionado para salir), avatar negro sin foto, correo de commits → noreply de GitHub y corrección del historial publicado. Caché v13 | `mirun.html`, `css/app.css`, `js/app.js`, `sw.js`, `docs/*`, `CLAUDE.md` | ~35k tokens |
| 2026-11-02 | Orden de carpetas (`css/`, `js/`, `img/iconos/`), Git conectado a la carpeta de trabajo, plan con futuro (comunidad, Play Store). Etapa 6: foto de perfil, objetivo, nivel de actividad, copia con perfil/metas/foto. Caché v12 | `mirun.html`, `css/`, `js/`, `sw.js`, `manifest.json`, `docs/*`, `CLAUDE.md` | ~75k tokens |
| 2026-11-02 | Publicado en GitHub Pages (commit b8993d7). README actualizado, `.gitignore` excluye `respaldo/` | `README.md`, `.gitignore` | ~15k tokens |
| 2026-11-02 | Mascota integrada en 9 lugares (lista `MASCOT`), caché v11 con las 12 poses usadas | `mirun.html`, `app.css`, `app.js`, `sw.js`, `docs/*`, `CLAUDE.md` | ~35k tokens |
| 2026-11-02 | Mascota: revisión de 2 juegos de imágenes, recorte de 15 poses con transparencia real a 256 px en `img/mascota/` | `img/mascota/*`, `.claude/herramientas/*` | ~30k tokens |
| 2026-11-02 | Logro Todoterreno: 🌈 → 🚙 (pedido del usuario) | `app.js` | ~3k tokens |
| 2026-11-02 | Separación en mirun.html + app.css + app.js; logros por categorías con nombres del diseñador y 3 estados de insignia | `mirun.html`, `app.css`, `app.js`, `sw.js` (v10), `docs/*`, `CLAUDE.md` | ~40k tokens |
| 2026-11-02 | Etapa 4 (parte): medidas a elección + 4 nuevas con instrucciones, estatura e IMC, menú con "+", Perfil arriba, descanso programado; vista previa de siluetas y medallas | `mirun.html`, `docs/*`, `CLAUDE.md` | ~70k tokens |
| 2026-11-02 | Etapa 3: logros (19 medallas con progreso), aviso "¡Nuevo logro!" con voz, pestaña Logros | `mirun.html`, `docs/*`, `CLAUDE.md` | ~45k tokens |
| 2026-11-02 | Etapas 0, 1 y 2: protección de datos, tipos de actividad (GPS correr/caminar/bici + 7 actividades a mano), calorías por MET, racha, calendario, metas diaria/semanal, días de descanso, pantalla Inicio, pruebas | `mirun.html`, `docs/*`, `CLAUDE.md` | ~150k tokens |
| 2026-11-01 | Diseño azul v5, menú inferior con íconos, saludo con nombre, sexo opcional, Abdomen + Cintura, `CACHE_NAME` v9, servidor de pruebas, documentación | `mirun.html`, `sw.js`, `manifest.json`, `index.html`, `.claude/*`, `CLAUDE.md`, `docs/*` | ~90k tokens |
| 2026-11-01 | Análisis del proyecto y de la propuesta (sin cambios de código) | — | ~45k tokens |
