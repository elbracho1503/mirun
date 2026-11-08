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
  - Reposo: flota suave 8 px en 5 s (`mIdle`), solo en Inicio y en el aviso de logro. Triste: más lento y cabizbaja (`mSadIdle`).
  - Gestos espontáneos en Inicio cada 8 a 10 s (`mascotGesture`): saltito (`mHop`), inclinación (`mTilt`) o cambio de
    pose por 1,5 s (Aprobación, Emocionado, Tú puedes o Cariño). Se pausan con la app oculta (`visibilitychange`), fuera de
    Inicio, con otra capa encima o con "reducir movimiento". Durmiendo no se mueve; triste solo se inclina.
  - Al tocarla: salto marcado de 30 px (`mHop`, 0,7 s).
  - Reacciones de una vez (`mascotReact`): `mCheer` (logro nuevo y meta del día cumplida), `mSad` (racha
    rota), `mWave` (saluda en la bienvenida), `mHop` (al tocarla). 5 toques en 3 s: pose "frustrado".
  - Con "reducir movimiento" del teléfono (`prefers-reduced-motion`) no se mueve; solo cambia la pose.
- Poses nuevas en uso: Decidido (Inicio, ya hay minutos hoy pero falta), Agotado (al guardar una actividad
  de 60 min o más), Frustrado (reacción a 5 toques seguidos). La racha rota sigue con Cansado
  (decisión del usuario, 2026-11-06: Frustrado se ve enojado, no triste).

## Celebración de la meta del día (2026-11-06)
- Solo cuando la meta del día pasa de "falta" a "cumplida" al registrar, editar o deshacer una actividad, y una vez
  por día (`mirun_celebrated`). Al abrir la app o importar una copia no se celebra.
- Sonido: arpegio do-mi-sol-do con Web Audio (sin archivos), unos 0,7 s, volumen moderado, y vibración suave
  `[40, 60, 40]`. Los dos se apagan con "Sonidos y vibración" en Perfil (`profile.sounds`).
- Capa `.celebrate` encima de todo, sin bloquear toques, que se borra sola a los 3,4 s: 36 papelitos de confeti
  (solo transform) y una tarjeta con la mascota "celebrando", "¡Meta de hoy cumplida!" y la racha.
- "Reducir movimiento": sin confeti ni animación (la tarjeta aparece quieta), con sonido y vibración.
- Si a la vez se gana un logro, el aviso "¡Nuevo logro!" espera a que termine la celebración (3,4 s).

## Pantallas: ajustes de diseño (2026-11-08, rama `prueba/diseno`)
- **GPS en curso** (`body.gpsOn`): sin menú inferior, sin "+", sin saludo ni botón de perfil. Pausar/Reanudar
  grande y principal, fijo abajo; debajo, más chicos, "Bloquear pantalla" y "Terminar" (contorno rojo). Al terminar
  todo vuelve.
- **Inicio**: "+ Registrar actividad" y "Salir con GPS" van arriba, después de Hoy/Esta semana y antes del calendario.
- **Bienvenida**: "Empezar" es el botón principal (a lo ancho); "Saltar por ahora" es un enlace discreto debajo.
- **Evolución > Cuerpo**: orden "Tu progreso" → "Registrar medición" → IMC → silueta → gráfico → medidas a seguir → guardadas.
- **Logros**: arriba "Tu próximo logro": el bloqueado con más avance, cuánto falta en palabras ("Te falta 1 día para Semana eléctrica") y barra. Las rachas cuentan desde la racha actual.
- **Avatar sin foto** (cabecera y Perfil): iniciales del nombre (primera y última palabra) en blanco sobre `--grad`; sin nombre, ícono de persona.
