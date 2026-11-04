# Prompts para generar imágenes (ChatGPT / Gemini)

Lecciones aprendidas con la mascota (2026-11-02):
- Pedir que la imagen se **genere directamente con fondo transparente**. Recortar después un fondo
  oscuro borra la ropa negra.
- Revisarla sobre fondo blanco y sobre fondo a cuadros antes de pasarla.
- Una hoja con todas las poses y fondo transparente real también sirve: se corta con
  `.claude/herramientas/recortar.js`.

## Siluetas del cuerpo (etapa 12) — hecho 2026-11-03

```
Necesito 3 ilustraciones de un cuerpo humano para la pantalla de medidas de una app de ejercicio
(estilo de mi imagen de referencia: figura 3D azul translúcida, tipo holograma, elegante).

Requisitos, sin excepciones:
- 3 archivos PNG separados: silueta_masculina.png, silueta_femenina.png, silueta_neutra.png
- Tamaño 512 × 1024 px (vertical), fondo 100 % transparente generado así desde el inicio (no recortado).
- Vista de frente, de cuerpo completo, de pie, brazos un poco separados del cuerpo (pose "A"),
  piernas ligeramente separadas, para que se vean bien pecho, cintura, cadera, brazos y piernas.
- Mismo estilo, color, iluminación, escala y posición en las 3 (que encajen una encima de la otra).
- Sin rostro detallado, sin cabello, sin ropa, sin genitales ni pezones: figura limpia tipo maniquí.
- La neutra: sin rasgos masculinos ni femeninos (torso recto, sin marcar pecho ni cadera).
- Sin textos, sin líneas de medidas, sin números, sin sombra en el piso (las medidas las pone la app).
- Margen de unos 30 px alrededor; que no se corten manos ni pies.
- Revísalas sobre fondo blanco y sobre fondo a cuadros antes de entregarlas: no debe quedar
  ningún recuadro ni restos de fondo.
Entrégalas en un zip.
```

## Ícono de la app (etapa 7) — hecho 2026-11-03 (recortado dentro del marco redondeado del original)
Necesario: PNG cuadrado de 512 × 512 y de 192 × 192. El logo debe caber dentro del **80 % central**
(Android recorta las esquinas en círculo o en gota). Fondo de color sólido azul oscuro (no transparente).
