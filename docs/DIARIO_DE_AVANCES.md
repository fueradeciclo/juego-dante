# Diario de avances

## 2026-10-10 · Primera demo web

### Decisiones recibidas

Navegador en computadora/celular horizontal; plataformas; Pattha controlable; ratones aliados; gatos y perros como rivales. Otto viene del primer pedido familiar. Grafía de Pattha pendiente.

### Entregado

Phaser 3.90.0 con TypeScript/Vite, mapa de tres tramos, movimiento/salto, combate por aterrizaje, checkpoint, menú/pausa/replay, ratones presentes, cooperación del puente, diálogos y cierre. Dos PNG nuevos de animales generados con Imagegen, con referencia del ratón verde y prompts exactos en assets/enemigos/PROMPTS.json. Repo privado dedicado fueradeciclo/juego-dante; título del juego todavía abierto.

### Ajustes durante verificación

- Separación de los ratones cuando el jugador se queda quieto.
- Encuadre de animales sin deformar sus proporciones ni alterar PNG.
- El checkpoint almacena también la altura del aterrizaje.
- El cierre del puzzle usa diálogo; una espera de UI no puede levantar una pausa.
- La prueba de tuerca se ajustó para mantener el salto el tiempo suficiente.
- La prueba de choque espera a que termine la protección después de reaparecer.

### Evidencias

TypeScript sin errores; seis pruebas de reglas; doce escenarios de navegador correctos. Capturas en docs/capturas/. Pruebas detalladas en PRUEBAS_Y_ENTREGA.md y PRUEBAS_BROWSER.json. Checksums originales verificados al preparar los assets.

### Cómo seguir

Abrir README; correr scripts/jugar.command o pnpm dev. No asumir que historias, personalidades o habilidades propuestas del kit fueron aprobadas. Los archivos originales de historia se conservaron como propuesta independiente de esta demo.

### Próximas tres tareas

1. Primera partida familiar en computadora y celular físico horizontal; medir tiempo y ajustar saltos/controles.
2. Validar nombre escrito del robot, variante A/B y aspecto de gatos/perros con Dante.
3. Producir pocas animaciones reales después de estabilizar las mecánicas y confirmar el arte.

### Pendientes explícitos

Validación con Dante, dispositivos reales, duración, animaciones, sonido, hosting público y exportaciones nativas. Sin datos personales, cuentas ni anuncios en el juego.

## 2026-10-10 · Demo 0.2: personajes animados

Pedido del adulto: animar a todos al moverse y al esperar, con parpadeo y gestos de pensar/aburrirse. Se implementó un rig por partes sobre los cinco dibujos existentes; no se generaron nuevas ilustraciones ni spritesheets. Las máscaras/pivotes están en assets/animaciones/rigs.json. Los gestos concretos son PROPUESTAS para Dante.

### Tareas de esta entrega

1. Preservar el arte, separar animación visual de física y agregar caminar/salto/reposo/parpadeo/espera.
2. Integrar menú/retratos, galería familiar, pausa del reloj y movimiento reducido.
3. Verificar reglas y recorrido, revisar capturas, reconstruir build y publicar la actualización en el mismo GitHub privado.

### Ajustes y evidencia

Se cubrieron las articulaciones con píxeles de los originales y se muestrearon sus colores para los párpados. Se corrigió la orientación al avanzar a la derecha; cerca del comienzo los ratones quedan delante para evitar el corte/solapamiento contra el borde izquierdo. Pausar congela todos los rigs; moverse corta el gesto de pensar; saltar cambia la pose. Once pruebas unitarias (seis anteriores y cinco del reloj) y ocho escenarios nuevos de animación correctos; el recorrido anterior vuelve a comprobarse en esta entrega. Capturas 08–13 y PRUEBAS_ANIMACIONES.json.

### Cómo continuar

Abrir `/animaciones.html` o el enlace del menú y elegir gestos con Dante. Ajustar tiempos/amplitudes en animation-state.ts y character-art.ts; geometría del arte en rigs.json. Mantener la física fuera del rig. No presentar esta animación por recortes como un ciclo dibujado tradicional. Próximos pasos: selección familiar, prueba en celular real y luego decidir si hace falta producir cuadros adicionales.

## 2026-10-10 · Demo 0.3: set propio de Pattha

El adulto pidió una carrera más real y un salto que doble/estire las piernas, con polvo y poses distintas al subir/caer. Se generaron tres planchas RGBA con Imagegen integrada desde B: ocho poses de carrera, ocho de salto y ocho de reposo/gestos/ayuda/festejo. Fuentes y prompts en assets/animaciones/pattha/; originales intactos. Las poses son interpretaciones propuestas para revisar con Dante.

### Tareas completadas

1. Generación y revisión del arte; atlas con recortes, apoyos y orientación normalizados en memoria.
2. Integración de Pattha en nivel, menú, diálogos y escenario grande de galería. Preparación de salto de 64 ms activos, estados por velocidad y polvo breve; física separada.
3. Pruebas del set y regresión del juego, capturas, build web y documentación para continuar.

### Ajustes y evidencia

El espaciado de las planchas no era una cuadrícula perfecta: se identificaron los ocho dibujos separados de cada una y se guardaron sus rectángulos en atlas.json para evitar partes vecinas. La segunda fila de carrera se refleja al pintar. Puntos de apoyo ajustados por pose, con la misma escala para que agacharse reduzca la altura. La preparación congela en pausa, acepta tocar/soltar y se omite desde un borde. Polvo también congelado y desactivado en movimiento reducido.

17 pruebas unitarias, 12 escenarios del recorrido, ocho de animación general y diez del nuevo set. La tuerca sigue alcanzándose con dos saltos reales y el multitáctil horizontal sigue funcionando. PRUEBAS_PATTHA_03.json contiene la traza física del salto. Capturas 15–19 y documentación ANIMACIONES_PATTHA_03.md.

Durante esta entrega se preservó la maqueta musical incorporada por el trabajo paralelo de la familia en «Definir música de fondo». Su calidad sonora no se evaluó en esta tarea; el recorrido integrado sigue pasando con ella.

### Próximas tres tareas

1. Elegir con Dante ritmo de carrera y gestos; revisar continuidad y reconocimiento del personaje.
2. Jugar en un celular físico horizontal y ajustar preparación/salto si hace falta.
3. Validar grafía, variante B y título; luego ampliar escenarios o pulir arte según la partida familiar.

## 2026-10-10 · Amigos y rivales más activos

Pedido del adulto: mejorar a Otto, Rural, gatos y perros con menos variedad que Pattha, conservando los movimientos del protagonista. Los ratones quedan confirmados como amigos/aliados amistosos. Se usan los mismos dibujos y recortes: pasos y colas más expresivos, saltitos y gestos al conversar. Diálogos breves entre los ratones en globos de texto, alternando turnos sin detener la partida; frases editables y etiquetadas como PROPUESTA.

Gatos/perros tienen expresión pícara con cejas superpuestas, patrulla más activa y avance corto precedido por un aviso. Al superarlos por salto dejan de colisionar y desaparecen lentamente entre nubecitas, con ojos cerrados y sin violencia explícita. La secuencia y los tiempos de conversación respetan pausa, orientación vertical y pestaña oculta. Movimiento reducido evita saltitos/nubecitas.

Pruebas específicas y capturas 22–25 en PRUEBAS_AMIGOS_Y_RIVALES.json; detalles y comandos en AMIGOS_Y_RIVALES.md. Se conserva el trabajo musical y de publicación de la familia. Pendiente revisar gestos/ritmo con Dante y probar en un celular físico; esta iteración no realiza un despliegue público.

## 2026-10-10 · Seguimiento ligero y fondo discreto

El adulto observó tirones al llegar y volver, pidió ratones más rápidos pero ligeros, menos charlas y globos más sutiles. Se reemplazó el acercamiento del 20% por cuadro y los destinos fijos del puente por seguimiento continuo con velocidad/aceleración limitadas, frenado gradual y formación que cambia suavemente al invertir el rumbo. La demora de los saltos se acortó a 80/160 ms. Al volver al banderín, los amigos reaparecen cerca con un desvanecido suave, sin cruzar todo el mapa. Pasos y saltitos se redujeron ligeramente.

Primera charla a los 20 segundos activos y 60 segundos de silencio entre intercambios; cambiar de zona no acelera la siguiente charla. Texto sin negrita, fondo claro translúcido, bordes redondeados y aparición gradual. Se agregaron pequeñas avionetas vectoriales originales que cruzan ocasionalmente detrás del paisaje, sin sonido ni colisiones. Son una PROPUESTA decorativa autorizada; no se agrega historia ni se cambia Pattha.

26 pruebas unitarias y pruebas específicas por cuadro de cercanía, continuidad al llegar/volver, frenado, pausa, retorno, charlas y avionetas. Evidencia en PRUEBAS_SEGUIMIENTO_Y_FONDO.json y capturas 26–28. Revisión familiar de ritmo y celular real pendiente; build local preparado con los comandos habituales.

## 2026-10-10 · Historia y progresión, propuesta 01

Pedido del adulto: comenzar por la línea argumental, luego niveles y desafíos, con enemigos más elaborados y dificultad creciente que requiera ayuda de Otto y Rural.

Se escribió `14_HISTORIA_Y_PROGRESION.md`: premisa, conflicto, tres actos y cierre; seis niveles conectados con el puente ya jugable; progresión desde patrullas hasta corredores, saltarines, duplas, compuertas y jefe; ayuda contextual de los dos amigos; diálogos de muestra y criterios para una futura adaptación del primer capítulo. Faro, Gran Chispa, Don Candado, sucesos y habilidades ampliadas están marcados como PROPUESTA, sin atribuirlos a Dante.

Se revisó la coherencia con README, decisiones, manifiestos y mecánicas/datos activos. Se preservaron código, datos jugables, builds, imágenes y los borradores narrativos originales del kit. Se agregó una referencia en README y se registró el pedido real en el documento de decisiones. Esta entrega es escrita; no implementa ni prueba nuevos niveles. Pendiente conversar sobre argumento, antagonista y funciones de Otto/Rural antes de convertir el primer capítulo en contenido jugable.

## 2026-10-10 · Pattha gatea

Pedido del adulto: agacharse y caminar agachado para pasar por lugares bajos, con todo el set de movimientos. Se generó una plancha RGBA con Imagegen integrada y referencias de Pattha B: cuatro poses de bajada reversibles para levantarse, ocho pasos, descanso, parpadeo, mirada al techo y frenado. Originales y planchas anteriores conservados; atlas ampliado a 40 cuadros.

Se implementaron ↓ / S y Gatear táctil, colisión baja con pies estables, transición reversible, postura segura bajo techo incluso al soltar o pedir salto, pausa y galería ampliada. El pasaje opcional después del puente y las poses concretas son PROPUESTAS para Dante. Ocho escenarios reales del navegador y pruebas previas de carrera/salto pasaron; capturas de galería, pasaje y móvil emulado revisadas. Se prepararon builds locales; no se publicó. Detalles y prompts en `ANIMACIONES_GATEO.md`.

## 2026-10-10 · Escenarios separados y premio por todas las esferas

Pedido del adulto: esferas nunca sobre/debajo de plataformas de salto, checkpoints separados y más puntos al finalizar al recoger todas. Se reubicaron las 30 esferas fuera de las columnas de plataformas, incluyendo el ancho de imagen y un margen. El puente también queda despejado. Los banderines segundo y cuarto se trasladaron, el primero se ajustó y todos tienen suelo seguro alrededor. Activación solo al pisar piso y reaparición a esa altura. Se despejaron carteles respecto de las esferas/banderines y se corrigió la capa de sus textos.

Tareas completadas: distribución y validación automática; puntaje final/bonus y replay; pruebas, capturas y documentación. PROPUESTA configurable: 100 por esfera y 1.000 por colección completa; 30/30 da 4.000. Reintentar conserva IDs únicos y no duplica puntos; terminar con una colección parcial sigue permitido. Detalles y próximas tareas en ESCENARIOS_Y_PUNTAJE_04.md.

Siete pruebas unitarias nuevas (cuatro del mapa y tres del puntaje), ocho escenarios nuevos de integración y doce del recorrido anterior correctos. Las 30 esferas se alcanzaron por colisión física con caminata o salto desde posiciones iniciales adaptadas, sin asignar progreso. Resumen completo y parcial revisados en horizontal; se compactó la tarjeta para evitar scroll en 844×390. Capturas 29–33 y PRUEBAS_ESCENARIOS_04.json. Se preservan la música, amigos/rivales, fondo y trabajo de gateo de la familia en el mismo repositorio.

Próximas tres tareas: recorrido completo con Dante; elegir valor del bonus; prueba en un celular real horizontal. Canon visual, grafía y título siguen sujetos a la familia.

## 2026-10-30 · Aventura 0.7: correcciones de la revisión

Pedido del adulto: revisar la última versión y después «corregí todos los puntos y subilos». Se corrigió lo visual (pozos, separación de aliados, botones táctiles, textos en celular, duración), se agregaron PROPUESTAS de diseño (antena giratoria, Otto visible, sonidos, modo tranqui, festejo) y se reorganizó el código (mecanismos por capítulo, guardado por eventos, HUD sin escrituras repetidas, favicon). Detalle en [17_MEJORAS_07.md](17_MEJORAS_07.md).

Verificación: typecheck, 60 pruebas unitarias y validación de niveles correctas. Chromium del entorno sin GPU (~11 fps): las pruebas de navegador con tiempos fijos fallan igual que con la 0.6.0 sin tocar. Una verificación por estados recorrió ambos capítulos: aliados separados, caída y choque normales, modo tranqui (choque sin daño, caída al borde x=840), puente completo, recarga con guardado, festejo y textos desde datos, Otto entrando y saliendo del acceso, antena con error suave y giro por teclado/botones, final del bosque, botón de sonidos, celular con textos más grandes y botones al 60 %, sin errores ni 404 en consola.

Próximos pasos: probar con Dante, medir duración, correr las pruebas de navegador en una Mac y decidir si se publica la 0.7.
