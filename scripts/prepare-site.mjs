import { cp, mkdir, readdir, rm, stat, writeFile, readFile } from 'node:fs/promises';

// Only the compiled game is published; source drawings and project docs stay private.
const output = new URL('../builds/site/', import.meta.url);
const game = new URL('../builds/web/', import.meta.url);
await stat(new URL('index.html', game));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(game, new URL('pattha_game/', output), { recursive: true });
const campaign=JSON.parse(await readFile(new URL('../data/campana.json',import.meta.url),'utf8'));
const available=new Set(campaign.capitulos.map(c=>c.id));
// Exclude unused future environments and the isolated lab's full manifest from production.
for(const id of ['sendero','bosque','tuneles','fabrica','patios','faro'])if(!available.has(id))await rm(new URL('pattha_game/assets/escenarios/tilesets/'+id+'/',output),{recursive:true,force:true});
if(!available.has('faro'))await rm(new URL('pattha_game/assets/animaciones/don-candado/',output),{recursive:true,force:true});
await rm(new URL('pattha_game/assets/escenarios/tilesets/MANIFEST.json',output),{force:true});
const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
await writeFile(new URL('pattha_game/version.json',output),JSON.stringify({version:pkg.version,chapters:[...available],visual:'azul-ambar-tilesets',friends:'otto-hueso-rural-gris'},null,2)+'\n');
await writeFile(new URL('_headers',output),'/pattha_game/\n  Cache-Control: no-cache\n/pattha_game/index.html\n  Cache-Control: no-cache\n/pattha_game/animaciones.html\n  Cache-Control: no-cache\n/pattha_game/version.json\n  Cache-Control: no-store\n');
await writeFile(new URL('_redirects', output), '/pattha_game /pattha_game/ 301\n');
// A top-level 404 prevents Pages from treating the whole domain as a SPA.
await writeFile(new URL('404.html', output), '<!doctype html><html lang="es-AR"><meta charset="utf-8"><title>Página no encontrada</title><h1>Página no encontrada</h1><p>Esta dirección todavía no tiene una página.</p></html>\n');
let count = 0;
async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) await check(path);
    else {
      count++;
      if ((await stat(path)).size > 25 * 1024 * 1024) throw new Error(`Archivo demasiado grande para Pages: ${path.pathname}`);
    }
  }
}
await check(output);
if (count > 20000) throw new Error('Demasiados archivos para el plan gratuito de Pages.');
console.log(`Sitio preparado: builds/site/pattha_game/ (${count} archivos). Portada reservada, sin index.html en la raíz.`);
