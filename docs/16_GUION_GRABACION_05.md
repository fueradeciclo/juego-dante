# Guion de grabación · aventura 0.5

PROPUESTA de diálogos. Revisión del adulto antes de grabar. No atribuir estos textos a Dante.

Una voz adulta narradora para todos los personajes; cambiar suavemente la intención, sin necesidad de imitar voces. Español argentino, tono amistoso y claro. Don Candado protesta con humor, sin gritos ni sustos.

## Cómo grabar

- Un archivo por entrada, con el nombre exacto indicado. MP3, mono o estéreo, preferentemente 44,1 o 48 kHz. Sin música de fondo.
- Grabar en un lugar tranquilo, con distancia constante al micrófono y sin saturar. Dejar una pausa breve al empezar y terminar.
- Leer solamente el texto; el nombre del personaje identifica la intención y no se dice. En las pistas, leer los símbolos por su nombre.
- Entregar los archivos; conservar los originales sin editar. Las copias de reproducción se incluyen en el juego.
- El juego mantiene subtítulos y espera que el jugador toque Seguir. Las conversaciones ambientales no llevan voz.

## Archivos y textos

### 01 · sendero-intro-01

Personaje: **pattha** · Archivo: `sendero-intro-01.mp3`

¡Las señales se apagaron! Vamos a ver qué pasó.

### 02 · sendero-intro-02

Personaje: **otto** · Archivo: `sendero-intro-02.mp3`

El puente está trabado. Si encontramos una tuerca, puedo arreglarlo.

### 03 · sendero-intro-03

Personaje: **rural** · Archivo: `sendero-intro-03.mp3`

¡Vamos juntos! Saltá con Espacio. En el celu tenés botones. Si te caés, volvés al banderín.

### 04 · sendero-otto_sin_tuerca-01

Personaje: **otto** · Archivo: `sendero-otto_sin_tuerca-01.mp3`

Al puente le falta una tuerca. Hay una arriba de esa plataforma. ¿La buscás?

### 05 · sendero-otto-01

Personaje: **otto** · Archivo: `sendero-otto-01.mp3`

¡Esa es! Yo ajusto este lado. Rural tiene la pista de la señal.

### 06 · sendero-rural_sin_otto-01

Personaje: **rural** · Archivo: `sendero-rural_sin_otto-01.mp3`

Primero ayudemos a Otto con la tuerca. Después encendemos la señal entre los tres.

### 07 · sendero-final-01

Personaje: **otto** · Archivo: `sendero-final-01.mp3`

¡Cruzamos el sendero entre los tres!

### 08 · sendero-final-02

Personaje: **rural** · Archivo: `sendero-final-02.mp3`

En el Bosque de Antenas podemos averiguar quién apagó las señales.

### 09 · sendero-marca-01

Personaje: **otto** · Archivo: `sendero-marca-01.mp3`

Mirá, un candado marcado en el puente. Alguien cerró este camino.

### 10 · sendero-marca-02

Personaje: **rural** · Archivo: `sendero-marca-02.mp3`

Las señales siguen hacia el bosque. ¡Busquemos la antena!

### 11 · sendero-puente_listo-01

Personaje: **rural** · Archivo: `sendero-puente_listo-01.mp3`

¡Esa es! Otto ajustó la tuerca y vos encendiste la señal. ¡Ahora podemos cruzar!

### 12 · sendero-pista

Personaje: **rural** · Archivo: `sendero-pista.mp3`

Círculo, después estrella y después triángulo.

### 13 · bosque-intro-01

Personaje: **rural** · Archivo: `bosque-intro-01.mp3`

Esta antena nos puede mostrar qué pasó con la luz.

### 14 · bosque-intro-02

Personaje: **otto** · Archivo: `bosque-intro-02.mp3`

Ese perro avisa antes de correr. Esperá a que descanse o saltá por arriba.

### 15 · bosque-otto-01

Personaje: **otto** · Archivo: `bosque-otto-01.mp3`

Por este huequito llego al interruptor. ¡Dame una mano!

### 16 · bosque-otto-02

Personaje: **otto** · Archivo: `bosque-otto-02.mp3`

¡Listo, está encendido! Ahora busquemos el panel de Rural.

### 17 · bosque-rural_sin_otto-01

Personaje: **rural** · Archivo: `bosque-rural_sin_otto-01.mp3`

A la antena le falta energía. Primero pidámosle ayuda a Otto en el acceso pequeño.

### 18 · bosque-antena_lista-01

Personaje: **rural** · Archivo: `bosque-antena_lista-01.mp3`

¡La estrella apunta al faro! La antena ya recibe la señal.

### 19 · bosque-final-01

Personaje: **candado** · Archivo: `bosque-final-01.mp3`

¡La Gran Chispa está conmigo! ¡Ahora yo decido quién pasa!

### 20 · bosque-final-02

Personaje: **otto** · Archivo: `bosque-final-02.mp3`

¿Y si encontramos otro camino?

### 21 · bosque-final-03

Personaje: **rural** · Archivo: `bosque-final-03.mp3`

Mirá estos símbolos. Llevan al faro.

### 22 · bosque-final-04

Personaje: **pattha** · Archivo: `bosque-final-04.mp3`

¡Hay que devolver la luz! Seguiremos juntos.

### 23 · bosque-pista

Personaje: **rural** · Archivo: `bosque-pista.mp3`

La señal del faro tiene una estrella ★. Elegí la antena con esa forma.

## Integración

Copiar las grabaciones recibidas a `assets/audio/narracion/`. Ejecutar `pnpm prepare:narration` para comprobar archivos y actualizar el manifiesto de grabaciones disponibles; luego `pnpm build:site`. No se carga ningún archivo faltante ni se realizan solicitudes a servicios de voz externos.

Escuchar cada grabación con el adulto para revisar texto, pronunciación y volumen. Confirmar autorización del adulto para usar su voz antes de publicar.
