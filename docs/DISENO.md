# Diseño visual (v5, azul)

Basado en la imagen de referencia que eligió el usuario (estilo "Tu cuerpo, tu mejor versión").
El CSS base sigue en `<style>`; el diseño v5 está en el bloque `DISEÑO v5` al final del `<style>`
y sobrescribe lo necesario. Para cambiar colores, editar solo las variables de `:root`.

## Colores (`:root`)
| Variable | Valor | Uso |
|---|---|---|
| `--bg` | `#070d1f` | Fondo (con brillo azul arriba) |
| `--track` | `#0f1a33` | Tarjetas |
| `--track2` | `#13203d` | Campos, fondos internos |
| `--lane-line` | `#1e2c4d` | Bordes |
| `--signal` | `#4d9bff` | Azul de acento (nombre heredado de v4) |
| `--grad` | degradado azul | Botón principal y tarjeta grande |
| `--gold` | `#f5b82e` | Rachas, récords, logros |
| `--good` | `#34d399` | Progreso positivo, "Guardado" |
| `--amber` / `--danger` | naranja / rojo | Avisos |

## Reglas
- Letra: Inter (Google Fonts). Números con `.num` (tabular, negrita).
- Esquinas redondeadas: tarjetas 18px, botones 16px, campos 12px.
- Menú fijo abajo con íconos SVG en línea (sin librerías).
- Ancho máximo 480px; pensado para celular en vertical.
- Colores dentro del JS (canvas/mapas) usan los mismos valores en hex.

## Mascota: personajes y movimiento (2026-11-06)
- Personajes en `CHARACTERS` (`js/app.js`, sección MASCOTA). Hoy solo **MIRUN Monster** (`img/mascota/`), el
  principal y el que se usa por defecto (`DEFAULT_CHAR`). Agregar uno = sumar su carpeta y sus poses a la lista
  (y sus archivos a `FILES_TO_CACHE`). Si le falta una pose, se usa la de Monster. Aún no hay selector.
- `MASCOT` dice qué **pose** va en cada momento (por nombre, vale para cualquier personaje).
- Movimiento solo con CSS `transform` (bloque `MASCOTA: movimiento` en `css/app.css`):
  - Reposo: respira suave (`mIdle`), solo en Inicio y en el aviso de logro. Triste: más lento y cabizbaja (`mSadIdle`).
  - Reacciones de una vez (`mascotReact`): `mCheer` (logro nuevo y meta del día cumplida), `mSad` (racha
    rota), `mWave` (saluda en la bienvenida), `mHop` (al tocarla). 5 toques en 3 s: pose "frustrado".
  - Con "reducir movimiento" del teléfono (`prefers-reduced-motion`) no se mueve; solo cambia la pose.
- Poses nuevas en uso: Decidido (Inicio, ya hay minutos hoy pero falta), Agotado (al guardar una actividad
  de 60 min o más), Frustrado (reacción a 5 toques seguidos). La racha rota sigue con Cansado
  (decisión del usuario, 2026-11-06: Frustrado se ve enojado, no triste).

