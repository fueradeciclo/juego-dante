# Publicación en sabad.com.ar

Decisión del adulto, 2026-10-10: `/pattha_game/` se reserva para el juego; la portada queda para otros proyectos. Cloudflare es el destino solicitado. La publicación todavía requiere acceso a la cuenta y verificar el dominio.

## Preparar

```sh
pnpm build:site
```

Salida: `builds/site/`, con el juego compilado en `pattha_game/`. No se publica el repositorio completo ni los dibujos originales. La raíz no tiene portada; `404.html` evita que Pages sirva el juego para cualquier ruta inexistente. `/pattha_game` redirige a `/pattha_game/`, necesaria para las rutas relativas de imágenes y datos.

## Cloudflare Pages con GitHub

- Repositorio: `fueradeciclo/juego-dante`, privado.
- Rama de producción: `main`.
- Framework: ninguno.
- Comando de build: `pnpm build:site`.
- Directorio de salida: `builds/site`.
- Variables: `NODE_VERSION=24`, `PNPM_VERSION=11.25.0`.
- Autorizar acceso solo a este repositorio al conectar GitHub.
- Asociar `sabad.com.ar` como dominio personalizado. Para el dominio raíz, Cloudflare requiere sus servidores DNS; se delegan desde NIC Argentina usando los valores exactos de la cuenta, sin inventarlos.

Los cambios publicados en `main` generan nuevas versiones; las ramas de trabajo permiten seguir iterando y revisar previews antes de integrar. El repositorio sigue siendo privado, aunque los archivos del juego desplegado serán accesibles en internet.

La estructura inicial admite agregar una portada y otros proyectos al sitio. Si se quieren mantener en repositorios separados, hará falta definir una composición del sitio o enrutamiento por ruta: DNS por sí solo no separa `/pattha_game/` del resto del dominio.

## Verificación pendiente en internet

Comprobar HTTPS, la redirección de `/pattha_game`, carga de personajes/datos, inicio del juego, galería, controles y música. Verificar que la raíz no muestre el juego y que no se suban fuentes privadas. Hasta confirmar un despliegue exitoso, no considerar publicada la URL.

Referencias oficiales:
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/platform/limits/
