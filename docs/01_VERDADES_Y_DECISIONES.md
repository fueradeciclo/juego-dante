# 01 · Canon y decisiones · actualizado 2026-10-10

Las decisiones explícitas de la familia en esta sesión tienen prioridad sobre el kit inicial. No atribuir decisiones creativas a Dante si habló el adulto.

## Canon confirmado

| Dato | Estado / origen |
| --- | --- |
| Dante creó los dibujos originales de los personajes | Confirmado en el kit familiar |
| Robot protagonista verde, negro y metálico, estilo cartoon moderno | Confirmado |
| Pattha es la escritura de referencia | Grafía final pendiente: el adulto también usa Pata |
| Ratón verde amigo: **Otto** | Confirmado por el adulto en el primer pedido de esta sesión; el kit lo dejaba sin nombre |
| Ratón azul amigo: **Rural** | Confirmado |
| Género: plataformas 2D lateral | Elegido por el adulto en esta sesión |
| Destino inicial: navegador en computadora y celular horizontal | Elegido por el adulto; exportaciones a otros destinos para después |
| Solo Pattha controlable | Elegido; ratones aliados, otro modo para una etapa posterior |
| Pattha salta y combate gatos/perros | Pedido actual; «asaltar» se interpretó como «saltar entre plataformas» |
| Crear gatos/perros consistentes con el arte disponible | Autorizado por el adulto con las referencias del kit |
| Todo el juego/build en un nuevo repositorio propio dedicado | Pedido explícito; repositorio privado fueradeciclo/juego-dante |
| Animar movimiento, parpadeos y gestos después de esperar en todos los personajes | Pedido explícito del adulto en la siguiente iteración; incluye Pattha, Otto, Rural, gato y perro |
| Priorizar un set más pulido de Pattha: carrera real, agacharse/estirarse para saltar, polvo y poses distintas al subir/caer | Pedido explícito del adulto para la demo 0.3 |
| Mejorar los movimientos de todos salvo Pattha, con menos variedad que el protagonista | Pedido explícito del adulto en esta iteración |
| Gatos y perros algo más malvados y activos; desaparición apropiada para niños al superarlos | Pedido explícito del adulto; sin violencia explícita |
| Otto y Rural amistosos, amigos y aliados de Pattha, con más movimiento y conversación entre ellos | Confirmado explícitamente por el adulto |
| Desarrollar primero la línea argumental y luego niveles y desafíos; elaborar enemigos y aumentar la dificultad con ayuda de Otto y Rural | Pedido explícito del adulto para la etapa narrativa; argumento y habilidades concretas pendientes |
| Seguimiento de Otto/Rural más rápido y ligero, charlas menos frecuentes y recuadros más sutiles | Pedido de ajuste explícito del adulto |
| Agregar animaciones de fondo muy sutiles, por ejemplo avionetas o gente saludando | Autorizado por el adulto; se implementan avionetas como PROPUESTA decorativa |
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

Faro de las Chispas, Bosque de Antenas, Gran Chispa, niveles de historia; Pattha reparando circuitos, Otto entrando por túneles, Rural interpretando mapas; personalidades de los tres. No son historia oficial y esta demo no implementa los pulsos eléctricos.

## Pendientes creativos y de validación

- Escritura definitiva del robot y título del juego.
- Variante A/B y conformidad de Dante con los rivales generados.
- Historia y habilidades oficiales, anotando las palabras de Dante.
- Dispositivos reales de prueba, edad/ayuda de lectura si la familia desea contarlo.
- Duración 5–10 min y diversión: objetivo, todavía no medición familiar.
- Revisar las 24 poses nuevas de Pattha; pulido adicional, escenarios y audio según evaluación familiar.
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
