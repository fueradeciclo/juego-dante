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
 'assets/personajes/transparentes/pattha_concepto_B_transparente.png',
 'assets/personajes/transparentes/raton_verde_concepto_transparente.png',
 'assets/personajes/transparentes/rural_concepto_transparente.png',
 'assets/enemigos/gato-v1.png',
 'assets/enemigos/perro-v1.png',
 'data/demo_plataformas.json',
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
