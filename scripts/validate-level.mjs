import { readFile } from 'node:fs/promises';
import { validateLevelLayout } from '../game/src/level-layout.ts';
const campaign=JSON.parse(await readFile('data/campana.json','utf8'));
for(const path of ['data/demo_plataformas.json',...campaign.capitulos.map(c=>c.ruta)]){
 const level=JSON.parse(await readFile(path,'utf8'));
 const errors=validateLevelLayout(level);
 if(errors.length)throw Error(path+'\n'+errors.join('\n'));
 if(!Number.isInteger(level.puntaje?.puntos_por_esfera)||level.puntaje.puntos_por_esfera<0||!Number.isInteger(level.puntaje?.bonus_todas)||level.puntaje.bonus_todas<=0)throw Error('Puntaje inválido: '+path);
 if(level.id){
  if(!level.suelo.some(([left,right])=>level.aparicion>=left+55&&level.aparicion<=right-55))throw Error('Aparición insegura: '+path);
  for(const i of level.interacciones)if(i.min>=i.max||i.x<i.min||i.x>i.max||!level.suelo.some(([left,right])=>i.min>=left&&i.max<=right))throw Error('Interacción inaccesible: '+path);
  for(const e of level.enemigos)if(e.min>=e.max||e.x<e.min||e.x>e.max||!level.suelo.some(([left,right])=>e.min>=left&&e.max<=right))throw Error('Patrulla insegura: '+path);
 }
 console.log(path+': '+level.monedas.length+' esferas, '+level.puestos_control.length+' banderines.');
}
