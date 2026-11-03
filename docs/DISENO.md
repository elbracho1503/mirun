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
