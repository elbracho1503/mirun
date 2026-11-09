# MiRun — guía para IAs (leer esto primero)

App web (PWA) de actividad física: correr con GPS, mediciones corporales, metas y (en desarrollo)
rachas y logros. Todo en español. Lema: "Tu cuerpo, tu mejor versión".
Sin servidor ni cuentas: los datos viven en `localStorage` del teléfono. Funciona sin internet.
Publicada en GitHub Pages: https://elbracho1503.github.io/mirun/

## Cómo trabajar aquí (ahorrar tokens)
- La app está en 3 archivos: `mirun.html` (pantallas, ~380 líneas), `css/app.css` (estilos), `js/app.js` (lógica).
  **No leas ninguno completo**: busca el marcador de la sección
  (`grep -n "MARCADOR" js/app.js`) y lee solo ese bloque.
- Antes de explorar, revisa `docs/`: probablemente la respuesta ya está ahí.
- Al terminar un cambio: actualiza el doc afectado y agrega una línea a `docs/CAMBIOS.md`
  con el costo aproximado en tokens. Decirle al usuario ese costo.
- Decisiones → `docs/DECISIONES.md`. Avance por etapas → `docs/PLAN.md`.

## Probar la app
- Servidor local sin dependencias: `node .claude/serve.js` → http://localhost:8080/mirun.html
  (configurado en `.claude/launch.json` como "mirun"). No entrega `sw.js`, así no hay caché vieja.
- Si un navegador ya tiene el Service Worker, borrar caché / desregistrarlo para ver cambios.
- Probar sin GPS real: guardar un `mirun_current` falso en localStorage y usar "Guardarla así".
- El navegador integrado no registra Service Workers en localhost. El modo offline se prueba en el celular real.

## Archivos
| Archivo | Qué es |
|---|---|
| `mirun.html` | Estructura HTML de las pantallas (sin estilos ni código) |
| `css/app.css` | Todos los estilos |
| `js/app.js` | Toda la lógica (secciones con marcadores `// ---------- NOMBRE`) |
| `index.html` | Solo redirige a `mirun.html` |
| `sw.js` | Service Worker (modo sin internet). `CACHE_NAME` = versión de caché. Las imágenes de la mascota NO están en `FILES_TO_CACHE`: la app manda el mensaje `mascota` (`syncCharacterCache`) y se guardan solo las del compañero elegido |
| `manifest.json` | Instalación como app (íconos en `img/iconos/`: 192 y 512 "any", `icon-512-maskable.png` (imagen al 80 % para el círculo de Android), 180 para iPhone) |
| `lib/leaflet.*` | Librería de mapas, copia local. No editar |
| `img/mascota/` | 15 poses de **Brío**, la mascota principal (antes "MIRUN Monster"; PNG 256 px transparentes) |
| `img/zafira/`, `img/nova/`, `img/tizon/` | Poses de los otros personajes (PNG 256 px; Nova y Tizón tienen 14: una pose apunta a otro archivo, ver `CHARACTERS`) |
| `img/siluetas/` | Siluetas del cuerpo: masculina, femenina, neutra (PNG 640 px de alto, transparentes) |
| `img/bienvenida.jpg` | Imagen de la pantalla de bienvenida (600 px, 80 KB, sí va al caché) |
| `img/icono-original.png`, `img/siluetas-original.png`, `img/bienvenida-original.jpg` | Imágenes originales del usuario (no van al caché) |
| `.gitignore` | Excluye `respaldo/` de GitHub |
| `.claude/herramientas/` | Scripts Node sin dependencias: `png_lib.js` (leer/escribir PNG), `recortar.js` (cortar hoja de poses) |
| `respaldo/` | Copias de versiones anteriores de `mirun.html` antes de cambios grandes. También `respaldo/personajes-original/`: hojas de poses originales de Zafira, Nova y Tizón (no se suben a GitHub) |
| `docs/DATOS.md` | Esquema de datos en `localStorage` |
| `docs/DISENO.md` | Colores, componentes y reglas visuales |
| `docs/DECISIONES.md` | Decisiones tomadas y pendientes |
| `docs/PLAN.md` | Plan por etapas y estado |
| `docs/CAMBIOS.md` | Registro de cambios con costo en tokens |
| `docs/PROMPTS.md` | Prompts para generar imágenes (siluetas, ícono) y lecciones aprendidas |
| `docs/NATIVA.md` | Plan para la app nativa con Capacitor (F4): instalación, migración de datos, Health Connect, GPS con pantalla apagada |

## Mapa de mirun.html
Los números de línea cambian; busca por marcador. CSS → `css/app.css`, HTML → `mirun.html`, `//` → `js/app.js`.

| Zona | Marcador |
|---|---|
| CSS base (variables en `:root`) | `<style>` |
| CSS del diseño azul (encima del base) | `DISEÑO v5` |
| Cabecera (botón Perfil) y menú inferior con "+" | `<header>`, `Menú inferior`, `id="plusSheet"` (CSS: `MENÚ CON "+"`) |
| CSS de Inicio, calendario, chips | `INICIO: racha` |
| Pantallas HTML | `<!-- HOME SCREEN`, `RUN SCREEN`, `GOAL`, `HISTORY`, `RECORDS`, `BODY`, `PROFILE` |
| Formulario de actividad (HTML) | `id="actForm"` |
| Resumen al terminar | `id="summaryOverlay"` |
| Lectura/escritura de datos, versión `SCHEMA` | `// ---------- STORAGE` |
| Mascota: personajes (`CHARACTERS`, `DEFAULT_CHAR`, `poseSrc`), qué pose va en cada momento (`MASCOT`, `mascotMsg`) y reacciones (`mascotReact`, `mascotTap`, gestos espontáneos `mascotGesture`) | `// ---------- MASCOTA` (CSS: `MASCOTA (Brío` y `MASCOTA: movimiento`) |
| Lista de actividades (`ACTIVITIES`, MET) | `// ---------- TIPOS DE ACTIVIDAD` |
| Pestañas (`showTab`, `data-goto`) | `// ---------- TABS` |
| Perfil: saludo, foto (`mirun_photo`), "Elige tu compañero" (`renderCharPick`, `setCharacter`, `profile.character`), objetivo y nivel (`GOAL_TYPES`, `LEVEL_WEEK`) | `// ---------- PROFILE` |
| Metas (carrera, racha, semanal, descanso) | `// ---------- GOAL` |
| Dibujo de ruta (canvas) | `// ---------- ROUTE DRAWING` |
| Mapa con calles (Leaflet) | `// ---------- MAPA CON CALLES` |
| Mapa grande a pantalla completa ("Ver mapa" en Historial y resumen; zoom y arrastre; línea sin internet) | `// ---------- MAPA GRANDE` (HTML: `id="bigMap"`, CSS: `MAPA GRANDE`) |
| Historial (incluye "≈ N pasos") | `// ---------- HISTORY` |
| Pasos estimados (`stepsOf`, `stepsTxt`; no se guardan) | `// ---------- PASOS` |
| Editar actividad (hoja, `origDate`, `edited`) y barra "Deshacer" | `// ---------- EDITAR ACTIVIDAD` (HTML: `id="editSheet"`, `id="undoBar"`; CSS: `EDITAR ACTIVIDAD`) |
| Carrera a mano | `// ---------- CARRERA A MANO` |
| Récords | `// ---------- RECORDS` |
| Mediciones (`MEASURES`, medidas a seguir, IMC, silueta `BODY_POS`, puntos del cuerpo `BODY_PTS` y líneas `drawBodyLines`) y gráfico compartido `drawChart` | `// ---------- CUERPO` (CSS: `SILUETA DEL CUERPO`) |
| Evolución: vistas Actividad / Cuerpo, períodos, gráficos y comparación (`renderEvo`) | `// ---------- EVOLUCIÓN` (HTML: `id="evoTabs"`, CSS: `EVOLUCIÓN`) |
| GPS, tiempo, calorías, splits | `// ---------- RUN LOGIC` |
| Voz | `// ---------- AVISO POR VOZ` |
| Carrera en curso / iniciar / terminar (`body.gpsOn` mientras se registra) | `// ---------- CARRERA EN CURSO` (CSS: `GPS EN CURSO`) |
| Modo bolsillo (bloqueo de toques durante el GPS) | `// ---------- MODO BOLSILLO` (HTML: `id="lockOverlay"`) |
| Pantalla encendida | `// ---------- PANTALLA ENCENDIDA` |
| Racha, minutos por día, Inicio, calendario (`renderCal`, `calMonth`), saludo de regreso (`welcomeBack`), registrar actividad | `// ---------- RACHA Y REGISTRO` (HTML: `id="calGrid"`, CSS: `INICIO: racha`) |
| Celebración de la meta del día (`maybeCelebrate`, `playCheer`, `celebrate`; `mirun_celebrated`, `profile.sounds`) | `// ---------- CELEBRACIÓN` (CSS: `CELEBRACIÓN`, HTML Perfil "Sonidos y vibración": `id="profSounds"`) |
| Logros (`ACH`), próximo logro (`nextAchievement`), medallas y aviso "¡Nuevo logro!" | `// ---------- LOGROS` (CSS: `LOGROS: medallas`, HTML: `id="achOverlay"`) |
| Exportar / importar copia | `// ---------- COPIA DE SEGURIDAD` |
| Bienvenida (solo la primera vez y sin datos; `mirun_welcomed`) | `// ---------- BIENVENIDA` (HTML: `id="welcome"`, CSS: `BIENVENIDA`) |

## Publicar (GitHub Pages)
- Esta carpeta es el repositorio Git (`origin` = github.com/elbracho1503/mirun, rama `main`).
  Publicar = commit + `git push`; GitHub Pages actualiza en 1–2 min. **Solo cuando el usuario lo pida.**
- Autor de los commits: `elbracho1503 <332559409+elbracho1503@users.noreply.github.com>` (correo privado de GitHub, ya configurado).
  Nunca usar un correo real.
  El repositorio es **público** y el correo de cada commit queda visible.
- `respaldo/` está en `.gitignore` (no se sube).

## Reglas que no se rompen
1. **Nunca perder datos del usuario.** No borrar ni renombrar claves de `localStorage` ni campos
   existentes; solo agregar. Detalle en `docs/DATOS.md`.
2. Si se agrega un campo a un registro, actualizar también la **importación de copias**
   (`COPIA DE SEGURIDAD`), que solo acepta campos conocidos.
3. Si cambia `mirun.html`, `css/app.css`, `js/app.js` (o cualquier archivo cacheado), **subir `CACHE_NAME` en `sw.js`**.
   Un archivo nuevo se agrega también a `FILES_TO_CACHE`.
4. Sin scripts externos: la CSP del `<head>` solo permite código propio, Google Fonts y
   tiles de OpenStreetMap. Íconos = SVG en línea.
5. Trabajo incremental: no reconstruir la app. Pedir aprobación antes de cambios grandes.
6. App inclusiva: el sexo es opcional y nunca bloquea funciones ni mediciones.
7. El nombre de la app es **MiRun** (decisión del usuario; no cambiarlo).
8. Planes comerciales, precios, venta o estrategia de negocio NUNCA van en archivos que se suban a GitHub. Van solo en docs/privado/ (ignorado por git).
9. Nunca reescribir historial (rebase, reset, amend, push --force) sin aprobación previa del usuario, ni siquiera en ramas de prueba.
