# Demo de plataformas de Dante · 0.1

Juego familiar 2D para navegador de computadora y celular **horizontal**. Solo controlás a **Pattha**; **Otto** (verde) y **Rural** (azul) te acompañan. Nombre definitivo del juego y escritura del robot pendientes.

Repositorio dedicado y privado: https://github.com/fueradeciclo/juego-dante

![Inicio de la demo](docs/capturas/01-inicio.png)

## Jugar en esta computadora

Abrí `scripts/jugar.command` con doble clic o ejecutá:

```sh
./scripts/jugar.command
```

Después abrí **http://localhost:5173**. La ventana del servidor debe permanecer abierta. Ctrl+C lo detiene. El archivo también reconoce el runtime de Node/pnpm que trae Codex en esta Mac; las dependencias ya están instaladas en la carpeta de trabajo.

## Instalar desde una copia nueva

Requisitos: Node.js **24 o posterior**, pnpm **11.25.0** y un navegador moderno. No hace falta cuenta para jugar.

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
```

En un celular de la misma Wi-Fi, abrí `http://IP-DE-LA-COMPUTADORA:5173` y giralo a horizontal. Usá la IP de la computadora que corre el servidor; `localhost` en el celular apunta al propio celular. La red/firewall debe permitir el puerto 5173. Sin conexión externa necesaria para jugar una vez que se sirven los archivos.

## Controles

| Acción | Computadora | Celular horizontal |
| --- | --- | --- |
| Mover | Flechas izquierda/derecha o A/D | Botones ◀ y ▶ |
| Saltar | Espacio, W o flecha arriba | Botón Saltar |
| Ayudar/interactuar | E o Enter | Botón Ayudar |
| Continuar diálogo | Enter, Espacio o botón Seguir | Botón Seguir |
| Puzzle de Rural | Formas en pantalla o teclas 1, 2, 3 | Tocá las formas |
| Pausa | Esc o botón Ⅱ | Botón Ⅱ |
| Pantalla completa | Botón ⛶, si el navegador lo permite | Igual; el bloqueo de orientación depende del navegador |

Podés mover y saltar a la vez en táctil. Soltar el salto acorta su altura. Hay un pequeño margen de salto al salir de un borde y una cola breve para saltos pedidos antes de aterrizar.

Saltá **encima** de gatos y perros para superarlos con un destello, o esquivalos. Los choques laterales consumen energía; al agotarse o caer volvés al último banderín. Los destellos, la tuerca y el puente se conservan durante los reintentos de esa partida. Reiniciar o recargar comienza de cero.

## La demo

Tres tramos: aprender los saltos, abrir un puente con los amigos y llegar al banderín final. Hay 30 destellos opcionales y ocho rivales. La tuerca está en la plataforma alta antes del puente; hablá con Otto y luego con Rural. La pista del puzzle permanece visible y los errores permiten reintentar.

**Objetivo de duración:** 5–10 minutos para una primera partida familiar. Pendiente medir con Dante; una persona con experiencia puede completarla antes. Sin espera artificial ni límite de intentos.

## Build y pruebas

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

El build reproducible queda en **builds/web/** y también se incluye en este repositorio por pedido familiar. `pnpm preview` lo sirve en http://localhost:4173. Serví esa carpeta por HTTP; abrir `index.html` como archivo local no es el flujo soportado.

Para integración, dejá `pnpm dev` corriendo en otra terminal y ejecutá:

```sh
pnpm test:browser
```

Usa un Chromium de pruebas instalado por Playwright, o una instalación existente de Chrome en una sesión aislada. Si ninguno existe: `pnpm exec playwright install chromium`. También admite `PATTHA_CHROMIUM_PATH` con una ruta al ejecutable. Nunca usa el perfil ni las cuentas del navegador personal.

Ver [pruebas y límites](docs/PRUEBAS_Y_ENTREGA.md) y [resultados de integración](docs/PRUEBAS_BROWSER.json). El adaptador para posicionar al jugador solo se habilita en **desarrollo** con `?test=1`; no se incluye en el build.

## Estructura

```text
assets/        originales intactos, recortes y animales nuevos con procedencia
data/          contenido editable; demo_plataformas.json es la demo activa
game/src/      runtime Phaser, controles, interfaz y reglas
game/tests/    pruebas de reglas de jugabilidad
scripts/       preparar assets, ejecutar y probar en navegador
docs/          canon, decisiones, avances, aceptación y capturas
builds/web/    entrega compilada de navegador
```

`game/public/` se genera copiando los assets necesarios, sin modificar las imágenes fuente. El preparador verifica los nueve checksums del manifiesto original. Los datos viejos del kit siguen como propuestas; el juego usa `data/demo_plataformas.json`.

## Canon y propuestas

**Confirmado por la familia:** protagonistas, colores, Otto y Rural; navegador horizontal; género plataformas; saltar y combatir gatos/perros; solo Pattha controlable.

**Pendiente:** grafía Pattha/Pata y variante visual definitiva. Se usa B provisoriamente, como en los datos del kit.

**Propuesta implementada para jugar y decidir:** sendero, destellos, tuerca, diálogo, cooperación del puente, señal de símbolos y combate por salto con energía y reintentos. El faro y la Gran Chispa del kit siguen como argumento opcional y no se usan en esta demo.

Todos los personajes son **PNG estáticos**. El runtime los desplaza y espeja; no hay ciclos animados ni spritesheets. Para gato/perro se encuadra el PNG completo del personaje dentro de la textura sin deformarlo; no se generan poses adicionales. Los gatos y perros fueron creados con Imagegen a partir del estilo de los ratones, no dibujados por Dante. [Prompts exactos](assets/enemigos/PROMPTS.json).

## Próxima sesión con Dante

1. Jugar en un celular real horizontal y en computadora; medir comodidad y duración.
2. Validar escritura de Pattha, variante A/B y aspecto de gatos/perros.
3. Ajustar saltos/combate y recién después producir animaciones.

No hay publicidad, compras, cuentas de jugadores, analíticas, backend ni solicitudes externas del juego. No se agregó sonido. El hosting público y las exportaciones instalables quedan para otra decisión.

Los dibujos y personajes de Dante conservan sus derechos; este proyecto no les asigna una licencia abierta. Ver [procedencia](docs/13_CREDITOS_Y_PROCEDENCIA.md) y [licencias técnicas](docs/LICENCIAS_TECNICAS.md).
