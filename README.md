# MiRun

App de actividad física: correr, caminar y bici con GPS, registro de otras actividades (gimnasio,
natación, baile, yoga…), racha diaria tipo Duolingo, logros, medidas del cuerpo con IMC y la mascota
MIRUN Monster. Lema: *Tu cuerpo, tu mejor versión*.

- Funciona sin internet después de abrirla la primera vez.
- No tiene servidor ni cuentas: todos los datos se quedan en el teléfono de cada persona.
- Abrir: https://elbracho1503.github.io/mirun/

## Para quien trabaje en el código (personas o IAs)
- Empieza por [`CLAUDE.md`](CLAUDE.md): mapa del código y reglas.
- Detalle en [`docs/`](docs/): datos guardados, diseño, decisiones, plan por etapas y registro de cambios.
- La app son 3 archivos: `mirun.html` (pantallas), `app.css` (estilos) y `app.js` (lógica).
- Si cambia cualquiera de ellos, subir el número de `CACHE_NAME` en `sw.js` para que los teléfonos
  reciban la versión nueva.
