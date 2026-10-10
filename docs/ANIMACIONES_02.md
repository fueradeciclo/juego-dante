# Animaciones · demo 0.2

## Pedido y alcance

El adulto pidió animaciones para todos los personajes al moverse, parpadeos y una acción de pensar o aburrirse después de esperar. Los gestos concretos se implementan como **PROPUESTA** para elegir con Dante; no se atribuyen nuevas personalidades oficiales.

| Situación | Comportamiento |
| --- | --- |
| Pattha, amigos o rivales se desplazan | Patas alternadas, brazos acompañando, cabeza y cuerpo suaves; colas de ratones/gato/perro |
| Pattha o amigos en el aire | Pose de patas y brazos recogidos |
| Quietos | Respiración leve y parpadeos de ~180 ms, cada 2,7–4,7 s; inicio separado por personaje |
| ~8 s quietos | Cabeza inclinada, brazo y pequeña nube de pensamiento; dura 2,4 s |
| ~14 s quietos | Baja la cabeza, relaja brazos y entrecierra los ojos; dura 2,7 s |
| Espera prolongada | Alterna gestos con períodos de reposo; nunca exige una acción del jugador |
| Movimiento o salto | Cancela el gesto y reinicia la espera |
| Pausa, vertical o pestaña oculta | Congela pose, parpadeos y tiempo de espera; no acumula minutos ocultos |
| Movimiento reducido del dispositivo | 15% de amplitud; parpadeos presentes, gestos automáticos prolongados desactivados |

Los enemigos siguen patrullando como antes: su estado de caminar corresponde a su velocidad real. La galería permite ver también sus estados quietos. Los amigos se ubican delante del robot cerca del extremo izquierdo para que ambos sean visibles; luego vuelven a seguirlo. Se corrigió la orientación de los protagonistas al caminar hacia la derecha.

## Arte y estructura

Se usa un **rig 2D por partes**, sin reilustrar los personajes ni reemplazar sus PNG. `assets/animaciones/rigs.json` registra fuentes, máscaras, pivotes, encuadre y posiciones de los ojos. Al cargar, se recortan capas en memoria; píxeles originales detrás de las articulaciones cubren pequeñas separaciones. Las muestras de color del dibujo se usan para los párpados; el robot cierra las luces del visor. Las transformaciones son leves y temporales.

Las texturas compartidas se preparan una sola vez a ~512 px de alto. El nivel mueve las capas con imágenes Phaser; menú, retratos y galería usan el mismo compositor Canvas. Los cuerpos de colisión conservan tamaño, posición y física: ninguna animación de cabeza/patas modifica el alcance de un salto o un choque. Los nueve originales del kit y los dos animales siguen verificados por SHA-256.

Archivos relevantes:

- `game/src/animation-state.ts`: reloj independiente de Phaser, estados, pausa y espera.
- `game/src/character-art.ts`: preparación de capas, párpados y poses compartidas.
- `game/src/character-rig.ts`: imágenes Phaser vinculadas al cuerpo físico.
- `game/src/portraits.ts`: menú, retratos y vista familiar.
- `game/animaciones.html`: cinco personajes y botones de comparación.

## Ver y probar

`pnpm dev` y abrir `/animaciones.html`; el menú del juego también tiene el enlace. En el build: `pnpm build`, `pnpm preview` y `http://localhost:4173/animaciones.html`. La vista funciona con táctil y admite orientación horizontal; permite comparar las poses sin esperar.

`pnpm test` comprueba el reloj; `pnpm test:animations` requiere el servidor de desarrollo y prueba poses renderizadas, espera real, cancelación, salto, pausa y mobile emulado. `pnpm test:browser` repite el recorrido de jugabilidad anterior.

Capturas 08–13 en `docs/capturas/`, resultados en `PRUEBAS_ANIMACIONES.json`. No hay spritesheets nuevos ni clips dibujados cuadro a cuadro. El movimiento es deliberadamente moderado: los recortes de un dibujo único no sustituyen un ciclo de caminata de animación tradicional. Falta elegir los gestos con Dante y evaluar fluidez en dispositivos físicos.
