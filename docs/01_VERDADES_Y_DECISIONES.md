# 01 · Canon y decisiones · actualizado 2026-10-10

Las decisiones explícitas de la familia en esta sesión tienen prioridad sobre el kit inicial. No atribuir decisiones creativas a Dante si habló el adulto.

## Canon confirmado

| Dato | Estado / origen |
| --- | --- |
| Dante creó los dibujos originales de los personajes | Confirmado en el kit familiar |
| Robot protagonista verde, negro y metálico, estilo cartoon moderno | Confirmado |
| Pattha es la escritura de referencia | Grafía final pendiente: el adulto también usa Pata |
| Ratón verde amigo: **Otto** | Confirmado por el adulto en el primer pedido de esta sesión; el kit lo dejaba sin nombre |
| Ratón azul amigo: **Rural** | Confirmado |
| Género: plataformas 2D lateral | Elegido por el adulto en esta sesión |
| Destino inicial: navegador en computadora y celular horizontal | Elegido por el adulto; exportaciones a otros destinos para después |
| Solo Pattha controlable | Elegido; ratones aliados, otro modo para una etapa posterior |
| Pattha salta y combate gatos/perros | Pedido actual; «asaltar» se interpretó como «saltar entre plataformas» |
| Crear gatos/perros consistentes con el arte disponible | Autorizado por el adulto con las referencias del kit |
| Todo el juego/build en un nuevo repositorio propio dedicado | Pedido explícito; repositorio privado fueradeciclo/juego-dante |
| Sin publicidad, compras, cuentas ni servicios de juego externos | Requisito familiar |

## Tecnología y decisiones de implementación

**Phaser 3.90.0 + TypeScript 5.9.3 + Vite 7.1.12**, Node 24+, pnpm 11.25.0, lockfile fijado. Se eligió después de comparar Godot, Phaser y GDevelop y recibir destino/género/modo. La prioridad actual es jugar directamente en navegador con teclado y multitáctil. Se fija una versión estable de Phaser 3 para esta demo; no se migra a Phaser 4 sin necesidad y verificación.

Resolución de referencia 1280×720; cámara lateral; escalado FIT; pausa en celular vertical y al perder foco. Assets y JSON desacoplados del código. Exportación actual: carpeta web estática servida por HTTP, con base relativa. No hay empaquetado móvil nativo ni hosting público.

## Propuestas implementadas, sujetas a Dante

- «El sendero de los amigos» es una descripción provisional del recorrido, no el título final del juego.
- Saltar encima supera a un rival con un destello; los choques laterales gastan energía. Sin muerte explícita, sin vidas limitadas.
- Tres tramos, 30 destellos, ocho animales, checkpoints y llegada.
- Otto ajusta una tuerca que trae Pattha; Rural da la pista círculo → estrella → triángulo para abrir un puente.
- Diálogos, recorrido y estas funciones contextuales de los ratones son propuestas de demo.
- Imagen B de Pattha seleccionada provisoriamente porque el kit ya la usaba en data/personajes.json.
- Gato naranja y perro marrón son propuestas ilustradas nuevas. Su color, nombre y personalidad no fueron elegidos por Dante.

## Ideas del kit que siguen sin aprobar

Faro de las Chispas, Bosque de Antenas, Gran Chispa, niveles de historia; Pattha reparando circuitos, Otto entrando por túneles, Rural interpretando mapas; personalidades de los tres. No son historia oficial y esta demo no implementa los pulsos eléctricos.

## Pendientes creativos y de validación

- Escritura definitiva del robot y título del juego.
- Variante A/B y conformidad de Dante con los rivales generados.
- Historia y habilidades oficiales, anotando las palabras de Dante.
- Dispositivos reales de prueba, edad/ayuda de lectura si la familia desea contarlo.
- Duración 5–10 min y diversión: objetivo, todavía no medición familiar.
- Animaciones por cuadros reales, escenarios y audio.
- Hosting compartido o exportaciones instalables: decisión posterior.

## Registro de decisiones

| Fecha | Decisión | Tomada con | Consecuencia |
| --- | --- | --- | --- |
| 2026-10-10 | Kit independiente de motor; priorizar exportabilidad | Familia (kit) | Fuentes desacopladas |
| 2026-10-10 | Otto es el nombre del ratón verde | Adulto, pedido inicial | Actualizar canon y datos; conservar ID raton_verde del kit |
| 2026-10-10 | Navegador horizontal, plataformas, solo robot controlable | Adulto, respuesta de arquitectura | Teclado + multitáctil; sin multijugador |
| 2026-10-10 | Combatir gatos y perros; generar ilustraciones consistentes | Adulto | Combate por salto como propuesta reversible; PNG nuevos |
| 2026-10-10 | Phaser/TypeScript/Vite fijados para la demo | Codex a partir de la elección de destino/género | Implementación web reproducible |
| 2026-10-10 | Repo privado dedicado juego-dante | Pedido de GitHub; nombre técnico provisional de Codex | Código, assets, documentación y build web juntos |

Actualizar este registro al cambiar una decisión, conservando la anterior y el motivo. No usar los diálogos escritos por Codex como palabras originales de Dante.
