# Pruebas y entrega · demo 0.2

## Entorno

2026-10-10, macOS, Node 24.19.0, pnpm 11.25.0, Phaser 3.90.0, TypeScript 5.9.3, Vite 7.1.12. Navegador Chromium/Chrome en sesión de prueba aislada; escritorio 1280×800, mobile emulado 844×390 y 390×844. Primera revisión visual también realizada en el navegador integrado de Codex.

## Resultados verificados

| Comprobación | Resultado / evidencia |
| --- | --- |
| pnpm typecheck | Sin errores |
| pnpm test | 11/11: seis reglas de juego y cinco pruebas de reloj/estados de animación |
| pnpm build | Build estático generado; aviso de tamaño de chunk del motor esperado |
| Originales del kit | 9 checksums SHA-256 coinciden con MANIFEST.json |
| Menú y diálogo | Correcto |
| Movimiento y salto | Inputs de teclado reales |
| Pausa | La física se detiene y se recupera |
| Tuerca | Alcanzada con dos saltos por teclado entre plataformas |
| Cooperación | Otto y Rural abren el puente |
| Puzzle con error | Pista visible, reintento correcto |
| Puente | Se camina sobre el collider creado |
| Caída/checkpoint | Reaparece; conserva puente y energía restaurada |
| Gato | Aterrizaje encima lo supera |
| Perro | Choque lateral consume energía, reintento disponible |
| Llegada/replay | Diálogo, cierre y estado nuevo |
| Mobile horizontal | Dos contactos reales emulados: mover y saltar simultáneamente |
| Mobile vertical | Aviso, controles ocultos y física detenida; recupera al girar |
| Errores y solicitudes externas | Ningún error JS ni request externo del juego en el recorrido de escenarios |
| Cinco personajes caminando/parpadeando | Poses renderizadas comprobadas y capturadas en la galería |
| Pensar y aburrirse | Poses de todos comparables; pensar aparece tras espera real en el nivel |
| Animación y física | Pausa conserva todas las poses/relojes; mover cancela pensar y salto activa pose aérea |
| Movimiento reducido | Preferencia emulada aplicada a todos los rigs |
| Galería horizontal mobile | Cinco personajes; sin desborde de ancho |
| Build final | Ambas páginas generadas; galería abierta y revisada en navegador integrado; adaptador de pruebas ausente del bundle |

Datos del runner en PRUEBAS_BROWSER.json. El runner posiciona al personaje para aislar algunos escenarios; no modifica el progreso. No presentar esa cobertura como una partida manual familiar completa ni como una prueba física de iPhone/Android.

Ocho escenarios de animación en PRUEBAS_ANIMACIONES.json, con espera real sin modificar el reloj. Las poses de parpadeo/pensar/aburrirse también se fuerzan por botones de la galería para su comparación visual. La máquina de estados prueba ambas esperas, cancelación, pausa y movimiento reducido.

## Capturas

- 01-inicio.png: menú con los tres protagonistas.
- 02-cooperacion.png: pista de Rural y reintento.
- 03-recorrido.png: puente abierto y avance.
- 04-final.png: victoria.
- 05-mobile-horizontal.png: botones de movimiento y salto.
- 06-mobile-vertical-pausa.png: aviso al girar.
- 08–11: cinco personajes caminando, cerrando ojos, pensando y aburridos.
- 12-espera-pensando.png: gesto tras espera real en el nivel.
- 13-animaciones-mobile.png: galería horizontal emulada.
- 14-build-animado.jpg: galería del build final en el navegador integrado.

## Pendiente de aceptación familiar

- Dante reconoce a los tres personajes y decide si el salto resulta cómodo.
- Recorrido natural completo con la familia.
- Tiempo de primera partida de 5–10 min: objetivo todavía sin medición.
- Celular real Android/iPhone, Safari físico, controles en distintos tamaños y rendimiento.
- Aprobación de gráficos de gatos/perros y variante B del robot.
- Preferencia de Dante sobre ritmo, intensidad y gestos de animación; fluidez en celular físico.

## Reproducir

pnpm install --frozen-lockfile --ignore-scripts; pnpm typecheck; pnpm test; pnpm build.
Para integración: servidor pnpm dev en una terminal, pnpm test:browser en otra. Ver README para las herramientas de navegador requeridas.
Para animación: mismo servidor y pnpm test:animations.
