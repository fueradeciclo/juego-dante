# Aventura 0.5 · Sendero + Bosque de Antenas

> Actualizado en la 0.7: Otto entra visiblemente al acceso (2,6 s), Rural usa una antena giratoria y hay sonidos, modo tranqui y festejo. Ver [17_MEJORAS_07.md](17_MEJORAS_07.md).

## Estado de entrega

Dos capítulos implementados como maqueta jugable. Historia, títulos y diseños nuevos continúan como PROPUESTA; el adulto eligió esta base para el desarrollo, sin convertirla en decisiones de Dante. Las grabaciones del adulto y el arte final aprobado todavía no están disponibles.

Se mantiene Phaser 3.90.0, TypeScript 5.9.3 y Vite 7.1.12; navegador de computadora y celular horizontal. Sin cuentas, servicios de voz externos, publicidad ni datos personales. El guardado se limita al navegador y dispositivo donde se juega.

## Recorrido y reglas

**Sendero:** mismo mapa de la 0.4, 30 esferas, cinco banderines y ocho rivales. Señales apagadas → tuerca → Otto → secuencia de Rural → puente → marca de candado → resumen → Seguir al bosque.

**Bosque:** ancho 6.200 px, tres tramos, 20 esferas, cuatro banderines y cuatro rivales. El primer corredor aparece solo en un tramo ancho. Aviso de 900 ms, carrera de hasta 1.200 ms sin girar y descanso de 2.200 ms. Después se combina con saltos y patrulleros conocidos. Todos se pueden superar saltando o esquivar.

Otto actúa en el acceso cercano a x=3.220. Se pide ayuda con E/Enter/Ayudar, se lee su frase y su recorrido automático dura 1.600 ms de juego activo. No depende de que el seguimiento haya llevado a Otto hasta el hueco. La pausa congela la ayuda; al terminar se habilita el interruptor.

Rural espera en el panel cercano a x=6.010. Con el interruptor activo, el panel muestra una pista permanente y tres orientaciones con formas. La estrella es la respuesta; equivocarse permite probar nuevamente sin repetir diálogos. Los riesgos se suspenden. El mensaje de Don Candado aparece en el cierre, con icono de candado y sin un retrato inventado.

100 puntos por esfera y 1.000 de bonus por colección completa de cada capítulo: sendero 4.000, bosque 3.000, aventura completa 7.000. El bonus no es requisito para avanzar. El total de aventura se deriva de los capítulos completados y no se incrementa al repetir una pantalla de resumen.

## Guardado y recuperación

Clave `pattha-aventura-v1` de localStorage. Guarda capítulo, último banderín, objetos, mecanismos, pista descubierta, esferas, rivales superados y capítulos completados. Se escribe al cambiar progreso; no guarda posiciones de salto ni ciclos transitorios. Recargar permite Continuar con energía completa en un banderín seguro. Se conservan avances posteriores al último banderín, aunque se reaparece en él.

Nueva aventura pide confirmación si existe progreso. Volver al menú conserva la partida. Un guardado incompatible ofrece comenzar de nuevo; si el navegador bloquea el almacenamiento, se puede jugar y continuar dentro de esa sesión. No hay sincronización entre dispositivos ni se garantiza persistencia en navegación privada.

## Arte para revisar

[Conceptos de bosque, mecanismo, pista y candado](../assets/escenarios/conceptos/bosque-antenas-v1.svg).

La maqueta dibuja árboles, señales y mecanismos con formas originales en el motor. No se generaron sprites de personajes nuevos ni se cambió su identidad. El concepto es una propuesta revisable; producir ilustraciones finales requiere la revisión familiar prevista en el plan. El menú y la galería conservan los assets anteriores.

Revisar con la familia: bosque luminoso y legible, tamaño del hueco de Otto, claridad de las tres orientaciones y presencia discreta del candado. Don Candado conserva nombre provisional.

## Narración

[Guion numerado e instrucciones para el adulto](16_GUION_GRABACION_05.md). Una voz narradora; incluye historia, ayudas principales y pistas, sin charlas ambientales.

El manifiesto enumera archivos esperados y grabaciones disponibles. `pnpm prepare:narration` incorpora los MP3 recibidos. No se solicitan archivos que faltan; texto y pistas siempre funcionan. Con grabaciones, cada línea se reproduce al abrirse; Repetir voz/Repetir pista vuelve a reproducirla. Seguir corta la anterior sin esperar a que termine. Pausa, vertical, pestaña oculta, menú y cambio de capítulo detienen la voz; Repetir permite escuchar nuevamente. La música baja durante diálogo/acertijo. Mientras faltan todos los archivos, la barra muestra Voz: pendiente.

## Ejecutar, probar y entregar

Desde la raíz: `./scripts/jugar.command`; abrir http://localhost:5173. Instalación nueva: `pnpm install --frozen-lockfile --ignore-scripts`, Node 24+ y pnpm 11.25.0. Controles sin cambios: flechas/A-D, Espacio/W/↑, ↓/S, E/Enter, Esc; paneles con 1/2/3 y botones táctiles.

- `pnpm typecheck` y `pnpm test`: tipos y reglas, incluyendo guardado, puntaje y corredor.
- `pnpm validate:level`: geometría, apariciones, interacciones y patrullas seguras de ambos capítulos.
- `pnpm test:campaign`: integración, con servidor de desarrollo activo y navegador aislado. Guarda resultados y capturas propios de la 0.5.
- `pnpm test:browser` y `pnpm test:scenarios`: regresión del sendero, adaptada a la nueva narrativa y confirmación; preservan evidencia histórica de la 0.4.
- `pnpm build:site`: prepara `builds/web/` y `builds/site/pattha_game/`. `pnpm preview`: revisión local del build por HTTP. No abrir index.html directamente.

En esta Mac, también se usan los ejecutables de Node/pnpm incluidos en Codex si no hay Node en PATH; el lanzador existente los detecta.

## Aceptación pendiente

Prueba familiar continua en computadora y un celular real, duración objetivo 15–20 min, comprensión de la cooperación y diversión. El ancho del mapa no certifica la duración. No hay esperas artificiales ni intentos limitados. La narración real requiere recibir y escuchar los archivos; las pruebas simuladas solamente validan el control de reproducción. Arte final pendiente de aprobación.

No publicar automáticamente: Cloudflare está conectado a GitHub. El build local queda listo para revisión; subir cambios puede disparar un despliegue.

## Verificación realizada · 2026-10-11

- Comprobación de tipos correcta; 45 pruebas de reglas correctas.
- Validación de demo histórica y ambos capítulos: 50 esferas activas y nueve banderines con márgenes seguros. Originales verificados por checksum.
- 15 escenarios de campaña, 12 de regresión del sendero, ocho de colección/puntaje y ocho de gateo correctos. Incluyen las 50 esferas alcanzadas mediante colisiones y controles reales desde posiciones de prueba, guardado/recarga, almacenamiento bloqueado, ayudas, pause/vertical y multitáctil.
- Cinco comprobaciones del build estático bajo `/pattha_game/`: carga, ausencia del adaptador de pruebas, acceso al panel del bosque con controles reales, cierre narrativo y galería. Sin errores JavaScript, recursos faltantes ni solicitudes externas.
- Build local actualizado en `builds/web/` y `builds/site/pattha_game/`. Aviso conocido por tamaño del motor; no es un error de compilación.
- Capturas revisadas de bosque, panel, mensaje y resumen móvil; se corrigió el desborde de símbolos en los botones.

Evidencia: PRUEBAS_AVENTURA_05.json, PRUEBAS_BROWSER_05.json, PRUEBAS_ESCENARIOS_REGRESION_05.json, PRUEBAS_GATEO_05.json y PRUEBAS_BUILD_AVENTURA_05.json. La voz se probó con Audio simulado; todavía no hay grabaciones reales. Las pruebas aisladas no reemplazan una partida familiar continua ni un celular físico.
