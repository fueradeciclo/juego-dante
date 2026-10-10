# Pattha · set de movimientos · demo 0.3

## Pedido y tareas

El adulto pidió que Pattha tenga animaciones más pulidas que los otros personajes, carrera con piernas activas, preparación y extensión al saltar, polvo suave y poses distintas al subir y caer.

1. Producir poses desde el concepto B, conservar los originales y registrar los prompts.
2. Integrar carrera, salto y gestos con física independiente y revisión de cuadros en la galería.
3. Verificar controles, pausas, salto corto, cooperación y mobile; generar build y guardar la entrega en GitHub.

## Set entregado

| Grupo | Cuadros y comportamiento |
| --- | --- |
| Carrera · 8 cuadros | Contacto, absorción de peso, paso y vuelo para cada pierna. Zancada según velocidad: a 285 px/s, ~13,6 cuadros/s. Orientación refleja el sentido del movimiento. |
| Salto · 8 poses | Agacharse, impulsarse, subir con rodillas recogidas, ápice, caer con pies extendidos, comprimir al aterrizar, recuperarse y rebotar. |
| Reposo/acciones · 8 poses | Reposo, ojos cerrados, cambio de peso/respiración, pensar, pensar con ojos cerrados, aburrirse, ayudar y festejar. |
| Transiciones | Frenar reutiliza recuperación, giro refleja la dirección; choque combina postura aérea y destello existente. Ayudar se activa en la interacción; festejar en la llegada. |
| Polvo | Seis motitas suaves al despegar, duran 340 ms; polvo menor al aterrizar. No es humo, proyectil ni collider. |

Preparación: **64 ms de tiempo activo**, antes del impulso de −620 px/s. El margen de borde de 120 ms y buffer de 140 ms siguen activos; desde un borde se despega inmediatamente. Soltar pronto limita la velocidad ascendente a −280 px/s como antes. La carrera mantiene 285 px/s y la gravedad 1500 px/s². El recorrido de la tuerca se verifica con dos saltos reales de teclado.

La pose aérea usa velocidad física, no una película temporizada: menos de −90 px/s sube, entre −90 y +90 está en el ápice, más de +90 cae. Aterrizaje amortigua 95–165 ms según movimiento. No bloquea caminar ni el siguiente salto. Rebote al superar un rival: pose propia durante 120 ms.

Pausa, vertical y pestaña oculta detienen reloj y polvo. En movimiento reducido se conservan los cuadros que informan acciones, se limita la respiración y se desactivan polvo y gestos automáticos prolongados. Parpadeos y pensar/aburrirse en reposo conservan los tiempos de la 0.2.

## Arte, identidad y procedencia

Referencia: `assets/personajes/transparentes/pattha_concepto_B_transparente.png`, SHA-256 `9b910703fcae1be0f7cc4d325084d27d93afe56ce7bba5c4995a9f690f224af0`. Verde, negro, metal, visor con ojos cian, cabeza grande, botas y aletas se mantienen como referencia. Las caras y articulaciones visibles se interpretaron en poses nuevas; requieren revisión de Dante. No fijan una personalidad ni cambian la grafía pendiente.

Herramienta: **Imagegen integrada**, generación con referencia local y transparencia más una corrección dirigida de brazos. Los prompts exactos y la variante descartada están en `assets/animaciones/pattha/PROMPTS.json`. Fuentes finales: `carrera-v3-pulida.png`, `salto-v3.png`, `reposo-v3.png` (1536×1024 RGBA cada una). `carrera-v3.png` conserva el estudio usado como referencia; no se copia al build. Se corrigió el puño fijo con nuevas posiciones de brazos en la plancha final. Los ocho dibujos de cada plancha son nuevos; las ilustraciones del kit no se presentarán como spritesheets. No se sustituyeron ni reescribieron los originales.

La salida del generador tiene separación irregular: `atlas.json` define rectángulos revisados, pivotes y línea de apoyo. Se recortan y alinean en Canvas al cargar, con escala compartida; agacharse reduce la silueta de verdad, no se agranda hasta la altura de reposo. La segunda fila de carrera salió orientada a la derecha y se refleja al renderizar para unificar dirección. No se edita el PNG. SHA-256 de las tres planchas en `MANIFEST.json`, verificados por `prepare-assets.mjs` junto con los originales.

Estas planchas son assets generados para el juego, no dibujos ni decisiones atribuidos a Dante. Amigos y rivales conservan el rig anterior. El cuerpo físico original del robot se conserva independientemente de cada pose.

## Archivos y revisión

- `pattha-state.ts`: estados específicos, zancada, velocidad aérea, aterrizaje y preparación pausable.
- `pattha-art.ts`: atlas, alineación y render Canvas compartido.
- `pattha-animator.ts`: vínculo Phaser con el cuerpo de Pattha.
- `jump-dust.ts`: polvo leve sin física ni temporizadores externos.
- `pattha-preview.ts` y `/animaciones.html`: siete movimientos, secuencia de salto y selección individual de 24 cuadros.

`pnpm test`: 17 pruebas unitarias, seis nuevas para Pattha. Con `pnpm dev` activo: `pnpm test:pattha` verifica diez escenarios con arte pintado y salto físico; `pnpm test:animations` verifica ocho escenarios de los cinco personajes; `pnpm test:browser` verifica doce escenarios del recorrido y multitáctil. Resultados y capturas en docs/.

## Próximas decisiones con Dante

«¿Te gusta cómo corre?», «¿Se siente bien el salto?», «¿Cuál gesto te gusta más?». Revisar continuidad entre cuadros y aspecto antes de ampliar el set. Falta probar fluidez y comodidad en un celular real, y medir la primera partida familiar. La prueba emulada no confirma esas dos cosas.
