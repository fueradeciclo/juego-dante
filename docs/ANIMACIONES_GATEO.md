# Pattha: agacharse y gatear

Pedido explícito del adulto: Pattha puede agacharse, caminar agachado y pasar por lugares bajos. Los dibujos concretos y el pasaje de prueba son PROPUESTAS para revisar con Dante.

## Set entregado

Se creó `assets/animaciones/pattha/gateo-v1.png` con Imagegen integrada, tomando el concepto B y la plancha de reposo como referencias. Es una plancha RGBA de 1254 × 1254 con **16 dibujos nuevos**, que llevan el atlas a **40 cuadros**. Los PNG anteriores y los originales del kit se conservan.

| Cuadros | Uso |
| --- | --- |
| 0–3 | De pie, flexión de rodillas, apoyo de manos y apoyo de rodillas; se reproducen al revés para levantarse |
| 4–11 | Ocho pasos alternados sobre manos y rodillas, en ambas direcciones |
| 12 | Descanso bajo |
| 13 | Parpadeo bajo |
| 14 | Mirar el techo cuando no hay espacio para levantarse |
| 15 | Frenar el gateo |

Diferencia deliberada: el torso baja y las manos y rodillas apoyan en el suelo. Se mantiene la identidad de Pattha: cabeza grande, visor negro, ojos celestes, armadura verde, articulaciones negras, metal y aletas. Las poses se recortan y alinean en memoria; no se reescribe ni estira el PNG. Todas las nuevas poses comparten escala y línea de apoyo. El espaciado irregular de la imagen se resuelve con recortes absolutos individuales.

Fuente: [gateo-v1.png](../assets/animaciones/pattha/gateo-v1.png). [Prompt exacto](../assets/animaciones/pattha/GATEO_PROMPT.txt), [referencias y procedencia](../assets/animaciones/pattha/PROMPTS.json), [atlas](../assets/animaciones/pattha/atlas.json) y [checksums](../assets/animaciones/pattha/MANIFEST.json).

## Cómo probarlo

Ejecutá `./scripts/jugar.command` y abrí http://localhost:5173. Mantené **↓ o S** y avanzá con **←/→ o A/D**. En celular horizontal, mantené **Gatear** junto con un botón de dirección. Soltá para levantarte cuando haya espacio.

La bajada y subida duran 180 ms activos y se pueden invertir a mitad del movimiento. Pattha frena brevemente mientras cambia de postura. Gatea a 125 px/s, frente a los 285 px/s de la carrera. La zancada depende de la velocidad física, por lo que los pasos se detienen si una pared lo bloquea.

El cuerpo de colisión baja de aproximadamente 103 a 80 px, manteniendo los pies en el mismo lugar. Antes de levantarse se verifica todo el espacio de pie, con margen horizontal para la cabeza. Bajo un techo sigue agachado aunque se suelte el botón y no puede saltar a través del techo. En el aire no comienza una nueva bajada. Pausa, pestaña oculta y celular vertical congelan las poses; volver a jugar bajo un techo conserva la postura segura. Los saltos normales mantienen su preparación, altura y polvo anteriores.

Hay un **pasaje bajo opcional después del puente**, entre x=4080 y x=4240, marcado «↓ / S · Gateá». Tiene 98 px de espacio libre sobre el suelo y no contiene esferas ni checkpoints. Las plataformas previas también permiten pasar por arriba. La ubicación y el diseño son PROPUESTAS de demo, no historia oficial.

Abrí http://localhost:5173/animaciones.html para probar **Agacharse**, **Gatear** y **Levantarse**, o seleccionar cualquiera de los 40 cuadros.

## Verificación

- `pnpm test`: incluye transiciones, inversión, techo, ambas direcciones, ocho pasos y pausa.
- `pnpm test:crawl`: controles reales, paso bloqueado de pie, entrada agachado, salto impedido bajo techo, salida por ambos extremos, apoyo estable, tecla S y multitáctil.
- `pnpm test:pattha`: comprueba los 40 cuadros y conserva las pruebas del salto anterior.
- `pnpm typecheck` y `pnpm build`: preparar assets, comprobar tipos y exportar a `builds/web/`.

Resultados del navegador en [PRUEBAS_GATEO.json](PRUEBAS_GATEO.json). Capturas: [galería](capturas/31-pattha-gateo.png), [pasaje](capturas/32-pattha-pasaje-bajo.png) y [celular horizontal](capturas/33-pattha-gateo-mobile.png). Móvil emulado; pendiente probar comodidad en un dispositivo físico y revisar poses con Dante.
