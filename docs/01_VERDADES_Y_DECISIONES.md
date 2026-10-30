# 01 · Canon y decisiones · actualizado 2026-10-10

Las decisiones explícitas de la familia en esta sesión tienen prioridad sobre el kit inicial. No atribuir decisiones creativas a Dante si habló el adulto.

## Canon confirmado

| Dato | Estado / origen |
| --- | --- |
| Dante creó los dibujos originales de los personajes | Confirmado en el kit familiar |
| Robot protagonista verde, negro y metálico, estilo cartoon moderno | Confirmado |
| Pattha es la escritura de referencia | Grafía final pendiente: el adulto también usa Pata |
| Amigo ratón **Otto**, cuerpo color hueso | Nombre confirmado anteriormente; el adulto reemplazó el verde por hueso el 2026-10-11. Originales verdes conservados |
| Amigo ratón **Rural**, cuerpo gris muy oscuro | Nombre confirmado anteriormente; el adulto reemplazó el azul por gris muy oscuro el 2026-10-11. Originales azules conservados |
| Género: plataformas 2D lateral | Elegido por el adulto en esta sesión |
| Destino inicial: navegador en computadora y celular horizontal | Elegido por el adulto; exportaciones a otros destinos para después |
| Solo Pattha controlable | Elegido; ratones aliados, otro modo para una etapa posterior |
| Pattha salta y combate gatos/perros | Pedido actual; «asaltar» se interpretó como «saltar entre plataformas» |
| Crear gatos/perros consistentes con el arte disponible | Autorizado por el adulto con las referencias del kit |
| Todo el juego/build en un nuevo repositorio propio dedicado | Pedido explícito; repositorio fueradeciclo/juego-dante |
| Animar movimiento, parpadeos y gestos después de esperar en todos los personajes | Pedido explícito del adulto en la siguiente iteración; incluye Pattha, Otto, Rural, gato y perro |
| Priorizar un set más pulido de Pattha: carrera real, agacharse/estirarse para saltar, polvo y poses distintas al subir/caer | Pedido explícito del adulto para la demo 0.3 |
| Mejorar los movimientos de todos salvo Pattha, con menos variedad que el protagonista | Pedido explícito del adulto en esta iteración |
| Gatos y perros algo más malvados y activos; desaparición apropiada para niños al superarlos | Pedido explícito del adulto; sin violencia explícita |
| Otto y Rural amistosos, amigos y aliados de Pattha, con más movimiento y conversación entre ellos | Confirmado explícitamente por el adulto |
| Desarrollar primero la línea argumental y luego niveles y desafíos; elaborar enemigos y aumentar la dificultad con ayuda de Otto y Rural | Pedido explícito del adulto para la etapa narrativa; argumento y habilidades concretas pendientes |
| Seguimiento de Otto/Rural más rápido y ligero, charlas menos frecuentes y recuadros más sutiles | Pedido de ajuste explícito del adulto |
| Agregar animaciones de fondo muy sutiles, por ejemplo avionetas o gente saludando | Autorizado por el adulto; se implementan avionetas como PROPUESTA decorativa |
| Esferas fuera de la zona vertical de plataformas, checkpoints separados y premio por recoger todas | Pedido explícito del adulto para mejorar los escenarios |
| Pattha puede agacharse, caminar agachado/gatear y pasar por lugares bajos; crear su set completo | Pedido explícito del adulto en esta sesión |
| Sin publicidad, compras, cuentas ni servicios de juego externos | Requisito familiar |

## Tecnología y decisiones de implementación

**Phaser 3.90.0 + TypeScript 5.9.3 + Vite 7.1.12**, Node 24+, pnpm 11.25.0, lockfile fijado. Se eligió después de comparar Godot, Phaser y GDevelop y recibir destino/género/modo. La prioridad actual es jugar directamente en navegador con teclado y multitáctil. Se fija una versión estable de Phaser 3 para esta demo; no se migra a Phaser 4 sin necesidad y verificación.

Resolución de referencia 1280×720; cámara lateral; escalado FIT; pausa en celular vertical y al perder foco. Assets y JSON desacoplados del código. Exportación actual: carpeta web estática servida por HTTP, con base relativa. No hay empaquetado móvil nativo. La publicación web se registra más abajo.

## Propuestas implementadas, sujetas a Dante

- «El sendero de los amigos» es una descripción provisional del recorrido, no el título final del juego.
- Saltar encima supera a un rival con un destello; los choques laterales gastan energía. Sin muerte explícita, sin vidas limitadas.
- Tres tramos, 30 destellos, ocho animales, checkpoints y llegada.
- Otto ajusta una tuerca que trae Pattha; Rural da la pista círculo → estrella → triángulo para abrir un puente.
- Diálogos, recorrido y estas funciones contextuales de los ratones son propuestas de demo.
- Imagen B de Pattha seleccionada provisoriamente porque el kit ya la usaba en data/personajes.json.
- Gato naranja y perro marrón son propuestas ilustradas nuevas. Su color, nombre y personalidad no fueron elegidos por Dante.
- Demo 0.2: animación por partes sobre el arte existente, con cabeza/brazos/patas/cola, ojos que cierran, gesto de pensar tras ~8 s y de aburrirse tras ~14 s. Esos gestos concretos son PROPUESTAS reversibles; no fijan personalidades oficiales. No hay nuevos PNG de poses ni spritesheets dibujados.
- Demo 0.3: Pattha reemplaza su rig visual por 24 poses nuevas generadas con Imagegen desde B. Ocho cuadros de carrera, ocho de salto/aterrizaje/rebote y ocho de reposo/gestos/ayuda/festejo. Preparación de salto de 64 ms activos y polvo leve. No cambia el canon, las habilidades ni los originales; las interpretaciones de poses siguen pendientes de Dante. Amigos y rivales conservan el rig 0.2.
- Mejora posterior de amigos/rivales: mismo rig y PNG, pasos/colas/brazos más expresivos; pequeños saltitos de Otto/Rural y conversaciones con turnos sin frenar la partida. Rivales con cejas temporales, aviso de 480 ms, avance breve dentro de su tramo y descanso. Desaparición de 900 ms con ojos cerrados, contracción leve y nubecitas; colisión desactivada de inmediato. Gestos, parámetros y frases son PROPUESTAS; no se atribuyen a Dante. Pattha conserva sus movimientos, arte y controles.

## Ideas del kit que siguen sin aprobar

Bosque de Antenas y Gran Chispa ya se usan en la aventura 0.5–0.7 como PROPUESTA elegida por el adulto como base de desarrollo (no son canon de Dante). Siguen sin aprobar: Faro de las Chispas, niveles de historia; Pattha reparando circuitos, Otto entrando por túneles, Rural interpretando mapas; personalidades de los tres. No son historia oficial y esta demo no implementa los pulsos eléctricos.

## Pendientes creativos y de validación

- Escritura definitiva del robot y título del juego.
- Variante A/B y conformidad de Dante con los rivales generados.
- Historia y habilidades oficiales, anotando las palabras de Dante.
- Dispositivos reales de prueba, edad/ayuda de lectura si la familia desea contarlo.
- Duración 10–20 min (5–10 por capítulo) y diversión: objetivo, todavía no medición familiar.
- Propuestas 0.7 a validar con Dante: antena giratoria de Rural, Otto entrando al acceso, efectos de sonido, modo tranqui, festejo con confeti y arte de los pozos. Ver [17_MEJORAS_07.md](17_MEJORAS_07.md).
- Revisar las 40 poses de Pattha, incluido el nuevo gateo; pulido adicional, escenarios y audio según evaluación familiar.
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
| 2026-10-10 | Todos los personajes animados, incluyendo parpadeos y espera | Adulto, pedido de esta iteración | Rig 2D sin reemplazar originales; galería familiar; pausa del reloj y movimiento reducido |
| 2026-10-10 | Pulir especialmente carrera y salto de Pattha | Adulto, siguiente pedido | Demo 0.3 con tres planchas generadas, atlas de 24 cuadros, salto anticipado y polvo; nuevas poses sujetas a Dante |
| 2026-10-10 | Mejorar amigos y rivales sin modificar los movimientos de Pattha | Adulto, pedido actual | Animaciones por partes más expresivas, acecho con aviso, desaparición infantil y charlas entre Otto/Rural; misma tecnología y fuentes |
| 2026-10-10 | Construir la historia antes de desarrollar niveles; progresión de enemigos y desafíos apoyada en Otto y Rural | Adulto, pedido de historia | Borrador separado en 14_HISTORIA_Y_PROGRESION.md; ningún argumento, villano o poder nuevo se registra como aprobado |
| 2026-10-10 | Suavizar el seguimiento, espaciar charlas y animar el fondo | Adulto, ajuste posterior | Aceleración/frenado de aliados sin cortes en zonas, descanso de 60 s, globos tenues y pequeñas avionetas; mismos controles y movimiento de Pattha |
| 2026-10-11 | Otto pasa de verde a hueso y Rural de azul a gris muy oscuro | Adulto | Derivados nuevos en `assets/personajes/derivados/`; originales verdes/azules conservados. AGENTS.md actualizado el 2026-10-30 |
| 2026-10-11 | Aprobar los kits del Hito 2 (tilesets ilustrados, interfaz azul/ámbar) y publicar la aventura 0.5.1 de dos capítulos | Adulto | Sendero y Bosque de Antenas con guardado; ver PUBLICACION_CLOUDFLARE.md. Historia del bosque sigue como PROPUESTA |
| 2026-10-30 | Corregir todos los puntos de la revisión de la 0.6.0 | Adulto, pedido explícito | Versión 0.7.0: pozos ilustrados, aliados separados, celular más legible, sonidos, modo tranqui, antena giratoria, Otto visible, festejo, mecanismos por capítulo y guardado por eventos. Las mecánicas y opciones nuevas son PROPUESTAS para Dante. `builds/web/` sigue versionado por el pedido familiar previo |

Actualizar este registro al cambiar una decisión, conservando la anterior y el motivo. No usar los diálogos escritos por Codex como palabras originales de Dante.

## Desarrollo de historia · 2026-10-10

El adulto pidió: «Para comenzar vamos con la línea argumental, luego pensemos en los niveles y desafíos» y que los enemigos y desafíos sean cada vez más elaborados, con ayuda de Otto y Rural. Esto confirma el orden de trabajo y la dirección de progresión, no una trama concreta.

Se preparó [14_HISTORIA_Y_PROGRESION.md](14_HISTORIA_Y_PROGRESION.md), **PROPUESTA 01**: recuperar la Gran Chispa, un perro antagonista llamado provisoriamente Don Candado, seis capítulos y un jefe que combina desafíos conocidos. Retoma motivos del kit y propone una alternativa al giro del circuito suelto del borrador anterior. El puente existente sirve como primer capítulo. Entrar por conductos, destrabar seguros e interpretar patrones amplían las funciones propuestas de Otto/Rural; permanecen sin aprobar. No cambia el canon visual, el control de Pattha ni la demo activa. Los documentos del kit se conservan.

## Publicación web · 2026-10-10

El adulto compró `sabad.com.ar`, eligió Cloudflare y pidió comenzar la publicación. Confirmó que `/pattha_game/` será exclusivamente para el juego y la portada quedará para otros proyectos. Esto actualiza el pendiente anterior de hosting público. Se prepara `builds/site/pattha_game/` a partir del build web, sin publicar documentos ni originales. Se puede continuar iterando en GitHub. Conexión con la cuenta, configuración DNS y despliegue público todavía pendientes de verificar; no se registra una publicación como completada.

Actualización de publicación: juego desplegado en `https://juego-dante.pages.dev/pattha_game/`, integrado con GitHub. El adulto autorizó explícitamente delegar `sabad.com.ar` a `rick.ns.cloudflare.com` y `rita.ns.cloudflare.com`; NIC confirmó «Delegado: SI». Cloudflare espera propagación. Asociación del dominio personalizado y verificación HTTPS pendientes. Ver `PUBLICACION_CLOUDFLARE.md`.

## Música · 2026-10-10

El adulto eligió música instrumental heavy metal épica y melódica, con subida de energía, usando Crush 40 y Dragon Ball Z como referencias de emoción. No eligió una canción comercial para incorporarla. Primera PROPUESTA implementada: composición original sintetizada localmente, 150 BPM, ciclo de 64 compases (102,4 segundos), riff de acordes de quinta, bajo, batería y melodía heroica. Sin samples externos, voces ni melodías de las referencias. Es una maqueta electrónica, pendiente de escuchar y validar con la familia; no una grabación de instrumentos reales. Volumen inicial 22%, silencio y volumen accesibles; baja durante diálogo y acertijo, se suspende en pausa, menú, pestaña oculta y orientación vertical.

### Revisión musical · 2026-10-10

El adulto pidió mucho más energía desde el comienzo, con la canción original de Power Rangers como referencia emocional. PROPUESTA revisada: 168 BPM, banda completa desde el primer compás, riff galopado y sincopado de quintas, melodía heroica inmediata, platillos y redobles. Ciclo de 64 compases (~91,4 s). Compresión para controlar picos. Sigue siendo una maqueta sintetizada original, pendiente de validación auditiva familiar.

### Música elegida · 2026-10-10

El adulto entregó `Triumph in Steel.mp3` y pidió usarlo como música de fondo. Se conserva una copia sin modificar en `assets/audio/triumph-in-steel.mp3`; reemplaza la maqueta sintetizada. Repetición del archivo completo (sin edición para crear un loop musical continuo), volumen inicial 22%, reducción a 30% del volumen elegido en diálogos y puzzle, pausa al interrumpir la partida y regreso al inicio de la pista al volver al menú. Procedencia: archivo proporcionado por el adulto después de la conversación sobre Suno; servicio de origen y licencia no verificados. No se atribuye autoría ni licencia al archivo.

## Dominio público conectado · 2026-10-10

Juego disponible en `https://sabad.com.ar/pattha_game/`, verificado por HTTPS e inicio de partida. Cloudflare Pages continúa conectado a GitHub y la portada queda reservada para otros proyectos.

## Escenarios y premio por colección completa · 2026-10-10

Pedido confirmado del adulto: ninguna esfera encima ni debajo de las plataformas de salto, banderines separados de las plataformas y más puntos al finalizar si se juntan todas. Se reubicaron las 30 esferas y se ajustaron tres checkpoints, con márgenes que consideran todo el ancho de sus imágenes; todos los banderines se activan en suelo firme. El puente también queda libre de esferas.

PROPUESTA de puntaje implementada: 100 por esfera y +1.000 al recoger todas (4.000 para 30/30). Los valores están en el JSON del nivel y pueden ajustarse con Dante; no se atribuyen a él. El bonus no es necesario para terminar y no se duplica durante reintentos. Ver ESCENARIOS_Y_PUNTAJE_04.md para criterios, pruebas y continuidad.

### Gateo de Pattha · 2026-10-10

Se implementa la habilidad pedida por el adulto: ↓ / S o botón Gatear, pasos en ambas direcciones, bajada y subida reversibles, postura baja al soltar bajo techo y colisión reducida sin desplazar los pies. Imagegen integrada produjo 16 dibujos nuevos derivados de B; el atlas contiene 40 cuadros. Las poses concretas, la velocidad de 125 px/s y el pasaje opcional después del puente son PROPUESTAS de demo para revisar con Dante. Ver [set, controles y procedencia](ANIMACIONES_GATEO.md). Los originales se conservan.

### Estado del repositorio de trabajo · 2026-10-10

Al verificar la entrega 0.4, GitHub informa `private: false`: el repositorio dedicado actualmente es público. La creación inicial como privado queda en el registro histórico. Esta observación actualiza la descripción del README y de la publicación; no se atribuye a Dante como una decisión creativa.

## Aventura de dos capítulos · 2026-10-11

Decisiones explícitas del adulto durante planificación e implementación:

- Primera versión: sendero + Bosque de Antenas; objetivo 15–20 minutos, sin duración certificada todavía.
- Mantener Phaser y navegador de computadora/celular horizontal.
- Usar la Gran Chispa, faro y Don Candado como base de trabajo provisional. No constituye aprobación de canon por Dante.
- Guardado local con recuperación desde el último banderín y conservación de avances.
- Escenarios nuevos: conceptos a revisar antes del arte final; personajes actuales preservados.
- Dificultad suave y progresiva; tres puntos de energía y reintentos libres.
- Antena: relacionar formas y orientaciones con pista visible, sin memoria ni límite de tiempo.
- Narración por un adulto, para historia y acertijos; conversaciones ambientales sin voz.
- Implementar el plan y entregar maqueta jugable, soporte de audio, guion y build local. Publicación para otra decisión.

El mapa del bosque, las frases, los tiempos del corredor, el gesto de Otto y los valores de colección son propuestas de implementación revisables. No se registran como elecciones de Dante. Véase 15_AVENTURA_05.md y 16_GUION_GRABACION_05.md. Voces reales y arte final siguen pendientes de recepción/revisión familiar.

### Visibilidad de avionetas · 2026-10-11

El adulto informó que no veía las avionetas. Se agregó vista previa del cielo en la galería, primera pasada más temprana, mayor contraste y vuelos a altura que deja verlas sobre el bosque. Como reducir movimiento ocultaba los vuelos, se incorporó una elección explícita «Avionetas en el cielo» en inicio/pausa, guardada como preferencia local independiente de la aventura. La configuración del dispositivo se conserva; las otras animaciones siguen respetando reducir movimiento. Los vuelos manuales de la galería se activan al tocar su botón. La forma vectorial y los tiempos son PROPUESTA de implementación decorativa.

## Música oficial · 2026-10-11

La familia confirmó Iron Teeth Against the Gear (creada con Gemini según el adulto). El riff inicial es la identidad musical oficial de Pattha y debe conservarse sin modificaciones. MP3 original intacto en assets/audio/pattha-main-theme-v1.mp3. Triumph in Steel se conserva como respaldo.

## Identidad visual y colores de los amigos · 2026-10-11

Decisiones explícitas del adulto en esta conversación:

- Usar **PATTHA**, sin subtítulo, en las propuestas de portada y logo. No confirma por sí solo la grafía definitiva con Dante.
- Dirección visual: cartoon de **aventura enérgica**, conservando la identidad del concepto B de Pattha como referencia provisional.
- **Otto:** reemplazar el cuerpo verde por color hueso, con crema suave y sombras cálidas; evitar blanco puro uniforme.
- **Rural:** reemplazar el cuerpo azul por gris muy oscuro, con detalles en gris cálido más claro; evitar negro puro uniforme.
- Conservar siluetas, proporciones, ojos, orejas y demás rasgos de ambos amigos. El cambio de colores actualiza las referencias anteriores; los originales se conservan.
- Comparar **violeta y crema** con **azul y ámbar**, manteniendo verde, grafito, metal y cian de Pattha. Las paletas secundarias se aplican a fondos, luces y gráfica.
- Primera entrega: **dos láminas comparativas** con portada, menú, logo, ícono, avatares, publicación y muestras de merchandising. Archivos individuales de producción e integración al juego quedan para después de elegir la dirección.

Los HEX concretos, poses, escenarios ilustrados, tipografía y aplicaciones son **PROPUESTAS** de arte conceptual pendientes de revisión con Dante; no se atribuyen a él. La decisión de recolorear a los amigos sí fue tomada por el adulto. Esta entrega no recolorea los sprites ni modifica el juego publicado. Fuentes, prompts y revisión en `assets/interfaz/conceptos/identidad/`.

### Dirección visual elegida por Dante · 2026-10-11

El adulto informó explícitamente: **«Dante eligió ámbar y azul. Vamos por esa propuesta»**. Se adopta **02 · Azul y ámbar** como dirección visual de PATTHA y referencia para desarrollar las siguientes piezas. Lámina seleccionada: `assets/interfaz/conceptos/identidad/pattha-azul-ambar-v1.png`. Violeta y crema queda conservada como alternativa histórica.

La elección confirma la combinación visual azul y ámbar; no implica aprobar por separado cada pose, escenario, tipografía o HEX exacto ni cambiar la historia. Se mantienen las decisiones del adulto sobre Otto hueso y Rural gris muy oscuro y la paleta verde/grafito/metal/cian de Pattha.

## Tileset y campaña completa autorizados · 2026-10-11

El adulto pidió implementar el plan de arte y campaña completa: seis capítulos jugables (sendero, bosque, túneles, fábrica, patios y faro), cartoon ilustrado azul/ámbar y variedad luminosa, objetivo orientativo 45–60 minutos, amigos recoloreados también dentro del juego y mecánicas progresivas de la propuesta narrativa.

Don Candado será un perro distinto y malicioso, con salto que permita a Pattha pasar por debajo, carreras y compuertas. El combate tendrá tres fases, cooperación y victoria por salto encima en descanso vulnerable; se conservarán fases superadas en los reintentos.

Estas ampliaciones fueron elegidas por el adulto; no se atribuyen a Dante. La ejecución está condicionada a **tres validaciones humanas explícitas**: muestras/conceptos, kits completos/pruebas aisladas y campaña integrada. Autorizar implementar el plan no equivale a aprobar muestras todavía no presentadas. La producción completa espera la primera validación; la integración de campaña espera la segunda. Publicación y push que dispare despliegue requieren otra autorización.

Plan operativo y registro de hitos: [17_TILESET_Y_CAMPANA.md](17_TILESET_Y_CAMPANA.md). El juego actual conserva por ahora sus dos capítulos y su arte; la primera entrega de este trabajo es conceptual.

Entrega de Hito 1: seis muestras de ambiente, lámina de módulos ensamblados corregida (v2) y concepto de Don Candado con seis poses de salto/esquema de evasión, generados con Imagegen integrada. Galería y evidencia en `assets/escenarios/tilesets/hito-1/`. Inspección visual y revisión de galería en computadora/celular emulado realizadas; código y fuentes sin cambios. **Aprobación de Hito 1 todavía pendiente**. Estas láminas no son tilesets funcionales ni animaciones ni pruebas de física.

### Hito 1 aprobado · 2026-10-11

El adulto respondió **«Si. Apruebo todo. Avancemos»**. Quedan aprobadas las seis muestras de ambiente, escala conceptual del trío, propuesta modular y apariencia/poses conceptuales de Don Candado. Se autoriza producir el Hito 2: kits completos, derivados de personajes y pruebas aisladas. La aprobación no certifica física ni convierte las láminas en atlas funcionales. La integración de seis capítulos sigue esperando la aprobación del Hito 2.

### Hito 2 · entrega técnica para revisar · 2026-10-11

Se produjeron seis kits, piezas individuales y ocho atlas; estados comunes, fondos exteriores/interiores, derivados de Otto/Rural y 16 frames de Don Candado. Fuente, prompts y manifiesto en `assets/escenarios/tilesets/`; instrucciones en `LEEME.md`. Taller independiente en `game/tilesets.html`, con pruebas de ascensor, plataforma, compuerta, gato, dupla y jefe. Las colisiones se definen explícitamente. La galería es una herramienta local separada del build del juego.

Se conservaron los originales y la música oficial. Los cambios de trazo de los derivados y los valores de mecanismos son PROPUESTAS técnicas, no decisiones nuevas de Dante. Las fases y ayudas de la prueba del jefe tienen un guardado aislado; no migran ni modifican la aventura vigente. La campaña de seis capítulos y su duración siguen pendientes de Hito 3. **La aprobación humana del Hito 2 no se ha recibido.**

### Hito 2 aprobado y publicación autorizada · 2026-10-11

El adulto respondió **«Apruebo todo. Subamos y actualicemos la versión en cloudflare»** después de la entrega técnica del Hito 2. Quedan aprobados los kits y las pruebas aisladas; se autoriza integrar el Hito 3 y actualizar el proyecto existente de Cloudflare Pages, `juego-dante`, servido en `sabad.com.ar/pattha_game/`. Esta respuesta reemplaza el estado pendiente de aprobación del Hito 2 indicado arriba.

La actualización 0.5.1 publica la aventura disponible de sendero y bosque, gateo, guardado, avionetas y música oficial. La campaña integrada de seis capítulos todavía no está implementada ni validada; el taller de mecanismos permanece separado del build de producción. No se cambia el dominio ni se atribuye esta autorización a Dante. El resultado del despliegue se registra en `PUBLICACION_CLOUDFLARE.md` al verificarlo.

### Corrección de integración visual · 2026-10-11

El adulto señaló que no cambiaron escenarios ni diseño después del despliegue. La 0.5.1 había publicado el render anterior; subir el build no integró los kits aprobados. Se corrige en 0.6.0: terreno y fondos de Sendero/Bosque desde atlas, mecanismos con estados, Otto hueso y Rural gris oscuro en juego/retratos/galería y menú/interfaz azul y ámbar. Se mantienen coordenadas, colisiones, IDs y guardado actual.

La autorización anterior de publicación sigue vigente para esta corrección. Esta entrega visual de los dos capítulos no representa la campaña completa de seis: los cuatro capítulos y jefe finales continúan pendientes de integración y revisión del Hito 3. No se atribuyen decisiones adicionales a Dante.
