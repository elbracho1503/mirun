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
| 5 | Evolución: minutos/semana, calorías, metas cumplidas, comparar fechas | ⬜ |

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
