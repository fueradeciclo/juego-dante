# 08 · Tecnología y exportación · demo 0.3

## Destino acordado

Navegador moderno en computadora y mobile horizontal, plataformas 2D y Pattha como único personaje controlable. El juego funciona sin backend, cuentas ni servicios de jugadores externos.

## Comparación realizada antes de elegir

| Opción | Evaluación para este destino |
| --- | --- |
| Godot + GDScript | Editor 2D/animación integrado, exportaciones web y nativas. Curva media; comprobar restricciones WebGL 2 y navegador. |
| Phaser + TypeScript | Web directa, control completo de teclado y multitáctil. Curva media/alta para autoría por código; empaquetado adicional si más adelante se necesita app nativa. |
| GDevelop | Autoría visual y entrada sencilla; exportación web/mobile/desktop, con flujos manuales o servicios automáticos según plan. |

Curvas de aprendizaje: evaluación de Codex, no medición. Fuentes oficiales consultadas 2026-10-10:
- https://docs.phaser.io/
- https://docs.phaser.io/phaser/getting-started/installation
- https://docs.phaser.io/phaser/concepts/animations
- https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html
- https://godotengine.org/features/
- https://wiki.gdevelop.io/gdevelop5/publishing/
- https://wiki.gdevelop.io/gdevelop5/objects/sprite/
- https://gdevelop.io/en-gb/pricing
- https://vite.dev/guide/

## Elección

Phaser **3.90.0**, TypeScript **5.9.3**, Vite **7.1.12**, Node **24+**, pnpm **11.25.0**; versiones exactas y pnpm-lock.yaml. Se usa Phaser 3 de forma deliberada para esta demo estable; la existencia de una versión mayor no obliga a migrar. Licencias técnicas incluidas en docs/licencias/; Phaser es MIT y no requiere cuota ni cuenta para ejecutar/exportar.

Escena 1280×720 y escala FIT. Física Arcade, cámara lateral y UI DOM accesible. Los PNG y JSON permanecen fuera de game/src/. Pattha usa un atlas de 24 poses generadas; el resto, rigs por partes. Un reloj propio separa animación visual y colisiones y congela cuadros/polvo en pausa; Canvas comparte el arte entre Phaser, menú, retratos y galería.

## Ejecutar y compilar

Comandos desde la raíz:
- pnpm install --frozen-lockfile --ignore-scripts
- pnpm dev → localhost:5173
- pnpm typecheck
- pnpm test
- pnpm build → builds/web/
- pnpm preview → localhost:4173
- pnpm test:browser, con dev activo en otra terminal
- pnpm test:animations y pnpm test:pattha, con el mismo servidor

## Exportación vigente

builds/web/ incluye HTML, JS, CSS, PNG y datos. Servir por HTTP. Base ./ permite alojarlo bajo una subcarpeta. El repositorio incluye ese build por requisito familiar. La entrega no está publicada como sitio público.

Un celular accede al servidor de la computadora por su IP en la misma Wi-Fi. En vertical la partida queda suspendida; el bloqueo automático depende de APIs disponibles, no se garantiza en Safari.

Futuro: empaquetar con herramientas nativas si se acuerda, verificando costos, firma y tiendas. Consolas no son destino de esta entrega.

## Límites actuales

Runtime Phaser compilado de aproximadamente 1,5 MB sin comprimir; PNG fuente de alta resolución todavía pesados. No se optimizaron con pérdida para conservar el arte de la primera prueba. Sin audio, PWA/offline permanente, guardado entre recargas ni exportación instalable. Pruebas táctiles emuladas no reemplazan rendimiento o comodidad en un iPhone/Android real.
