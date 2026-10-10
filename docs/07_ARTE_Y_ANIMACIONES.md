# 07 · Dirección artística, sprites y animaciones

**Actualización demo 0.2:** se implementó animación por partes para Pattha, Otto, Rural, gato y perro. Ver [ANIMACIONES_02.md](ANIMACIONES_02.md). Las imágenes fuente de la tabla siguen siendo estáticas. El plan de producción por cuadros que sigue es una propuesta futura; no describirlo como assets ya disponibles.

## Regla máxima: no perder el dibujo de Dante

Las imágenes en `assets/personajes/concepto` son interpretaciones digitales. Los bocetos de papel originales tienen prioridad cuando se sumen. Toda modificación importante de forma o personalidad se valida en familia.

## Arte disponible HOY

| Archivo | Uso aconsejado | Límite |
| --- | --- | --- |
| `pattha_concepto_A.png` y `_B.png` | Comparar alternativas visuales | Concept art, no sprite de acción |
| `raton_verde_concepto.png` | Diseño de aliado | Personaje estático |
| `rural_concepto.png` | Diseño de aliado | Personaje estático |
| `*_transparente.png` | Mockups, pruebas de personajes, pantallas | Recorte automático; revisar contornos y huecos |
| `lineup_personajes.png` | Lámina comparativa | Referencia, no atlas |

## Estilo visual acordado

- **Cartoon moderno**, colores plenos, contornos legibles y volúmenes simples.
- **Pattha:** verde predominante, negro y acabado metálico; visor cian en arte digital.
- **Ratón verde:** verde y detalles crema, según el concepto actual.
- **Rural:** azul y detalles crema, según el concepto actual.
- Al crear escenarios, usar fondos menos contrastados para destacar siluetas.

## Plan de producción de animaciones (todo PENDIENTE)

**Para Pattha:** `idle` (4–8 frames), `caminar` (6–10), `saltar_inicio` (2–3), `salto_aire` (1–2), `aterrizar` (2–3), `interactuar` (4–6), `festejar` (6–8). Si el diseño no requiere saltar, eliminar esos estados.

**Para los ratones:** `idle`, `caminar`, `curioso/señalar`, `ayudar`, `festejar`; agregar `entrar_a_tunel` y `leer_mapa` únicamente si se aprueban las habilidades propuestas.

## Especificación de entrega de un sprite (sin imponer motor)

- PNG con **alfa real** y sin marco de papel.
- Orientación uniforme en el mismo conjunto (por ejemplo, perfil derecho). Confirmar cámara antes de dibujar.
- Frame con canvas y punto de apoyo/`pivot` idénticos en toda la secuencia.
- Frames ordenados, sin recortes accidentales de orejas, antenas, aletas o cola.
- Tamaño de referencia **a decidir al fijar resolución**; no fijar 32/64/128 px artificialmente.
- Exportar **frames sueltos + spritesheet + metadatos JSON** (duración, pivote, área útil, dirección), si las herramientas elegidas los admiten.
- Comprobar coherencia de cara, visor, aletas, cola y proporciones; las generaciones de IA pueden variar entre poses.
- Documento de licencia/autoría de cada asset nuevo.

## Plantilla recomendada de metadatos

```json
{
  "character": "pattha",
  "animation": "walk_right",
  "status": "PENDIENTE",
  "frame_width": null,
  "frame_height": null,
  "pivot": null,
  "fps": null,
  "frames": []
}
```

## Próximos recursos necesarios

Ilustración oficial frontal/perfil, turnarounds, hojas de expresiones, animaciones completas, escenarios por capas, elementos interactivos de puerta y señales, botones e íconos. Evitar generar cientos de recursos hasta validar perspectiva y relación entre tamaños.
