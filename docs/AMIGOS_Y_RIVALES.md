# Amigos y rivales · 2026-10-10

Pedido del adulto: mejorar todos los personajes salvo Pattha con animaciones sencillas. Gatos/perros algo más malvados y activos, con desaparición para niños. Otto/Rural amistosos, amigos y aliados, capaces de charlar entre ellos.

## Implementación (PROPUESTA de gestos y diálogo)

- Otto y Rural: pasos más ligeros, saltito pequeño cada 6,4 segundos de reposo, desfasado entre los dos. Seguimiento continuo con velocidad máxima de 420 px/s, aceleración horizontal limitada a 2200 px/s² y frenado gradual. La formación cambia suavemente al volver y al salir del comienzo; no se fija a los ratones de golpe en los puestos del puente. Los saltos siguen la altura de Pattha con una demora breve de 80/160 ms. Al reaparecer, los amigos se reúnen junto al banderín con una aparición tenue de 350 ms, sin recorrer el mapa a toda velocidad. Miran al interlocutor cuando se detienen; conversar ya no cambia su dirección mientras corren.
- Conversaciones ocasionales: primer intercambio tras 20 segundos activos; 4,4 segundos de lectura por frase y 0,4 segundos entre turnos; después, 60 segundos de silencio. Cambiar de zona durante una charla la cancela y respeta ese descanso. Globos redondeados, menos anchos, texto sin negrita, fondo claro al 72% y entrada/salida de 300 ms. Frases distintas para camino, preparación del puente y puente resuelto. Se ocultan durante cuadros de diálogo/acertijo y no avanzan durante esas interrupciones, pausa, orientación vertical o pestaña oculta. No se agrega voz sintetizada.
- Fondo: una avioneta pequeña de formas vectoriales originales, con opacidad del 42%, cruza durante 19 segundos. El primer vuelo espera 5 segundos activos; entre vuelos hay 45 segundos sin avioneta, alternando sentido y altura. Siempre detrás del escenario, sin sonido ni colisión. Pausa y diálogos congelan el vuelo; movimiento reducido lo oculta. Es una PROPUESTA decorativa, no una decisión de historia de Dante.
- Gatos y perros: patrulla a 1,15 veces su velocidad anterior; cejas levemente fruncidas como capa reversible sobre el dibujo. Aviso visual estable de 480 ms al detectar a Pattha en su tramo; avance de 850 ms a 1,6 veces su velocidad anterior, limitado por su patrulla; descanso de 1,4 segundos. No persiguen fuera del tramo ni se agregan ataques nuevos.
- Superar un rival por salto desactiva su colisión inmediatamente y lo contabiliza una sola vez. Durante 900 ms activos cierra los ojos, se encoge ligeramente y se desvanece entre cinco nubecitas claras. Sin sangre, caída violenta, parpadeos intensos ni sonidos bruscos. Pausar congela también esta secuencia.
- Movimiento reducido: sin saltitos, desplazamiento/contracción de desaparición ni nubecitas; se conserva un desvanecido gradual y la mecánica de los rivales.

No se cambiaron los PNG, rig de recortes ni planchas/atlas de Pattha. Las capas nuevas de cejas y las transformaciones se calculan al dibujar; no alteran colores, ojos ni proporciones de las fuentes. No hay nuevos assets externos ni licencias por incorporar. El motor y los controles siguen siendo los ya elegidos.

## Jugar y revisar

Abrí `scripts/jugar.command` y visitá `http://localhost:5173`. Flechas/A/D para moverte, Espacio/W/↑ para saltar, E/Enter para ayudar, Esc para pausar. En celular horizontal, usá los botones táctiles. La galería `http://localhost:5173/animaciones.html` agrega **Amigos charlando**, **Rivales al acecho** y **Rivales desapareciendo**. El escenario de Pattha se conserva.

Instalación y exportación: los mismos requisitos de README (Node 24+, pnpm 11.25.0). `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm dev`; `pnpm build` genera `builds/web/`, `pnpm build:site` prepara `builds/site/pattha_game/`. Este cambio prepara una entrega local; no publica en Cloudflare.

## Validación

Pruebas específicas: `pnpm test:companions`, `pnpm test:followers`; regresión: `pnpm typecheck`, `pnpm test`, `pnpm test:browser`, `pnpm test:animations`, `pnpm test:pattha`. Los adaptadores para posicionar a Pattha e inspeccionar estados solo existen en desarrollo con `?test=1`.

En esta Mac se ejecutan también directamente con el Node integrado cuando pnpm intenta reinstalar dependencias por la configuración local:

```sh
node node_modules/typescript/bin/tsc --noEmit
node --test game/tests/*.test.ts
node scripts/prepare-assets.mjs
node scripts/test-companions.mjs
node scripts/test-followers.mjs
node scripts/test-browser.mjs
node scripts/test-animations.mjs
node scripts/test-pattha.mjs
node node_modules/vite/bin/vite.js build
node scripts/prepare-site.mjs
```

Resultados específicos: `PRUEBAS_AMIGOS_Y_RIVALES.json`. Capturas `22-amigos-charlando.png`, `23-gato-al-acecho.png`, `23-perro-al-acecho.png`, `24-gato-desaparicion.png`, `24-perro-desaparicion.png` y `25-galeria-rivales.png` en `docs/capturas/`.

Seguimiento y fondo: `PRUEBAS_SEGUIMIENTO_Y_FONDO.json`, con trazas de movimiento por cuadro al arrancar, llegar al puente, volver y frenar. Pruebas de reglas del seguimiento a 30/120 cuadros por segundo, límites de velocidad/aceleración, pausa, reunión al reaparecer y descanso de las charlas. Capturas `26-ratones-seguimiento-suave.png`, `27-avioneta-fondo.png` y `28-charla-sutil.png`.

Pendiente familiar: revisar ritmo y lectura con Dante, expresión de los rivales y comodidad en un celular real. Las pruebas táctiles automatizadas usan emulación; no equivalen a una partida familiar.
