# Decisiones

## Tomadas
- App 100 % local (sin servidor ni cuentas). Datos en `localStorage`; respaldo por archivo .json.
- Un solo archivo `mirun.html`; Leaflet copiado en `lib/` para no depender de otros servidores.
- **Nombre: MiRun** (se mantiene) + lema "Tu cuerpo, tu mejor versión". (2026-11-01)
- **Diseño: el azul de la imagen de referencia** (ver `docs/DISENO.md`). (2026-11-01)
- **Medidas:** Abdomen (clave `barriga`, ombligo), Cintura, Cadera, Pecho, Hombros, Bíceps,
  Antebrazo, Muslo, Pantorrilla, Peso. **Sin cuello.** Cada persona elige cuáles seguir. (2026-11-02)
- **Estatura en el Perfil**; el IMC se muestra en Cuerpo con aviso de que es solo referencia. (2026-11-02)
- **Sexo opcional** ("Prefiero no decir"); solo afecta la estimación de calorías. (2026-11-01)
- **Silueta: sí**, masculina / femenina / neutra según el perfil (neutra = figura tipo maniquí,
  sin rasgos de sexo; se usa con "Prefiero no decir"). Estilo pendiente de aprobar (ver abajo).
- **Racha:** mínimo 20 min por defecto (configurable 10–60). (2026-11-02)
- **Descanso:** máximo 3 días por semana, **programados con anticipación**: un cambio rige desde
  el lunes siguiente (`goal.restPlan`). (2026-11-02)
- **Menú:** Inicio · Historial · **+** · Cuerpo · Logros. El "+" abre: correr / caminar / bici con
  GPS o registrar otra actividad. **Perfil** = botón redondo arriba a la derecha. El estado del GPS
  solo se ve en la pantalla GPS. Metas: desde Inicio y Perfil. (2026-11-02)
- **Pestaña Logros** aprobada. (2026-11-02)
- **Íconos de actividades: emojis** (aprobado). (2026-11-02)
- Una actividad que pasa de medianoche cuenta para el día en que empezó.
- Pasos diarios: **no se puede** en una app web.
- Racha, récord de racha y logros se **calculan** desde el historial.
- Un solo historial (`mirun_history`) con campo `type`; sin `type` = "correr".
- **Avatar sin foto: iniciales del nombre** sobre azul (o ícono de persona si no hay nombre), en vez del círculo negro. (2026-11-08)
- **appId de la app nativa (Android): `mirun.app.desafio`.** Decidido por el usuario (2026-11-05). No se puede
  cambiar después de publicar en Play Store. Se usa en `npx cap init` y `capacitor.config.json` (ver `docs/NATIVA.md`).

## Pendientes (el usuario decide)
1. ~~Mascota~~ → integrada (ver "Tomadas"). Poses sin usar aún: 05 Decidido, 08 Agotado, 11 Frustrado.
2. ~~Silueta~~ → hecha el 2026-11-03 con la imagen del usuario (3 figuras en `img/siluetas/`).
3. Logros legendarios (dorados): Veterano, Leyenda, Maestro del tiempo, Conquistador, Media maratón
   (el más difícil de cada categoría). Propuesta de la IA, el usuario puede cambiarla.


## Tomadas el 2026-11-02 (tarde)
- **Separar en 3 archivos**: `mirun.html` + `css/app.css` + `js/app.js` (hecho).
- **Logros**: nombres y emojis del diseñador, agrupados en 7 categorías, 3 estados
  (bloqueado gris con candado · desbloqueado azul · legendario dorado). Ids sin cambiar.
- **Mascota MIRUN Monster integrada** (2026-11-02): poses según la lista `MASCOT` en `js/app.js`.
  Inicio: ¡Tú puedes! / Emocionado (meta cumplida) / Durmiendo (descanso) / Cansado (racha reiniciada en
  los últimos 3 días). Logro: Celebrando; legendario: Aprobación. GPS: Corriendo. "+": Pesas.
  Guardar actividad: Cariño. Error: Pensando. Vacío: Asomado. IMC: Estudiando.
  Solo las 12 poses usadas están en el caché sin internet (`sw.js`).

## Repositorio público (2026-11-02)
- github.com/elbracho1503/mirun es **público**: cualquiera puede ver y copiar el código, la documentación
  y la mascota. Los datos de las personas NO están ahí (viven solo en cada teléfono).
- Un commit quedó con un correo personal del usuario como autor (error de la IA); se corrigió el
  historial el 2026-11-02 (ver CAMBIOS). Los commits usan el correo privado "noreply" de GitHub.
Ver docs/privado/NEGOCIO.md (local)
