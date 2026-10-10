# Publicación en sabad.com.ar

Decisión del adulto, 2026-10-10: `/pattha_game/` se reserva para el juego; la portada queda para otros proyectos. Cloudflare es el destino solicitado.

## Estado verificado · 2026-10-10

- Proyecto Pages `juego-dante`, plan gratuito, integrado con GitHub y despliegues automáticos desde `main`.
- Primera publicación exitosa: commit `97a83364359fdb7fc8ccd2e594b616144ae5148c`, despliegue `9705e7b3-fc5e-42f6-a8d6-d39355d22beb`.
- Juego público: https://juego-dante.pages.dev/pattha_game/ . Verificados carga de personajes, inicio y diálogo; sin errores de consola observados. La URL sin barra final redirige correctamente. Galería disponible. La raíz devuelve la página 404, sin mostrar el juego.
- NIC Argentina: delegación aplicada con confirmación explícita del adulto; estado «Delegado: SI». Servidores: `rick.ns.cloudflare.com` y `rita.ns.cloudflare.com`.
- Cloudflare: zona `sabad.com.ar` creada en Free y registro CNAME raíz a `juego-dante.pages.dev`, proxied, TTL Auto. Pendiente propagación y activación de zona.
- Falta asociar el dominio personalizado en Pages una vez activa la zona, y probar HTTPS en https://sabad.com.ar/pattha_game/ . El CNAME por sí solo no completa la asociación.
- `pnpm-workspace.yaml` declara `allowBuilds.esbuild: false`, para que pnpm 11 acepte instalar sin ejecutar ese script. La compilación local y en Cloudflare pasó con esta política.

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

## Dominio conectado · 2026-10-10

NIC publicó ambos servidores y Cloudflare activó la zona. Se asoció `sabad.com.ar` al proyecto Pages `juego-dante` y se confirmó el CNAME existente. Verificación: `https://sabad.com.ar/pattha_game/` carga por HTTPS, inicia la partida y muestra el diálogo de Rural; sin errores de consola observados. La portada permanece reservada. Revisión cada dos horas detenida al completar el objetivo.

## Actualización de producción · 2026-10-10

Versión fija aprobada de amigos, avionetas y música: commit `c6a1561e54f9540a8535a83b217da27d2b5754de`, despliegue Pages `cef7326f-70c1-4ef2-96e1-6efae4e11db8` exitoso. Copia aislada: 26 pruebas y build pasaron. Dominio sirve `juego-DHOS-0nK.js`; música responde HTTP 200. Los cambios simultáneos de gateo y puntuación quedan fuera de esta publicación por decisión del adulto.
