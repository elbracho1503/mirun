# Datos guardados (localStorage)

Todo se lee/escribe con `LS.get` / `LS.set` (sección `// ---------- STORAGE`).
`LS.set` devuelve `true/false` y, si el almacenamiento está lleno, avisa una vez por sesión.

| Clave | Tipo | Identificador |
|---|---|---|
| `mirun_history` | Array de actividades (carreras y demás) | `date` (ISO con hora) |
| `mirun_body` | Array de mediciones | `date` (`AAAA-MM-DD`, una por día) |
| `mirun_profile` | Objeto | — |
| `mirun_goal` | Objeto | — |
| `mirun_current` | Objeto o ausente | Actividad GPS en curso; se borra al terminar o con "Borrarla" (pide confirmación), nunca sola. Desde 2026-11-18: si es de hace más de 6 h se avisa y, sin pausa, el rato con la app cerrada no cuenta (al seguir o al guardarla así). Desde 2026-11-18 agrega la pausa automática: `autoPaused`, `pauseAt`, `pauseStartedAt`, `autoPausedMs`, `autoPauses`, `autoAsked` (ya preguntó a los 10 min en esta pausa). Desde 2026-11-05 agrega `lastVoiceMi` y `lastVoiceTime` (aviso por voz en millas; si faltan se calculan) |
| `mirun_schema` | Número | Versión del formato de datos (hoy 5) |
| `mirun_lastBackup` | Texto ISO | Fecha de la última copia exportada (para el recordatorio) |
| `mirun_photo` | Texto (data URL JPEG 256 px, ~30 KB) | Foto de perfil (v5). Va en la copia de seguridad |
| `mirun_achSeen` | Array de ids | Logros ya anunciados (los logros en sí se calculan desde el historial) |
| `mirun_welcomed` | `true` | Ya se mostró (o se saltó) la bienvenida, o al abrir ya había datos. No va en la copia (solo controla esa pantalla) |
| `mirun_celebrated` | `'AAAA-MM-DD'` | Último día en que se celebró la meta del día cumplida (para no repetir). No va en la copia (solo controla la celebración) |
| `mirun_welcomeBack` | `'AAAA-MM-DD'` | Día de la última actividad antes del último regreso ya saludado con "¡Qué bueno verte de vuelta!" (para mostrarlo una vez por regreso). No va en la copia |
| `mirun_routines` | Array | Rutinas de fuerza de la persona: `{id, name, created, items:[{ex \| name, kind:'reps'\|'secs', amount, sets}]}` (`ex` = clave de `EXERCISES`; un ejercicio propio guarda `name`). Hasta 50 rutinas y 30 ejercicios por rutina. Desde 2026-11-24 (modo guiado): `mode: 'ejercicio'|'circuito'` (sin campo = por ejercicio) y `rest` = segundos de descanso entre series, 1 a 600 (sin campo = sin descanso). Va en la copia (ver más abajo) |
| `mirun_session` | Objeto o ausente | Sesión de rutina en curso `{rid, name, items:[{…ejercicio, done}], start, startTime, elapsedBefore, paused, savedAt}`; modo guiado (desde 2026-11-24) agrega `guided:true, mode, rest, order:[{i, s}], pos`, y `restEndsAt` (descanso corriendo) o `restLeft` (ms de descanso en pausa). Una sesión sin `guided` (versión anterior) se retoma en la vista de lista; se borra solo al guardar o descartar (nunca sola). Al abrir la app vuelve en pausa desde el último guardado; si pasaron más de 12 h se abre "Terminar" con la pregunta "¿Guardar lo hecho o descartar?" y se guarda `ask:true` hasta que se reanude, guarde o descarte. Si a la vez hay un `mirun_current`, la app abre en Correr y avisa de las dos. No va en la copia |
| `mirun_phrases` | Objeto | Frase del día por lugar: `{inicio\|correr\|cortas\|superacion: {day:'AAAA-MM-DD', text, used:[textos ya mostrados en esta vuelta]}}`. Solo controla qué frase se muestra; no va en la copia |
| `mirun_weekplan` | Objeto | Planeador de la semana: `{"0".."6": id de rutina}` (0 = domingo). Al borrar una rutina, su día queda libre. Va en la copia (`weekplan`): la importación solo acepta días 0 a 6 con rutinas que existen y solo completa días vacíos |

## mirun_history — actividad
```js
{ date: '2026-10-15T07:30:00.000Z', // id único (si choca se suma 1 s)
  type: 'correr',      // v5. SIN type = 'correr' (todos los registros viejos). Ver ACTIVITIES
  dist: 5.02,          // km; 0 en actividades sin distancia (gimnasio, yoga...)
  seconds: 1800,
  pace: '05:58',       // texto min/km; '--:--' si no aplica
  cal: 350,
  path: [{lat, lon}],  // vacío si es a mano. Desde 2026-11-25 las rutas NUEVAS van en route y path = []
  route: [[lat, lon]], // opcional (rutas nuevas): 5 decimales, sin puntos que no cambian la forma (RUTA LIVIANA)
  splits: [{km, seconds, partial?}],
  manual: true,        // opcional: registrada a mano
  intensity: 'media',  // v5, solo actividades sin GPS: baja | media | alta
  origDate: '...',     // opcional (al editar): el date ORIGINAL, de la primera edición; nunca se sobrescribe
  edited: '...' }      // opcional: fecha ISO de la última edición
```
- **Significado de `date`:** con GPS es la hora en que **terminó**; si `manual` es la hora de
  **inicio** (las carreras a mano viejas: 12:00 del día). Ver `actRange()`.
- Tipos válidos (`ACTIVITIES`): correr, caminar, bici (con GPS) · gimnasio, ejercicios, natacion,
  deportes, baile, yoga, otros (registro a mano con intensidad).
- Los récords (`computeRecords`) solo usan carreras (`isRun`).
- Borrar y Editar buscan por `date`.
- **Editar** (`// ---------- EDITAR ACTIVIDAD`): cambia solo esa actividad. Si cambia la hora/fecha (o la
  duración de una GPS, porque su `date` es el fin) cambia `date` y se guarda `origDate` la primera vez.
  Si cambia la distancia o la duración: `splits = []` (la ruta se conserva). Ritmo y calorías se recalculan solo si
  cambió tipo, duración, distancia o intensidad (con el peso actual del perfil).
- **Importar copias:** una actividad es repetida si su `date` u `origDate` coincide con algún `date` u
  `origDate` existente. Límite: una copia hecha ENTRE dos ediciones de fecha sí se duplicaría
  (ese `date` intermedio no queda guardado).

## mirun_body — medición
```js
{ date: '2026-10-15', peso, barriga, cintura, cadera, pecho, hombros, biceps, antebrazo, muslo, pantorrilla }
// todos opcionales (kg/cm); cadera, pecho, hombros y antebrazo agregados en v5
```
- La clave `barriga` se muestra como **"Abdomen"** (a la altura del ombligo). No renombrar la clave.
- `cintura` (parte más angosta) es una medida distinta, agregada en v5.
- Las medidas se definen en `MEASURES` (sección CUERPO): `{k, n, u, id, good}`.
  `good` = 1 si subir es bueno, -1 si bajar es bueno. La importación usa esta misma lista.
- **Sesiones de rutina** (desde 2026-11-18): actividad `type:'ejercicios'`, `manual:true` (`date` = inicio), `seconds` = tiempo del
  cronómetro sin pausas, y `routine: {name, items:[{ex | name, kind:'reps'|'secs', amount, sets, done}]}` con lo que se marcó.
  El detalle no se edita (Editar solo cambia fecha, duración e intensidad; el tipo queda fijo). Una sesión guiada agrega `routine.mode`; desde 2026-11-24 también `routine.rid` (id de la rutina, para el promedio de minutos de "Hoy toca"; las viejas sin `rid` se buscan por nombre).
- **Actividades con GPS y pausa automática** (desde 2026-11-18): `seconds` es el tiempo EN MOVIMIENTO (sin pausas manuales ni
  automáticas); si hubo pausas automáticas se agregan `autoPausedSeconds` (tiempo quieta descontado) y `autoPauses` (cuántas).
  Las actividades anteriores no cambian. Editar una actividad no toca `autoPausedSeconds`. La importación acepta los dos campos.
- Guardar un `peso` también actualiza `profile.weight`.
- Escrito en lb, el `peso` nuevo se guarda en kg redondeado a 2 decimales (desde 2026-11-05; lo ya guardado no cambia).

## mirun_profile
```js
{ name: 'Alexis',            // opcional (v5), para el saludo "Hola, ..."
  weight: 70, age: 30,
  height: 175,               // v5, cm (100–250), para el IMC
  goalType: 'salud',         // v5: salud | bajar | musculo | mantener | resistencia (cambia si bajar el peso es bueno)
  level: 'ligero',           // v5: sedentario | ligero | moderado | activo | muy (meta semanal sugerida, LEVEL_WEEK)
  units: 'metric',           // v5: metric (km, kg) | imperial (mi, lb). SOLO cambia lo que se muestra: todo se guarda en km y kg
  measures: ['peso', ...],   // v5, medidas que sigue (orden de MEASURES). Sin esto = DEF_MEAS
  sex: 'm'|'f'|'x',          // 'x' = prefiero no decir (v5)
  voice: true/false, mapMode: 'calles'|'linea',
  sounds: true/false,
  character: 'monster'|'zafira'|'nova'|'tizon'|'rayo'|'jade',
  autoPause: true/false,
  faith: true/false }  // 2026-11-24: "Incluir frases de fe" (sin campo = apagado). Va en la copia y en la importación
  // 2026-11-18: pausa automática en GPS (sin campo = encendida). Va en la copia y en la importación  // 2026-11-09: compañero elegido (sin campo = Brío, 'monster'). Va en la copia; la importación solo acepta claves de CHARACTERS        // 2026-11-06: "Sonidos y vibración" de la celebración (sin campo = encendido). Va en la copia y en la importación
```
`sex` solo se usa en `metCalories` (m ×1.0, f ×0.93, x ×0.965), los pasos estimados y la silueta.
Perfil nuevo (sin `mirun_profile` guardado): `sex: 'x'` por defecto (antes `'m'`; los perfiles ya guardados no cambian).

## mirun_goal
```js
{ dist, time, paceMin, paceSec, // meta por carrera; null si no hay
  dailyMin: 20,                 // v5: mínimo diario para la racha (10–60). null = 20
  weekMin: 150,                 // v5: meta semanal en minutos. null = 150
  restPlan: [{from:'2026-11-09', days:[6]}] } // v5: descanso programado (0=domingo … 6=sábado),
                                // máx. 3; cada cambio rige desde el lunes siguiente (`restDaysOn(d)`)
// restDays: [..] (formato anterior) se lee como plan vigente desde siempre si no hay restPlan
```
Perfil y metas se guardan con `Object.assign` para no perder campos que la pantalla no muestra.

## Racha (no se guarda: se calcula)
`minutesByDay()` une los intervalos de cada día (lo que se cruza cuenta una vez) →
`dayStatus()` = done / rest / part / miss → `streakInfo()` = racha actual y récord.

## Copia de seguridad (archivo .json)
Exporta `{app:'MiRun', version:4, exported, photo, profile, goal, history, body, routines}` (`routines` desde 2026-11-18; una copia sin ese campo se importa igual).
Importa todo (copias version 2, 3 y 4), filtrando a campos y valores conocidos.
Actividades y medidas: solo agrega fechas nuevas. Perfil, metas y foto: en un teléfono sin datos se
restauran completos; si ya hay datos, solo completan lo que falta. Si se agregan campos, actualizar este filtro.
Rutinas: se agregan las que faltan (mismo `id` = ya está; sin `id` válido se le crea uno), sin pasar de 50; cada
ejercicio se limpia con `cleanRtItems` (y `mode`/`rest` con `cleanRtMeta`: valores inválidos se descartan) (clave de `EXERCISES` o nombre propio de 1 a 40, `kind` reps/secs, cantidad y
series en rango; lo inválido se descarta). El `routine` de una actividad se limpia igual y `done` queda entre 0 y `sets`.

## Memoria llena y espacio (desde 2026-11-25, rama `prueba/almacenamiento`)
- Límite medido en Chrome: 5.242.880 caracteres (clave + valor) por sitio (`LS_LIMIT`). Perfil muestra "Espacio usado: X %".
- `LS.set(k, v, mode)` devuelve false si no cabe y avisa CADA vez (salvo `mode` 'quiet' para datos que la app rehace
  sola, y 'once' para los respaldos automáticos `mirun_current` / `mirun_session`: un aviso por carrera o sesión).
  Si algo falló, la app nunca dice "guardado" (`LS.failNow`, mensajes con `NOT_SAVED`).
- `mirun_spaceWarned` = día (`AAAA-MM-DD`) del último aviso de "memoria al 80 % o más" (uno por día). No va en la copia.
- Al terminar una carrera con GPS, su respaldo `mirun_current` se borra solo después de quedar en `mirun_history`.
  Si no cabe ni quitando el respaldo, la carrera se guarda **aparte** en IndexedDB `mirun_rescue` (almacén `runs`,
  clave `date`, mismo formato que el historial). Al abrir la app vuelve al Historial y se borra de allá cuando ya quedó
  en `mirun_history`. Mientras tanto "Guardar copia" la incluye.
- `navigator.storage.persist()` se pide al abrir (sin insistir si el navegador no lo da).
- **Rutas livianas** (desde 2026-11-25): las carreras nuevas guardan `route` (`[[lat, lon]]`, 5 decimales = 1,1 m, simplificada
  con Douglas-Peucker a 2 m) y `path: []`. Las viejas NO se convierten: siguen en `path`. `routeOf(h)` lee los dos formatos.
  Distancia, ritmo, splits, calorías y récords se calculan durante la carrera con todos los puntos, antes de simplificar.
  La copia exporta los dos formatos y la importación acepta los dos (route: solo pares de números válidos, máx. 50.000).
- `favorite: true` (opcional, desde 2026-11-25): actividad marcada con la estrella del Historial; sin el campo = no favorita. Va en la copia y la importación solo acepta `true`.
