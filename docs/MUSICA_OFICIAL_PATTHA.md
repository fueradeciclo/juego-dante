# Música oficial de Pattha — v1

## Decisión familiar

La pista **Iron Teeth Against the Gear** es el tema musical elegido para Pattha. Su riff introductorio es el motivo oficial y debe conservarse sin reinterpretarlo al realizar nuevas versiones musicales. La versión original íntegra fue aportada por la familia en la conversación de ChatGPT de octubre de 2026.

## Archivos

- `assets/audio/pattha-main-theme-v1.mp3`: colocar aquí la pista completa **Iron_Teeth_Against_the_Gear.mp3**, conservando el audio original.
- `assets/audio/triumph-in-steel.mp3`: pista anterior, conservada como respaldo; no borrar.
- Conservar por separado el motivo aislado y el master original en el archivo de fuentes del proyecto para futuras variaciones musicales.

## Implementación

`game/src/music.ts` reproduce la nueva pista cuando está presente y usa la anterior si la primera no carga. La pista se reproduce en bucle durante la partida, espera una interacción del usuario para respetar las restricciones de reproducción automática del navegador, permite silenciar y ajustar volumen, baja durante los diálogos y puzzles y se pausa con el juego.

`scripts/prepare-assets.mjs` copia el MP3 oficial a `game/public/assets/audio/` si está presente. El archivo principal no se modifica ni convierte durante el proceso.

## Activación en el proyecto

1. Copiar `Iron_Teeth_Against_the_Gear.mp3` sin modificar a `assets/audio/pattha-main-theme-v1.mp3`.
2. Ejecutar `pnpm dev` para reproducir la pista localmente.
3. Verificar que la música empieza después de pulsar Jugar, que se escucha en bucle, que se puede silenciar, y que se pausa/reanuda como corresponde.
4. Ejecutar `pnpm typecheck && pnpm test && pnpm build:site`.
5. Publicar el contenido de `builds/site/` mediante el procedimiento de despliegue de Cloudflare Pages documentado en `docs/PUBLICACION_CLOUDFLARE.md`.

**Estado:** el código está preparado. Hasta que se copie el archivo MP3 a la ruta indicada y se despliegue el nuevo build, el sitio publicado seguirá mostrando la versión anteriormente desplegada.

## Uso en la identidad musical

Para nuevas piezas, tomar el audio original del riff como referencia, no reemplazar sus notas, acentos ni silencios con nuevos riffs generados. Mantener el mismo motivo en variaciones de exploración, combate, victoria y jefe final.
