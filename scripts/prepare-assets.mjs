import { mkdir, copyFile, readFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';

const manifest = JSON.parse(await readFile('assets/MANIFEST.json', 'utf8'));
for (const entry of manifest.imagenes) {
  const bytes = await readFile(entry.ruta);
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== entry.sha256) throw new Error('El original cambió: ' + entry.ruta);
}
const generated = JSON.parse(await readFile('assets/enemigos/MANIFEST.json', 'utf8'));
for(const entry of generated.imagenes){const bytes=await readFile(entry.ruta);if(createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw new Error('El animal cambió: '+entry.ruta);}
const assets = [
 'assets/audio/pattha-main-theme-v1.mp3',
 'assets/audio/triumph-in-steel.mp3',
 'assets/personajes/transparentes/pattha_concepto_B_transparente.png',
 'assets/personajes/transparentes/raton_verde_concepto_transparente.png',
 'assets/personajes/transparentes/rural_concepto_transparente.png',
 'assets/enemigos/gato-v1.png',
 'assets/enemigos/perro-v1.png',
 'data/demo_plataformas.json',
 'data/campana.json',
 'data/capitulo_sendero.json',
 'data/capitulo_bosque.json',
];
const pattha=JSON.parse(await readFile('assets/animaciones/pattha/MANIFEST.json','utf8'));
for(const entry of pattha.proceso??[])await rm('game/public/'+entry.ruta,{force:true});
for(const entry of pattha.imagenes) {
 const bytes=await readFile(entry.ruta);
 if(createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw new Error('Cambió una plancha de Pattha: '+entry.ruta);
 assets.push(entry.ruta);
}
for (const asset of assets) {
  const target = 'game/public/' + asset;
  await mkdir(dirname(target), { recursive: true });
  await copyFile(asset, target);
}
console.log('Originales verificados. Assets y datos preparados sin modificar imágenes.');

for(const source of ['docs/licencias/phaser-LICENSE.md','docs/licencias/vite-LICENSE.md']){const target='game/public/legal/'+source.split('/').at(-1);await mkdir(dirname(target),{recursive:true});await copyFile(source,target);}

const narration=JSON.parse(await readFile('assets/audio/narracion/MANIFEST.json','utf8'));
for(const [id,path] of Object.entries(narration.disponibles)) {
 const line=narration.grabaciones.find(line=>line.id===id);
 if(!line||path!==line.archivo)throw Error('Grabación fuera del manifiesto: '+id);
 const target='game/public/'+path;await mkdir(dirname(target),{recursive:true});await copyFile(path,target);
}

// The isolated tileset lab consumes only exported pages and derived characters, never source sheets.
let tilesets;
try { tilesets=JSON.parse(await readFile('assets/escenarios/tilesets/MANIFEST.json','utf8')); }
catch(error) { if(error.code!=='ENOENT')throw error; }
if(tilesets){
 const files=['assets/escenarios/tilesets/MANIFEST.json',...tilesets.pages.map(p=>p.path),...tilesets.characters.flatMap(c=>[c.path,...(c.portrait?[c.portrait]:[])])];
 for(const page of tilesets.pages){const bytes=await readFile(page.path);if(createHash('sha256').update(bytes).digest('hex')!==page.sha256)throw Error('Atlas modificado: '+page.path);}
 for(const source of files){const target='game/public/'+source;await mkdir(dirname(target),{recursive:true});await copyFile(source,target);}
 console.log('Atlas exportados y personajes derivados preparados para el juego y el taller aislado.');
}
