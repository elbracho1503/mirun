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
| 6b | Unidades kg/lb y km/millas (solo al mostrar; se guarda en km y kg) | ✅ 2026-11-04 |
| 6c | Aviso de voz en millas | ⬜ |
| 6d | Limpieza: redondear segundos de metas y peso de medidas guardados en unidades imperiales | ⬜ |
| 7 | **Ícono de la app**: mascota con la M (192, 512, maskable 512, 180 iPhone) | ✅ 2026-11-03 |
| 7b | Ícono maskable para Android (la M del fondo se corta en el círculo) | ⬜ |
| 8 | **Modo bolsillo**: botón que bloquea los toques durante el GPS (la pantalla se sigue viendo); se desbloquea manteniendo presionado el candado 1,5 s | ✅ 2026-11-02 |
| 9 | **Evolución**: pestaña "Evolución" (antes Cuerpo) con vistas Actividad / Cuerpo; minutos y distancia por semana o mes, ritmo promedio, comparación con el período anterior; filtros 4 semanas, 3 meses, 1 año, Todo | ✅ 2026-11-04 |
| 9c | Evolución: mostrar mejor la comparación cuando el período anterior tiene muy poca actividad (ej. +555 %) | ⬜ |
| 10 | Editar actividades (hoy solo se borran) | ⬜ |
| 11 | Calendario completo ("Ver todo": meses anteriores) | ⬜ |
| 12 | Silueta del cuerpo con medidas encima (masculina, femenina o neutra según el perfil) | ✅ 2026-11-03 |
| 12b | Líneas en la silueta que señalen cada parte del cuerpo (trabajo pequeño) | ⬜ |
| 13 | Usar poses sin uso: Decidido, Agotado, Frustrado | ⬜ |
| 14 | **Próximo:** Pasos estimados en actividades GPS (distancia ÷ largo de paso según estatura), mostrados como aproximados (≈). Trabajo pequeño | ⬜ |
| 15 | Pulido de diseño con Impeccable (modo revisión) antes de Play Store | ⬜ |

## Plan de la etapa 6b — Unidades (rama `prueba/unidades`, 2026-11-03)
- **Regla:** los datos se guardan SIEMPRE en kg y km (y ritmo en min/km). Solo se convierte al mostrar
  y al leer lo que la persona escribe. No se toca nada guardado en localStorage.
- Nuevo campo opcional `profile.units`: `'metric'` (km, kg; por defecto) o `'imperial'` (mi, lb).
  Sin el campo = métrico, así las copias de seguridad viejas siguen funcionando. La importación acepta `units`.
- Funciones de conversión en una sección nueva `// ---------- UNIDADES` de `js/app.js`.
- Pantallas: GPS (distancia y ritmo), resumen al terminar, historial y totales, carrera a mano,
  récords (ritmos), medidas (peso), IMC, logros (descripciones de distancia), metas (distancia y ritmo
  objetivo), Inicio (actividad de hoy), perfil (peso).
- Se mantienen en km a propósito: nombres de distancias de carrera (5 km, 10 km, media maratón),
  los splits por kilómetro y el aviso por voz en cada km. Medidas del cuerpo y estatura siguen en cm.
- Caché `sw.js` → v15. Pruebas en tamaño celular con km/kg y con mi/lb.

## Prioridad alta futura (2026-11-04)
| # | Proyecto | Estado |
|---|---|---|
| F4 | App nativa con Capacitor: pasos reales todo el día (Health Connect) + GPS con pantalla apagada (F4) | ⬜ |

## Futuro grande (cada uno es un proyecto; se planea aparte antes de empezar)
| # | Proyecto | Qué implica |
|---|---|---|
| F1 | **Cuentas y respaldo en la nube** | Servidor (ej. Firebase o Supabase), inicio de sesión. Base para todo lo siguiente. La copia manual deja de ser necesaria. |
| F2 | **Comunidad de amigos** | Elegir amigos y ver entre ustedes logros, rachas y metas. Requiere F1 y reglas de privacidad. |
| F6 | **Recordatorios** ("¡no pierdas tu racha!") con la app cerrada | Requiere servidor de notificaciones o app nativa. |

Ver docs/privado/NEGOCIO.md (local)

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
