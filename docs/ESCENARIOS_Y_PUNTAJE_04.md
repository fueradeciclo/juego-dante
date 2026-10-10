# Escenarios y puntaje · entrega 0.4

Pedido confirmado del adulto: las esferas nunca deben quedar encima ni debajo de las plataformas de salto; los checkpoints deben estar separados de esas plataformas; recoger todas las esferas da más puntos al finalizar.

## Tareas de esta entrega

1. Reubicar las 30 esferas y los cinco banderines; conservar el recorrido de cooperación y comprobar acceso por saltos reales.
2. Agregar puntaje final y bonus por colección completa, con conteo único y reinicio limpio.
3. Validar geometría y comportamiento, capturar escritorio/horizontal, actualizar documentación y build, y guardar la entrega en GitHub.

## Distribución

`data/demo_plataformas.json` conserva plataformas, pozos y tuerca. Las esferas están en espacios libres entre plataformas, algunas a altura de caminata y otras en trayectorias de salto. Tampoco hay esferas sobre el puente. El suelo continuo sostiene las esferas y los checkpoints; la regla se aplica a las plataformas elevadas sobre las que se salta, no al piso del escenario.

Se considera el ancho completo de cada esfera (40 px) y se dejan al menos 16 px adicionales respecto de los extremos de las plataformas. La separación es horizontal a cualquier altura: no basta con que la esfera esté muy arriba o abajo de una plataforma. El movimiento vertical suave de la esfera no invade esas columnas libres.

Los checkpoints quedan en x = 1440, 2890, 3640, 4955 y 6410. Su ancho visual de 45 px y margen de 24 px no invaden plataformas. Los 55 px de alcance a cada lado tienen suelo firme. Se activan al tocar el piso, y la reaparición usa la altura del piso; no se activan saltando por encima. Se desplazó el cartel de saltos para despejar el primer banderín.

`game/src/level-layout.ts` valida la separación. `pnpm validate:level` comprueba el mapa y los valores del puntaje; `pnpm build` ejecuta esa validación antes de compilar, para detectar futuros errores de distribución. El runtime también rechaza un mapa con esferas o banderines mal colocados.

## Puntaje — valores PROPUESTOS

| Condición | Puntos |
| --- | --- |
| Cada esfera recogida | 100 |
| Todas las esferas, al finalizar | +1.000 |
| 30 de 30 en esta demo | 3.000 + 1.000 = **4.000** |

Los valores están en `puntaje.puntos_por_esfera` y `puntaje.bonus_todas` del JSON. La familia pidió el premio por completar la colección; esos valores concretos son una propuesta ajustable, no una decisión atribuida a Dante. Los rivales no dan puntos en esta entrega.

La pantalla final muestra cantidad recogida, puntos de las esferas, bonus si corresponde y puntaje total. Si faltan esferas, permite terminar igual y muestra una pista para la próxima partida. El contador usa el total del nivel, sin fijar 30 en la interfaz. Al recoger la última esfera se anuncia el bonus pendiente; se muestra en la llegada.

El puntaje se deriva de los IDs únicos recogidos. Caer conserva la colección durante esa partida; volver a tocar una esfera o abrir el final varias veces no duplica puntos. Empezar otra aventura limpia esferas, checkpoints y el bonus anterior. No se guarda entre recargas.

## Pruebas y continuación

Reglas unitarias: colección parcial, completa, ID repetido/inválido, distintos totales y reinicio; mapa real, esfera encima/debajo, bordes de imágenes y checkpoint cerca de un pozo. Integración reproducible con `pnpm test:scenarios` y `pnpm dev` en otra terminal.

El runner parte de posiciones adaptadas para aislar los escenarios. Recoge las 30 esferas por colisiones físicas usando caminata y saltos reales; no asigna esferas ni puntos directamente. Comprueba los cinco checkpoints, caídas, cooperación, llegada completa/parcial, replay y resumen horizontal. Evidencia en `PRUEBAS_ESCENARIOS_04.json` y capturas 29–33; revisión del build en navegador integrado en `34-escenarios-build.jpg`. Esa cobertura no equivale a un recorrido familiar continuo ni a una prueba en celular físico.

Próximas tres tareas: jugar el recorrido completo con Dante, elegir si el bonus de 1.000 resulta divertido y probar la lectura del puntaje en un celular real horizontal. Pregunta sencilla para Dante: «¿Te dan ganas de buscar todas las esferas para ganar el premio?».
