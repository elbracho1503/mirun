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
- Personajes en `CHARACTERS` (`js/app.js`, sección MASCOTA): **Brío** (clave interna `monster`, `img/mascota/`, el
  principal y por defecto), **Zafira** (`img/zafira/`), **Nova** (`img/nova/`), **Tizón** (`img/tizon/`), **Rayo** (`img/rayo/`, rojo) y **Jade** (`img/jade/`, verde). Mismos nombres de
  archivo que Brío; Nova "decidido" usa su `03_corriendo`, Tizón "cansado" su `08_agotado` y Rayo "tu_puedes" su `01_aprobacion` (el dibujo original no tiene pies). Si a uno le falta una pose, se usa la de Brío.
  Zafira, Nova, Rayo y Jade "cansado" = la pose meditando (racha rota: calma para volver a empezar).
- **Elige tu compañero** (Perfil, debajo de la foto): 4 opciones con la pose "aprobación" y el nombre; se guarda al tocar
  (`profile.character`, `setCharacter`) y cambia la mascota en toda la app.
- **Caché por personaje**: el teléfono guarda solo las imágenes del compañero elegido (mensaje `mascota` al Service Worker:
  descarga las del elegido y borra las de los otros, salvo la imagen de muestra de cada uno si ya se vio en Perfil).
  Las imágenes fijas del HTML no tienen `src` escrito (lo pone `refreshPoseImgs`), para no descargar las de Brío si se eligió otro.
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
  todo vuelve. "Terminar" pide confirmación ("¿Terminar actividad?": "Sí, terminar" / "Seguir"); Pausar no.
- **Inicio**: "+ Registrar actividad" y "Salir con GPS" van arriba, después de Hoy/Esta semana y antes del calendario.
- **Bienvenida**: "Empezar" es el botón principal (a lo ancho); "Saltar por ahora" es un enlace discreto debajo. Todo cabe sin desplazar en 360x740 y 390x844 (la imagen mide hasta el 24 % del alto de la pantalla).
- **Evolución > Cuerpo**: orden "Tu progreso" → "Registrar medición" → IMC → silueta → gráfico → medidas a seguir → guardadas.
- **Logros**: arriba "Tu próximo logro": el bloqueado con más avance, cuánto falta en palabras ("Te falta 1 día para Semana eléctrica") y barra. Las rachas cuentan desde la racha actual.
- **Botón Perfil de la cabecera** (2026-11-18): el círculo (foto o iniciales) lleva un engranaje chico abajo a la derecha y la
  palabra "Perfil" debajo; en Perfil se pone azul. La cabecera sigue midiendo 72 px (se ajustó su relleno).
- **Avatar sin foto** (cabecera y Perfil): iniciales del nombre (primera y última palabra) en blanco sobre `--grad`; sin nombre, ícono de persona.
- **Inicio, regreso**: sin actividad hoy ni los 3 días anteriores (que no sean todos de descanso), la mascota (Cariño) dice "¡Qué bueno verte de vuelta! ¿Empezamos con 10 minutos?", una vez por regreso.
- **Medidas**: si se sigue Cintura o Abdomen, el formulario muestra un torso en SVG con la línea de la cintura (azul, lo más angosto) y la del abdomen (dorada, el ombligo).

## Diseño 2 (rama `prueba/diseno2`, 2026-11-25)
Ajustes del diagnóstico hecho con Impeccable. CSS en el bloque `DISEÑO 2` al final de `css/app.css`.
- **GPS antes de salir** (sin `body.gpsOn`): solo la mascota, el tipo (Correr, Caminar, Bici) en 3 botones iguales y un
  botón grande "Empezar" abajo, encima del menú (la pantalla es una columna de alto completo y el tipo se empuja
  hacia abajo). El 0.00, tiempo/ritmo/calorías y las metas se ven solo con `body.gpsOn`. El aviso de GPS bloqueado sigue arriba.
- **Íconos en lugar de emojis**: 34 íconos de Lucide (ISC, `docs/LICENCIAS.md`) guardados como SVG en `js/app.js` (`ICONS`,
  `ico()`) y en `mirun.html`. Mismo trazo que el menú inferior (2 px, puntas redondas, `currentColor`). Actividades
  (`ACTIVITIES[].i`), medallas (`ACH[].i`), menú "+", tipo de GPS, candado, quitar (x), serie hecha (check) y "Hoy toca".
  Los emojis que quedan son parte de textos (frases), no íconos. Para agregar uno: copiar el `<path>` del SVG de Lucide a `ICONS`.
- **Historial solo como lista**: la más nueva arriba, agrupada por semana (lunes a domingo) con un título "Esta semana",
  "Semana pasada" o "17 – 23 nov" y su total (actividades, tiempo, distancia). Los formularios salieron de aquí:
  - "Registrar actividad" y "Carrera sin GPS" (antes "Agregar carrera a mano") están en la pantalla **Registrar**
    (`#tab-add`), que se abre desde el "+" ("Registrar otra actividad" y la opción nueva "Carrera sin GPS"). Mismos
    campos, ids y código: guardan exactamente lo mismo.
  - La **copia de seguridad** (Guardar copia / Recuperar copia y el aviso de copia vieja) está al final de Perfil.
