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
