# Datos guardados (localStorage)

Todo se lee/escribe con `LS.get` / `LS.set` (sección `// ---------- STORAGE`).
`LS.set` devuelve `true/false` y, si el almacenamiento está lleno, avisa una vez por sesión.

| Clave | Tipo | Identificador |
|---|---|---|
| `mirun_history` | Array de actividades (carreras y demás) | `date` (ISO con hora) |
| `mirun_body` | Array de mediciones | `date` (`AAAA-MM-DD`, una por día) |
| `mirun_profile` | Objeto | — |
| `mirun_goal` | Objeto | — |
| `mirun_current` | Objeto o ausente | Actividad GPS en curso; se borra al terminar. Desde 2026-11-05 agrega `lastVoiceMi` y `lastVoiceTime` (aviso por voz en millas; si faltan se calculan) |
| `mirun_schema` | Número | Versión del formato de datos (hoy 5) |
| `mirun_lastBackup` | Texto ISO | Fecha de la última copia exportada (para el recordatorio) |
| `mirun_photo` | Texto (data URL JPEG 256 px, ~30 KB) | Foto de perfil (v5). Va en la copia de seguridad |
| `mirun_achSeen` | Array de ids | Logros ya anunciados (los logros en sí se calculan desde el historial) |
| `mirun_welcomed` | `true` | Ya se mostró (o se saltó) la bienvenida, o al abrir ya había datos. No va en la copia (solo controla esa pantalla) |

## mirun_history — actividad
```js
{ date: '2026-10-15T07:30:00.000Z', // id único (si choca se suma 1 s)
  type: 'correr',      // v5. SIN type = 'correr' (todos los registros viejos). Ver ACTIVITIES
  dist: 5.02,          // km; 0 en actividades sin distancia (gimnasio, yoga...)
  seconds: 1800,
  pace: '05:58',       // texto min/km; '--:--' si no aplica
  cal: 350,
  path: [{lat, lon}],  // vacío si es a mano
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
  voice: true/false, mapMode: 'calles'|'linea' }
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
Exporta `{app:'MiRun', version:4, exported, photo, profile, goal, history, body}`.
Importa todo (copias version 2, 3 y 4), filtrando a campos y valores conocidos.
Actividades y medidas: solo agrega fechas nuevas. Perfil, metas y foto: en un teléfono sin datos se
restauran completos; si ya hay datos, solo completan lo que falta. Si se agregan campos, actualizar este filtro.
