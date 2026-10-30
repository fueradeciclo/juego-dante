import type { Line } from './ui.ts';
import type { FriendChats } from './companion-state.ts';
import { createProgress, scoreLevel, type Progress, type ScoreRules } from './rules.ts';

/** Chapter ids come from data/campana.json; adding a chapter does not require new code paths. */
export type ChapterId = string;
export type CampaignDefinition={version:1;titulo:string;capitulos:{id:ChapterId;ruta:string}[]};
export type Interaction = { kind:'otto'|'rural'; min:number; max:number; x:number };
export type Chapter = {
 id:ChapterId; titulo:string; escenario:string; aparicion:number; duracion_objetivo_min?:number[];
 personajes:Record<string,string>; mundo:{ancho:number;alto:number;piso:number};
 suelo:number[][]; plataformas:number[][]; pasajes_bajos?:number[][]; monedas:number[][]; puntaje:ScoreRules;
 enemigos:{tipo:'gato'|'perro';x:number;min:number;max:number;velocidad:number;comportamiento?:'corredor'}[];
 puestos_control:number[]; dialogos:Record<string,Line[]>; charlas_amigos:FriendChats;
 interacciones:Interaction[]; carteles:{x:number;texto:string}[];
 zonas:{hasta:number;nombre:string}[]; objetivos:{requisito:'gear'|'otto'|'rural'|'bridge'|'switch'|'antenna'|'exit';texto:string}[];
 tuerca?:{x:number;y:number}; puente?:{x:number;ancho:number;panel:number};
 antena?:{x:number;orientacion:0|1|2}; salida:number; siguiente?:ChapterId;
 acertijo:{tipo:'secuencia'|'orientacion';pista:string;voz_id?:string};
 victoria:{titulo:string;descripcion:string;boton_siguiente?:string};
};
export type ChapterSave = { checkpoint:number; gear:boolean;otto:boolean;rural:boolean;bridge:boolean;switch:boolean;antenna:boolean;clue:boolean;symbols:number[];coins:number[];enemies:number[];completed:boolean };
export type CampaignSave = { version:1; chapter:ChapterId; chapters:Partial<Record<ChapterId,ChapterSave>> };
export const SAVE_KEY='pattha-aventura-v1';
export function freshCampaign():CampaignSave { return {version:1,chapter:'sendero',chapters:{}}; }
export function restoreProgress(saved?:ChapterSave):Progress {
 const p=createProgress();if(!saved)return p;
 return {...p,gear:saved.gear,otto:saved.otto,rural:saved.rural,bridge:saved.bridge,switch:saved.switch,antenna:saved.antenna,clue:saved.clue,symbols:saved.symbols as Progress['symbols'],coins:new Set(saved.coins),enemyIds:new Set(saved.enemies),defeated:saved.enemies.length};
}
export function captureProgress(p:Progress,checkpoint:number,completed:boolean):ChapterSave {
 return {checkpoint,gear:p.gear,otto:p.otto,rural:p.rural,bridge:p.bridge,switch:p.switch,antenna:p.antenna,clue:p.clue,symbols:[...p.symbols],coins:[...p.coins],enemies:[...p.enemyIds],completed};
}
export function decodeSave(raw:string,levels:Chapter[]):CampaignSave {
 const s=JSON.parse(raw) as CampaignSave;
 if(!s||s.version!==1||!levels.some(l=>l.id===s.chapter)||!s.chapters||typeof s.chapters!=='object'||Array.isArray(s.chapters))throw Error('Guardado incompatible');
 for(const [id,v] of Object.entries(s.chapters)) {
  const level=levels.find(l=>l.id===id);
  if(!level||!v||!Number.isFinite(v.checkpoint)||![level.aparicion,...level.puestos_control].includes(v.checkpoint))throw Error('Banderín inválido');
  for(const k of ['gear','otto','rural','bridge','switch','antenna','clue','completed'] as const)if(typeof v[k]!=='boolean')throw Error('Estado inválido');
  const validIds=(values:unknown,max:number)=>Array.isArray(values)&&values.every(i=>Number.isInteger(i)&&i>=0&&i<max)&&new Set(values).size===values.length;
  if(!validIds(v.coins,level.monedas.length)||!validIds(v.enemies,level.enemigos.length)||!Array.isArray(v.symbols)||v.symbols.length>3||!v.symbols.every(i=>[0,1,2].includes(i)))throw Error('Colección inválida');
  if(level.puente&&(v.switch||v.antenna||v.otto&&!v.gear||v.rural&&!v.otto||v.bridge!==v.rural||v.completed&&!v.bridge))throw Error('Puente inválido');
  if(level.antena&&(v.gear||v.otto||v.rural||v.bridge||v.antenna&&!v.switch||v.completed&&!v.antenna))throw Error('Antena inválida');
 }
 // A chapter is only reachable after finishing the one before it in campaign order.
 const index=levels.findIndex(l=>l.id===s.chapter);
 if(index>0&&!s.chapters[levels[index-1].id]?.completed)throw Error('Capítulo bloqueado');
 return s;
}
export function campaignScore(save:CampaignSave,levels:Chapter[]):number {
 return levels.reduce((total,l)=>{const p=save.chapters[l.id];if(!p?.completed)return total;return total+scoreLevel(new Set(p.coins),l.monedas.length,l.puntaje).total;},0);
}
export interface SaveStorage { getItem(key:string):string|null; setItem(key:string,value:string):void }
export class CampaignStore {
 state=freshCampaign(); status:'ok'|'invalid'|'unavailable'='ok';
 private levels:Chapter[];private storage:()=>SaveStorage;
 constructor(levels:Chapter[],storage:()=>SaveStorage=()=>localStorage) { this.levels=levels;this.storage=storage;this.read(); }
 read(){
  let raw:string|null;
  try{raw=this.storage().getItem(SAVE_KEY);}catch{this.status='unavailable';return;}
  try{this.state=raw?decodeSave(raw,this.levels):freshCampaign();this.status='ok';}
  catch{this.state=freshCampaign();this.status='invalid';}
 }
 write(){try{this.storage().setItem(SAVE_KEY,JSON.stringify(this.state));this.status='ok';}catch{this.status='unavailable';}}
 reset(){this.state=freshCampaign();this.write();}
 hasProgress(){return Boolean(this.state.chapters[this.state.chapter]);}
}
