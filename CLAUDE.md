# MiRun — guía para IAs (leer esto primero)

App web (PWA) de actividad física: correr con GPS, mediciones corporales, metas y (en desarrollo)
rachas y logros. Todo en español. Lema: "Tu cuerpo, tu mejor versión".
Sin servidor ni cuentas: los datos viven en `localStorage` del teléfono. Funciona sin internet.
Publicada en GitHub Pages: https://elbracho1503.github.io/mirun/

## Cómo trabajar aquí (ahorrar tokens)
- La app está en 3 archivos: `mirun.html` (pantallas, ~380 líneas), `app.css` (estilos), `app.js` (lógica).
  **No leas ninguno completo**: busca el marcador de la sección
  (`grep -n "MARCADOR" app.js`) y lee solo ese bloque.
- Antes de explorar, revisa `docs/`: probablemente la respuesta ya está ahí.
- Al terminar un cambio: actualiza el doc afectado y agrega una línea a `docs/CAMBIOS.md`
  con el costo aproximado en tokens. Decirle al usuario ese costo.
- Decisiones → `docs/DECISIONES.md`. Avance por etapas → `docs/PLAN.md`.

## Probar la app
- Servidor local sin dependencias: `node .claude/serve.js` → http://localhost:8080/mirun.html
  (configurado en `.claude/launch.json` como "mirun"). No entrega `sw.js`, así no hay caché vieja.
- Si un navegador ya tiene el Service Worker, borrar caché / desregistrarlo para ver cambios.
- Probar sin GPS real: guardar un `mirun_current` falso en localStorage y usar "Guardarla así".

## Archivos
| Archivo | Qué es |
|---|---|
| `mirun.html` | Estructura HTML de las pantallas (sin estilos ni código) |
| `app.css` | Todos los estilos |
| `app.js` | Toda la lógica (secciones con marcadores `// ---------- NOMBRE`) |
| `index.html` | Solo redirige a `mirun.html` |
| `sw.js` | Service Worker (modo sin internet). `CACHE_NAME` = versión de caché |
| `manifest.json`, `icon-*.png` | Instalación como app |
| `lib/leaflet.*` | Librería de mapas, copia local. No editar |
| `img/mascota/` | 15 poses de la mascota MIRUN Monster (PNG 256 px transparentes) |
| `.claude/herramientas/` | Scripts Node sin dependencias: `png_lib.js` (leer/escribir PNG), `recortar.js` (cortar hoja de poses) |
| `respaldo/` | Copias de versiones anteriores de `mirun.html` antes de cambios grandes |
| `docs/DATOS.md` | Esquema de datos en `localStorage` |
| `docs/DISENO.md` | Colores, componentes y reglas visuales |
| `docs/DECISIONES.md` | Decisiones tomadas y pendientes |
| `docs/PLAN.md` | Plan por etapas y estado |
| `docs/CAMBIOS.md` | Registro de cambios con costo en tokens |

## Mapa de mirun.html
Los números de línea cambian; busca por marcador. CSS → `app.css`, HTML → `mirun.html`, `//` → `app.js`.

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
| Mascota: qué pose va en cada momento (`MASCOT`, `mascotMsg`) | `// ---------- MASCOTA` (CSS: `MASCOTA MIRUN Monster`) |
| Lista de actividades (`ACTIVITIES`, MET) | `// ---------- TIPOS DE ACTIVIDAD` |
| Pestañas (`showTab`, `data-goto`) | `// ---------- TABS` |
| Perfil y saludo | `// ---------- PROFILE` |
| Metas (carrera, racha, semanal, descanso) | `// ---------- GOAL` |
| Dibujo de ruta (canvas) | `// ---------- ROUTE DRAWING` |
| Mapa con calles (Leaflet) | `// ---------- MAPA CON CALLES` |
| Historial | `// ---------- HISTORY` |
| Carrera a mano | `// ---------- CARRERA A MANO` |
| Récords | `// ---------- RECORDS` |
| Mediciones (`MEASURES`, medidas a seguir, IMC) | `// ---------- CUERPO` |
| GPS, tiempo, calorías, splits | `// ---------- RUN LOGIC` |
| Voz | `// ---------- AVISO POR VOZ` |
| Carrera en curso / iniciar / terminar | `// ---------- CARRERA EN CURSO` |
| Pantalla encendida | `// ---------- PANTALLA ENCENDIDA` |
| Racha, minutos por día, Inicio, registrar actividad | `// ---------- RACHA Y REGISTRO` |
| Logros (`ACH`), medallas y aviso "¡Nuevo logro!" | `// ---------- LOGROS` (CSS: `LOGROS: medallas`, HTML: `id="achOverlay"`) |
| Exportar / importar copia | `// ---------- COPIA DE SEGURIDAD` |

## Reglas que no se rompen
1. **Nunca perder datos del usuario.** No borrar ni renombrar claves de `localStorage` ni campos
   existentes; solo agregar. Detalle en `docs/DATOS.md`.
2. Si se agrega un campo a un registro, actualizar también la **importación de copias**
   (`COPIA DE SEGURIDAD`), que solo acepta campos conocidos.
3. Si cambia `mirun.html`, `app.css`, `app.js` (o cualquier archivo cacheado), **subir `CACHE_NAME` en `sw.js`**.
   Un archivo nuevo se agrega también a `FILES_TO_CACHE`.
4. Sin scripts externos: la CSP del `<head>` solo permite código propio, Google Fonts y
   tiles de OpenStreetMap. Íconos = SVG en línea.
5. Trabajo incremental: no reconstruir la app. Pedir aprobación antes de cambios grandes.
6. App inclusiva: el sexo es opcional y nunca bloquea funciones ni mediciones.
7. El nombre de la app es **MiRun** (decisión del usuario; no cambiarlo).
