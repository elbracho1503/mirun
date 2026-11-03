# Plan por etapas

Estado: ⬜ pendiente · 🟨 en curso · ✅ hecho.

| # | Etapa | Estado |
|---|---|---|
| D | Diseño azul, menú inferior, saludo con nombre, sexo opcional, abdomen + cintura | ✅ 2026-11-01 |
| 0 | Proteger datos: aviso si no se pudo guardar, `mirun_schema`, importación con campos nuevos, recordatorio de copia | ✅ 2026-11-02 |
| 1 | Tipos de actividad: `type`, GPS para correr/caminar/bici, registro a mano (tipo, hora, duración, intensidad), calorías por MET, récords solo de carrera | ✅ 2026-11-02 |
| 2 | Racha + calendario + metas diarias/semanales + días de descanso + pantalla Inicio | ✅ 2026-11-02 |
| 3 | Logros (19 medallas: actividades, racha, semana, horas, km, distancias de carrera, variedad) y aviso "¡Nuevo logro!" | ✅ 2026-11-02 |
| 4 | Mediciones: elegir cuáles seguir, pecho/cadera/hombros/antebrazo con instrucciones, estatura en perfil, IMC ✅ · silueta ⬜ (esperando imágenes del usuario) | 🟨 |
| 4b | Menú con "+" central, Perfil arriba, descanso programado por semana | ✅ 2026-11-02 |
| 3b | Logros por categorías con nombres del diseñador, 3 estados (bloqueado, desbloqueado, legendario) | ✅ 2026-11-02 |
| 3c | Mascota MIRUN Monster: Inicio (con mensaje según el día), aviso de logro, GPS, menú "+", formularios, historial vacío, IMC | ✅ 2026-11-02 |
| P | Publicado en GitHub Pages (v5, caché v11). Carpeta ordenada (`css/`, `js/`, `img/`) y conectada a Git | ✅ 2026-11-02 |

## Próximas etapas (en este orden, aprobado por el usuario 2026-11-02)
| # | Etapa | Estado |
|---|---|---|
| 6 | **Perfil y objetivos**: foto de perfil, objetivo físico, nivel de actividad; la copia de seguridad incluye perfil, metas y foto | ✅ 2026-11-02 |
| 6b | Unidades (kg/lb, km/millas, cm/pulgadas) | ⬜ |
| 7 | **Ícono de la app** con el logo M de ChatGPT (esperando imagen del usuario) | ⬜ |
| 8 | **Modo bolsillo**: botón que bloquea los toques durante el GPS (la pantalla se sigue viendo); se desbloquea manteniendo presionado el candado 1,5 s | ✅ 2026-11-02 |
| 9 | **Evolución**: minutos/semana, calorías, metas cumplidas, comparar fechas | ⬜ |
| 10 | Editar actividades (hoy solo se borran) | ⬜ |
| 11 | Calendario completo ("Ver todo": meses anteriores) | ⬜ |
| 12 | Silueta del cuerpo con medidas (esperando imágenes del usuario, prompt en DECISIONES) | ⬜ |
| 13 | Usar poses sin uso: Decidido, Agotado, Frustrado | ⬜ |

## Futuro grande (cada uno es un proyecto; se planea aparte antes de empezar)
| # | Proyecto | Qué implica |
|---|---|---|
| F1 | **Cuentas y respaldo en la nube** | Servidor (ej. Firebase o Supabase), inicio de sesión. Base para todo lo siguiente. La copia manual deja de ser necesaria. |
| F2 | **Comunidad de amigos** | Elegir amigos y ver entre ustedes logros, rachas y metas. Requiere F1 y reglas de privacidad. |
| F3 | **App en Play Store** | Empaquetar la PWA (TWA/PWABuilder) o como app nativa (Capacitor). Cuenta de desarrollador de Google (pago único). |
| F4 | **GPS con pantalla apagada / app en segundo plano** | Una web no puede seguir el GPS con la pantalla apagada. Requiere app nativa (va junto con F3). Mientras tanto: modo bolsillo (etapa 8). |
| F5 | **Vender la app** (suscripción o pago) | Requiere F1 y F3; cobro con Google Play Billing. Antes: repositorio privado (el código hoy es público). |
| F6 | **Recordatorios** ("¡no pierdas tu racha!") con la app cerrada | Requiere servidor de notificaciones o app nativa. |

## Reglas de la racha (implementadas)
- Un día cuenta si la suma de minutos de actividad ≥ mínimo (por defecto 20, configurable 10–60).
- Actividades que se cruzan en el tiempo se unen (no se cuentan dos veces).
- Días de descanso (máx. 3 por semana): no rompen la racha ni la suman.
- El día de hoy solo rompe la racha cuando termina.
- La actividad cuenta para el día en que **empezó**.

## Pruebas hechas (2026-11-02, navegador en tamaño celular)
Racha con datos cada 2 días = 1 · agregar ayer = 3 · cruce gimnasio+yoga = 40 min (no 60) ·
descanso mar/jue → racha 5 · tope 3 descansos · validación de duración y fecha futura ·
importar copia con bici y tipo inventado (bici se conserva, lo inventado se descarta, récords sin cambio) ·
recuperar caminata GPS a medias → guardada como caminata con 126 kcal.
Logros: al abrir por primera vez no se anuncian los que ya tenías · dos logros nuevos salen uno tras otro · contador "7 de 19".
