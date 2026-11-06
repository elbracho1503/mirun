# MiRun como app nativa (Capacitor) — plan

Estado: **solo plan** (2026-11-05). No se instaló nada. Corresponde a F4 de `docs/PLAN.md`.
Los tamaños y versiones son aproximados: confirmarlos en la página oficial el día que se instale.

## Qué es Capacitor, en simple
Capacitor envuelve la app web que ya existe (`mirun.html`, `css/`, `js/`, `img/`, `lib/`) dentro de una
app Android de verdad. La pantalla sigue siendo la misma página. Lo que cambia es que puede usar funciones
del teléfono que el navegador no permite: GPS con la pantalla apagada, pasos de Health Connect y voz en
segundo plano. Las dos versiones salen del **mismo código**: la PWA de GitHub Pages sigue funcionando igual.

iPhone: la app de iPhone se compila **solo en una Mac con Xcode**. Desde este PC (Windows) solo se puede hacer
Android. iPhone queda fuera de este plan.

## 1. Qué hay que instalar en el PC (paso a paso)

| # | Programa | Para qué | Espacio aproximado |
|---|---|---|---|
| 1 | **Node.js LTS** (ya está instalado; ver con `node -v`) | Ejecuta las herramientas de Capacitor | ya instalado |
| 2 | **Android Studio** (incluye su propio Java, JBR) | Compila la app Android y la instala en el teléfono | 3–4 GB |
| 3 | Android SDK: Platform, Build-Tools, Platform-Tools (desde Android Studio) | Lo que Android Studio usa para compilar | 3–5 GB |
| 4 | Gradle (lo descarga Android Studio solo, la primera vez que compila) | Arma el archivo de la app | 1–3 GB |
| 5 | Paquetes de Capacitor en el proyecto (`npm install`) | `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` y los plugins | 150–300 MB |
| 6 | Emulador de Android (**opcional**; con el teléfono real por cable no hace falta) | Probar sin teléfono | 3–8 GB |

**Total: unos 8–12 GB sin emulador y 12–20 GB con emulador.** Conviene tener al menos 25 GB libres.

Pasos:
1. Ver que Node está: `node -v`. Capacitor pide una versión LTS reciente. Si la instalada no le sirve,
   lo dirá al instalar.
2. Descargar Android Studio de `developer.android.com/studio` e instalarlo con las opciones por defecto.
3. Abrir Android Studio la primera vez y dejar que el asistente descargue el SDK ("Standard").
   Después, en *SDK Manager*, confirmar que estén marcados la última *Android SDK Platform*, *Build-Tools*
   y *Platform-Tools*.
4. En el teléfono: Ajustes → Acerca del teléfono → tocar 7 veces "Número de compilación". Luego, en
   Opciones de desarrollador, activar **Depuración USB**. Conectar por cable y aceptar el aviso.
5. En la carpeta del proyecto (lo hace la IA cuando se apruebe la etapa N0):
   - `npm init -y`, luego `npm install @capacitor/core @capacitor/cli @capacitor/android`
   - `npx cap init MiRun mirun.app.desafio --web-dir www`. El `appId` es el nombre interno de la app:
     **`mirun.app.desafio`** (decidido por el usuario el 2026-11-05, ver `docs/DECISIONES.md`).
     **No se puede cambiar después de publicar.**
   - `npx cap add android`, luego `npx cap sync` y `npx cap open android` (se abre Android Studio y se toca ▶ Run).

## 2. Qué cambia en el proyecto y qué se mantiene igual

**Se mantiene igual**
- `mirun.html`, `css/app.css` y `js/app.js` siguen siendo la app. Son las mismas pantallas, datos y reglas.
- La PWA de GitHub Pages sigue funcionando para quien la usa en el navegador.
- Los datos siguen en `localStorage`, con el mismo esquema (`docs/DATOS.md`). Las reglas de "nunca perder datos"
  valen igual.

**Archivos nuevos**
| Archivo o carpeta | Qué es | ¿Va a GitHub? |
|---|---|---|
| `package.json`, `package-lock.json` | Lista de paquetes de Capacitor | Sí |
| `capacitor.config.json` | Nombre, `appId` y carpeta web (`www`) | Sí |
| `android/` | Proyecto Android que genera Capacitor | Sí (sin `android/app/build/`) |
| `www/` | Copia de los archivos web que se meten en la app (se genera, no se edita) | No (`.gitignore`) |
| `node_modules/` | Paquetes instalados | No (`.gitignore`) |
| `.claude/herramientas/copiar-www.js` | Script sin dependencias que copia `mirun.html` (como `index.html`), `css`, `js`, `img`, `lib`, `manifest.json` a `www/` | Sí |
| Llave de firma (`*.jks`, `*.keystore`) y sus contraseñas | Firma la app para Play Store | **NUNCA** (el repositorio es público). Se guarda fuera de la carpeta, con copia aparte |

**Cambios pequeños en el código**
- **Service Worker:** en la app nativa no hace falta, porque los archivos ya están dentro de la app. Solo se
  registra si NO es nativa (`window.Capacitor?.isNativePlatform()`).
- **GPS** (`RUN LOGIC`): una función que usa el plugin nativo cuando es app y `navigator.geolocation` cuando es
  PWA. El resto (filtros de temblor y saltos, splits, guardado de `mirun_current`) no cambia.
- **Voz** (`AVISO POR VOZ`): `say()` usa el plugin nativo de voz en la app. Con la pantalla apagada, la voz del
  navegador se detiene.
- **Pantalla encendida / modo bolsillo:** se pueden mantener. Con GPS en segundo plano dejan de ser obligatorios.
- **CSP** del `<head>`: revisar que permita el puente de Capacitor. En Android la página carga desde
  `https://localhost`, así que `'self'` debería bastar. Se comprueba en N0.
- Un archivo nuevo `js/nativo.js` (solo funciones puente). Si se agrega, va también a `FILES_TO_CACHE` y al mapa de `CLAUDE.md`.

## 3. Cómo se migran los datos de la PWA a la app (sin perder nada)

**Lo importante:** la app nativa **no puede leer** los datos de la PWA. La PWA guarda en el `localStorage` del
navegador (Chrome, sitio `elbracho1503.github.io`). La app nativa tiene su propio `localStorage`, separado y
vacío. No hay paso automático entre los dos.

El camino es la **copia de seguridad que ya existe** (`COPIA DE SEGURIDAD`):
1. En la PWA: Historial → **"Guardar copia"**. Se descarga `MiRun-copia-AAAA-MM-DD.json`, con historial,
   medidas, perfil, metas y foto.
2. En la app nativa: la bienvenida sale porque la app está vacía. Ahí se agrega un botón **"Tengo una copia de
   MiRun"** que abre la importación que ya existe. (Hoy habría que tocar Saltar → Historial → importar.)
3. Comprobar en la app nativa que el número de actividades y mediciones sea el mismo que en la PWA. Solo
   entonces se deja de usar la PWA. **No desinstalar la PWA ni borrar datos del navegador antes de comprobarlo.**

Lo que la copia NO lleva y qué pasa:
| Clave | Efecto en la app nueva |
|---|---|
| `mirun_achSeen` (logros ya vistos) | Los logros se recalculan desde el historial. Puede salir el aviso "¡Nuevo logro!" de logros viejos. Hay que evitarlo en N1: al importar, marcar como vistos los logros ya ganados |
| `mirun_welcomed` | Se guarda solo al importar o al cerrar la bienvenida |
| `mirun_current` (carrera en curso) | No se migra. Terminar la carrera antes de pasar |
| `mirun_lastBackup` | Empieza vacío. Solo se usa para el recordatorio de copia |

Apoyos (etapa N1):
- En la PWA, un aviso cuando exista la app: "Guarda tu copia antes de pasarte a la app".
- Importar dos veces la misma copia no duplica actividades. Ya está hecho, porque se compara por fecha y `origDate`.
- Dentro de la app nativa los datos sobreviven a reinicios y actualizaciones. Se pierden si se desinstala la
  app o si se borran sus datos en Ajustes. Por eso la copia manual sigue siendo necesaria hasta tener F1
  (nube). Revisar si el *Auto Backup* de Android incluye los datos del WebView. No asumirlo.

## 4. Pasos reales todo el día (Health Connect)

- **Qué es:** Health Connect es el almacén de salud de Android. Viene dentro del sistema en Android 14 o
  superior. En Android 9 a 13 es una app de Play Store. El contador de pasos del teléfono, Google Fit,
  Samsung Health o un reloj escriben ahí los pasos, y MiRun **solo los lee**.
- **Cómo:** con un plugin de Capacitor para Health Connect. Hay varios de la comunidad. Antes de elegir, revisar
  que esté mantenido y que lea pasos por día. Si ninguno sirve, se escribe un plugin propio pequeño en Kotlin.
- **Permiso que se pide:** `android.permission.health.READ_STEPS` (leer pasos). Lo concede el usuario en la
  pantalla de Health Connect, no en la de Android. Si el usuario dice que no, la app sigue igual con los pasos
  estimados actuales (`≈`).
- **Requisitos de Google:**
  - Declarar en el `AndroidManifest` una pantalla que explique el uso de los datos (política de privacidad).
  - Llenar en Play Console el formulario de "datos de salud". Si no se hace, la app no se publica.
- **En MiRun:** los pasos reales se mostrarían en Inicio ("Tu actividad de hoy") y en Evolución. Se guardarían
  en una **clave nueva** (por ejemplo `mirun_steps`, pasos por día). No se mezclan con `history` y no se toca
  nada existente. La copia de seguridad y la importación se actualizan también (regla 2 de `CLAUDE.md`).
- Si el teléfono no tiene Health Connect, la app no ofrece la función. No es un error.

## 5. GPS con la pantalla apagada

- **El problema hoy:** con la pantalla apagada o la app en segundo plano, Android detiene el JavaScript del
  navegador. Por eso existen "Pantalla encendida" y el modo bolsillo.
- **Cómo:** con un plugin de ubicación en segundo plano (por ejemplo `@capacitor-community/background-geolocation`).
  Mientras se corre, el plugin muestra una **notificación fija** ("MiRun está registrando tu actividad").
  Android exige esa notificación para seguir usando el GPS. También existen plugins de pago. Se prefiere uno
  gratuito y mantenido.
- **Voz con pantalla apagada:** necesita un plugin nativo de voz (por ejemplo `@capacitor-community/text-to-speech`).
- **Permisos que se piden:**
  | Permiso | Para qué | Cuándo se pide |
  |---|---|---|
  | `ACCESS_FINE_LOCATION` y `ACCESS_COARSE_LOCATION` | GPS preciso | Al tocar Iniciar la primera vez |
  | `FOREGROUND_SERVICE` y `FOREGROUND_SERVICE_LOCATION` (Android 14+) | Seguir con el GPS con la pantalla apagada (servicio con notificación) | No se muestran al usuario. Van en el manifest |
  | `POST_NOTIFICATIONS` (Android 13+) | Mostrar la notificación fija de la carrera | Al iniciar la primera carrera |
  | `ACCESS_BACKGROUND_LOCATION` ("Permitir todo el tiempo") | **Se evita.** No hace falta si el registro empieza con la app abierta (al tocar Iniciar) | No se pide |
  | `WAKE_LOCK` | Que el teléfono no se duerma a mitad del registro | No se muestra. Va en el manifest |
- **Requisitos de Google:** declarar en Play Console para qué se usa el servicio de ubicación (puede pedir un
  video corto de la función).
- **Ahorro de batería de algunas marcas** (Xiaomi, Samsung, Huawei): pueden cortar el GPS igual. Se agrega una
  ayuda en la app: "Quita a MiRun del ahorro de batería".
- El formato de datos **no cambia**: la carrera se sigue guardando en `mirun_current` y en `history` como hoy.

## 5b. Relojes inteligentes

**Etapa 1: datos de relojes a través de Health Connect.** No hace falta una app para el reloj. Relojes de
Wear OS, Samsung, Fitbit y otras, según la marca: verificar marca por marca antes de N3b, porque no todas envían
todos sus datos a Health Connect (por ejemplo Garmin). Los que sí lo hacen guardan sus datos ahí, directamente
o con su propia app del teléfono. MiRun los **lee** desde ahí, con el mismo camino que los pasos (sección 4):
| Dato | Permiso de lectura | Uso en MiRun |
|---|---|---|
| Pasos | `android.permission.health.READ_STEPS` | Pasos reales del día (Inicio, Evolución) |
| Frecuencia cardíaca | `android.permission.health.READ_HEART_RATE` | Pulsaciones promedio y máximas de una actividad, en el resumen y el Historial |
| Entrenamientos | `android.permission.health.READ_EXERCISE` | Mostrar entrenamientos hechos con el reloj y ofrecer agregarlos al historial |

- Cada permiso se pide por separado y solo cuando se usa la función. Si el usuario dice que no, todo sigue igual.
- Los datos van en **claves nuevas** (por ejemplo `mirun_hr`, frecuencia por actividad). Un entrenamiento del
  reloj solo entra a `history` si el usuario lo acepta. Así no se duplica con una actividad registrada en
  MiRun a la misma hora.
- Se actualizan la copia de seguridad y la importación (regla 2 de `CLAUDE.md`). En Play Console se declaran
  los mismos datos de salud.
- Va después de N3 (pasos), como etapa **N3b** (unos 60–90k tokens).

**Futuro: app propia para el reloj (Wear OS)**, solo si los usuarios la piden. Sería un proyecto aparte, en
Kotlin y no en Capacitor. Por ejemplo, para iniciar o pausar una carrera y ver tiempo y ritmo en la muñeca.
No se planea mientras no haya pedidos reales.

## 6. Riesgos

| Riesgo | Cómo se evita |
|---|---|
| Perder datos al pasar de la PWA a la app | Copia → importar → comprobar números → recién ahí dejar la PWA. Avisos claros (sección 3) |
| Perder la **llave de firma**: sin ella no se puede actualizar la app publicada nunca más | Guardarla fuera del repositorio, con dos copias (por ejemplo, pendrive y nube personal). Activar "Firma de apps de Google Play" |
| Subir la llave o sus contraseñas al repositorio público | `.gitignore` con `*.jks`, `*.keystore` y `key.properties`. Revisar `git status` antes de cada commit |
| Google rechaza la app por permisos de ubicación o salud | Pedir solo lo necesario (sin "todo el tiempo"), llenar las declaraciones y tener la política de privacidad |
| El GPS se corta igual en algunas marcas | Ayuda de ahorro de batería. Probar en el teléfono real, no solo en el emulador |
| Plugin de la comunidad abandonado | Elegir uno con actividad reciente. Dejar el puente en `js/nativo.js` para poder cambiarlo |
| Diferencias entre el WebView y Chrome (CSP, Leaflet, fuentes) | Probar todas las pantallas en N0 antes de tocar el GPS |
| Dos versiones (PWA y nativa) se desordenan | Un solo código. `www/` se genera con un script, nunca se edita a mano |
| Espacio en disco del PC | Revisar que haya 25 GB libres antes de instalar |
| Usar datos de salud sin política de privacidad publicada: Google rechaza la app y, en Colombia, son datos sensibles (Ley 1581 de 2012) | Publicar la política de privacidad **antes de N3** (requisito previo de la etapa) |

## 7. Orden de etapas y costo estimado en tokens

Cada etapa en su rama, con aprobación del usuario antes de empezar. Ninguna rompe la PWA.

| Etapa | Qué | Resultado para probar | Tokens aprox. |
|---|---|---|---|
| N0 | Instalar (el usuario instala Android Studio siguiendo la sección 1), crear el proyecto Capacitor, script `www/` y abrir la app tal cual en el teléfono | MiRun abre como app, con el mismo funcionamiento que la PWA | 40–60k |
| N1 | Migración: botón "Tengo una copia" en la bienvenida, logros importados marcados como vistos, aviso en la PWA | Pasar los datos de prueba de la PWA a la app sin diferencias | 30–50k |
| N2 | GPS con pantalla apagada + voz nativa + notificación fija + ayuda de batería | Salir a caminar 1–2 km con la pantalla apagada y ver la ruta completa | 80–120k |
| N3 | Pasos reales con Health Connect (`mirun_steps`, Inicio, Evolución, copia). **Requisito previo:** Política de privacidad publicada (exigida por Google para datos de salud; en Colombia son datos sensibles, Ley 1581 de 2012) | Ver los pasos del día iguales a los del contador del teléfono | 60–100k |
| N3b | Datos de relojes por Health Connect: frecuencia cardíaca y entrenamientos (sección 5b) | Ver las pulsaciones de una salida registrada con el reloj | 60–90k |
| N4 | Ícono y pantalla de inicio nativos, llave de firma, archivo para Play Store (prueba interna) | Instalar desde la prueba interna de Play Store | 40–60k |

**Total aproximado: 310–480k tokens**, sin contar las correcciones que salgan al probar en el teléfono.
Este documento costó unos 15k tokens.
