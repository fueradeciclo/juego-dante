import Phaser from 'phaser';
import { chooseSymbol, helpOtto, type Progress } from './rules.ts';
import { AntennaDial } from './mechanism-state.ts';
import type { AllyFollower } from './companion-state.ts';
import type { Chapter, Interaction } from './campaign.ts';
import type { DemoUI } from './ui.ts';
import type { WorldArt } from './world-art.ts';

/** What a chapter mechanic may use from the scene. Keeps chapter rules out of the generic platformer. */
export interface MechanicHost {
 readonly art:WorldArt;
 readonly level:Chapter;
 readonly progress:Progress;
 readonly ui:DemoUI;
 persist():void;
 addSolid(x:number,top:number,width:number,height:number):void;
 ally(index:number):{image:Phaser.GameObjects.Image;follower:AllyFollower};
}
export interface ChapterMechanic {
 /** Pieces painted once when the chapter starts. */
 paint():void;
 /** Sync props and the status lights with progress. */
 refresh():void;
 interact(point:Interaction):void;
 /** Runs while playing; returns true when it opened a dialogue. */
 update(delta:number,playerX:number):boolean;
 /** Moves an ally itself (for example Otto entering a hatch); false lets the normal follower run. */
 drivesAlly(index:number):boolean;
 /** The exit is open once the chapter goal is reached. */
 done():boolean;
 hint():string;
 snapshot():Record<string,unknown>;
}

abstract class BaseMechanic implements ChapterMechanic {
 protected props:Record<string,Phaser.GameObjects.Image>={};
 protected lights!:Phaser.GameObjects.Graphics;
 constructor(protected host:MechanicHost,protected scene:Phaser.Scene){}
 protected get floor(){return this.host.level.mundo.piso;}
 protected abstract signalX():number;
 protected abstract states():boolean[];
 paint(){
  this.props.signal=this.host.art.piece('common.signal-off',this.signalX()-60,this.floor-130,68,90,2);
  this.lights=this.scene.add.graphics().setDepth(2);
 }
 refresh(){
  this.host.art.state(this.props.signal,'common.signal-'+(this.done()?'on':'off'));
  this.lights.clear();
  this.states().forEach((on,i)=>this.lights.fillStyle(on?0xffc766:0x294562).fillCircle(this.signalX()+i*25,430,7));
 }
 update(_delta:number,_x:number){return false;}
 drivesAlly(_index:number){return false;}
 hint(){return '';}
 snapshot():Record<string,unknown>{return {};}
 abstract interact(point:Interaction):void;
 abstract done():boolean;
}

/** Sendero: Pattha finds the nut, Otto tightens it, Rural's shape sequence opens the bridge. */
export class BridgeMechanic extends BaseMechanic {
 private built=false;
 private get bridge(){return this.host.level.puente!;}
 protected signalX(){return this.bridge.panel;}
 protected states(){const p=this.host.progress;return [p.gear,p.otto,p.rural];}
 paint(){
  const {x,ancho,panel}=this.bridge,art=this.host.art;
  this.props.bridge=art.piece('common.bridge-0',x,this.floor,ancho,30,1).setOrigin(.5,0);
  this.props.panel=art.piece('common.panel-off',panel+40,this.floor,132,115,1);
  art.piece('common.lock',x+ancho/2+45,this.floor-55,38,48,2);
  super.paint();
  if(this.host.progress.bridge)this.build(false);
 }
 refresh(){
  const p=this.host.progress,{x,ancho}=this.bridge;
  this.host.art.state(this.props.bridge,'common.bridge-'+(p.bridge?4:0));
  this.props.bridge.setPosition(p.bridge?x:x+ancho/2,this.floor).setDisplaySize(p.bridge?ancho:38,p.bridge?30:190);
  this.host.art.state(this.props.panel,'common.panel-'+(p.rural?'on':'off'));
  super.refresh();
 }
 private build(announce:boolean){
  if(this.built)return;this.built=true;
  this.host.addSolid(this.bridge.x,this.floor,this.bridge.ancho,30);this.refresh();
  if(announce){this.host.ui.sfx.play('success');this.host.ui.toast('¡Los tres lo hicieron! El puente está listo.');}
 }
 interact(point:Interaction){
  const {progress:p,ui,level}=this.host;
  if(point.kind==='otto'){
   if(p.otto){ui.toast('Otto ya ajustó su lado. ¡Buscá la señal de Rural!');return;}
   if(!helpOtto(p)){ui.dialogue(level.dialogos.otto_sin_tuerca);return;}
   ui.sfx.play('gear');this.refresh();this.host.persist();ui.dialogue(level.dialogos.otto);
   return;
  }
  if(!p.otto){ui.dialogue(level.dialogos.rural_sin_otto);return;}
  if(p.rural){ui.toast('La señal ya está encendida. ¡A cruzar!');return;}
  ui.openPuzzle(symbol=>{
   const result=chooseSymbol(p,symbol);
   ui.sfx.play(result==='retry'?'retry':'rotate');
   ui.puzzleFeedback(result==='retry'?'Casi. Mirá la pista y probá otra vez.':result==='complete'?'¡Esa es la señal!':'¡Bien! Seguí con la próxima forma.',p.symbols);
   this.host.persist();
   if(result==='complete'){this.build(true);ui.dialogue(level.dialogos.puente_listo);}
  },level.acertijo);
 }
 update(_delta:number,playerX:number){
  const p=this.host.progress;
  if(!p.bridge||p.clue||playerX<=this.bridge.x+this.bridge.ancho/2)return false;
  p.clue=true;this.host.persist();this.host.ui.dialogue(this.host.level.dialogos.marca);
  return true;
 }
 done(){return this.host.progress.bridge;}
}

/** Phases of Otto's visible help, as fractions of OTTO_HELP_MS. */
export const OTTO_HELP_MS=2600;
export function ottoHelpPhase(remaining:number){
 const t=1-remaining/OTTO_HELP_MS;
 if(t<.3)return {phase:'walk' as const,t:t/.3};
 if(t<.42)return {phase:'enter' as const,t:(t-.3)/.12};
 if(t<.8)return {phase:'inside' as const,t:(t-.42)/.38};
 return {phase:'exit' as const,t:Math.min(1,(t-.8)/.2)};
}

/** Bosque: Otto slips through the hatch to turn on the switch; Rural turns the antenna dial towards the star. */
export class AntennaMechanic extends BaseMechanic {
 private helping=0;
 private sparks?:Phaser.GameObjects.Graphics;
 private lastTick=0;
 private get antenna(){return this.host.level.antena!;}
 private get hatch(){return this.host.level.interacciones.find(i=>i.kind==='otto')!;}
 protected signalX(){return this.antenna.x-25;}
 protected states(){const p=this.host.progress;return [p.switch,p.antenna];}
 paint(){
  const art=this.host.art,x=this.antenna.x;
  this.props.antenna=art.piece('common.antenna-off',x,this.floor,285,285,1);
  this.props.service=art.piece('common.service-off',this.hatch.x,this.floor,126,85,1);
  this.props.switch=art.piece('common.switch-off',this.hatch.x+60,this.floor-70,50,60,2);
  this.scene.add.text(x,this.floor-235,'●   ★   ▲',{fontFamily:'system-ui',fontSize:'24px',color:'#fff3ce',backgroundColor:'#152e4b',padding:{x:10,y:5}}).setOrigin(.5).setDepth(3);
  this.sparks=this.scene.add.graphics().setDepth(3);
  super.paint();
 }
 refresh(){
  const p=this.host.progress,art=this.host.art;
  art.state(this.props.switch,'common.switch-'+(p.switch?'on':'off'));
  art.state(this.props.service,'common.service-'+(p.switch?'on':'off'));
  art.state(this.props.antenna,'common.antenna-'+(p.antenna?this.antenna.orientacion:'off'));
  super.refresh();
 }
 interact(point:Interaction){
  const {progress:p,ui,level}=this.host;
  if(point.kind==='otto'){
   if(p.switch){ui.toast('¡Otto ya encendió el interruptor!');return;}
   if(this.helping)return;
   this.helping=OTTO_HELP_MS;ui.dialogue([level.dialogos.otto[0]],()=>ui.hint('Otto está entrando al acceso…'));
   return;
  }
  if(!p.switch){ui.dialogue(level.dialogos.rural_sin_otto);return;}
  if(p.antenna){ui.toast('¡La antena recibe la señal! Seguí al banderín.');return;}
  ui.openDial(new AntennaDial(this.antenna.orientacion),()=>{
   p.antenna=true;this.refresh();this.host.persist();ui.sfx.play('success');ui.dialogue(level.dialogos.antena_lista);
  },level.acertijo);
 }
 drivesAlly(index:number){return index===0&&this.helping>0;}
 update(delta:number){
  if(!this.helping)return false;
  const {image,follower}=this.host.ally(0),floor=this.floor;
  this.helping=Math.max(0,this.helping-delta);
  const {phase,t}=ottoHelpPhase(this.helping);
  const target={x:this.hatch.x-(phase==='walk'?40:0),y:floor};
  const move=follower.step(delta,target);
  image.setPosition(phase==='walk'?move.x:this.hatch.x,floor);
  // Otto ducks into the hatch, the switch blinks while he works, then he pops back out.
  const visible=phase==='walk'?1:phase==='enter'?1-t:phase==='inside'?0:t;
  image.setDisplaySize(61,82*(phase==='enter'?1-t*.5:phase==='exit'?.5+t*.5:1)).setAlpha(visible);
  if(phase==='walk'&&Math.abs(move.vx)>20)image.setFlipX(move.vx>0);
  this.sparks?.clear();
  if(phase==='inside'){
   const sx=this.hatch.x+60,sy=floor-100;
   for(let i=0;i<5;i++){const a=t*9+i*1.26;this.sparks?.fillStyle(0xffd46b,.75).fillCircle(sx+Math.cos(a)*(14+t*10),sy+Math.sin(a)*(10+t*8),3);}
   if(this.scene.time.now-this.lastTick>320){this.lastTick=this.scene.time.now;this.host.ui.sfx.play('rotate');}
  }
  if(phase==='exit'&&!this.host.progress.switch){this.host.progress.switch=true;this.refresh();this.host.persist();this.host.ui.sfx.play('gear');}
  if(this.helping===0){
   image.setAlpha(1).setDisplaySize(61,82);follower.reset({x:image.x,y:floor});
   this.host.ui.dialogue([this.host.level.dialogos.otto[1]]);
   return true;
  }
  return false;
 }
 done(){return this.host.progress.antenna;}
 hint(){return this.helping>0?'Otto está entrando al acceso…':'';}
 snapshot(){return {ottoHelping:this.helping};}
}

export function createMechanic(host:MechanicHost,scene:Phaser.Scene):ChapterMechanic {
 if(host.level.puente)return new BridgeMechanic(host,scene);
 if(host.level.antena)return new AntennaMechanic(host,scene);
 throw Error('Capítulo sin mecanismo: '+host.level.id);
}
