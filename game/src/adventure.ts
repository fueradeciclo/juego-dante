import Phaser from 'phaser';
import { canJump, canStomp, chooseSymbol, collectCoin, createProgress, helpOtto, scoreLevel, type Progress } from './rules.ts';
import { CHECKPOINT_REACH, validateLevelLayout } from './level-layout.ts';
import type { Controls } from './input.ts';
import type { DemoUI, Line } from './ui.ts';
import { CharacterRig } from './character-rig.ts';
import type { CharacterKind } from './character-art.ts';
import { PatthaAnimator } from './pattha-animator.ts';
import { patthaAtlas } from './pattha-art.ts';
import { JumpPreparation } from './pattha-state.ts';
import { JumpDust } from './jump-dust.ts';
import { AllyFollower, allyTarget, FriendConversation, RivalPatrol, type FriendChats } from './companion-state.ts';
import { AmbientSky } from './ambient-sky.ts';
import { CrawlPosture, hasHeadroom } from './crawl-state.ts';
import { CampaignStore, captureProgress, restoreProgress, campaignScore, type Chapter, type ChapterId, type CampaignDefinition } from './campaign.ts';
import { RunnerState } from './runner-state.ts';
import campaign from '../../data/campana.json';
import {WorldArt,loadWorldArt} from './world-art.ts';

type Enemy = Phaser.Physics.Arcade.Sprite;
export class Adventure extends Phaser.Scene {
 progress: Progress=createProgress();
 player!: Phaser.Physics.Arcade.Sprite;
 private level!: Chapter;
 private store!:CampaignStore;
 private saveSignature='';
 private storageWarned=false;
 private ottoHelping=0;
 private readonly chapterIds=(campaign as CampaignDefinition).capitulos.map(c=>c.id as ChapterId);
 private solids!: Phaser.Physics.Arcade.StaticGroup;
 private rivals!: Phaser.Physics.Arcade.Group;
 private allies:Phaser.GameObjects.Image[]=[];
 private followers:AllyFollower[]=[];
 private followDirection=1;
 private allyLabels:Phaser.GameObjects.Text[]=[];
 private friendConversation=new FriendConversation();
 private friendBubble!:Phaser.GameObjects.Text;
 private friendPanel!:Phaser.GameObjects.Graphics;
 private ambient!:AmbientSky;
 private trail:{x:number;y:number;time:number}[]=[];
 private checkpoint={x:130,y:540};
 private flags:{x:number;view:Phaser.GameObjects.Image;active:boolean}[]=[];
 private health=3;
 private groundedAt=-Infinity;
 private jumpUntil=-Infinity;
 private hurtUntil=0;
 private lastSample=0;
 private ended=false;
 private bridgeBuilt=false;
 private panels!: Phaser.GameObjects.Graphics;
 private visuals:CharacterRig[]=[];
 private pattha!:PatthaAnimator;
 private dust!:JumpDust;
 private preparation=new JumpPreparation();
 private posture=new CrawlPosture();
 private standingHeight=132*.78;
 private takeoffMs=0;
 private reboundMs=0;
 private helpMs=0;
 private reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  private originalLoadFailed=false;
 private art!:WorldArt;
 private artChapter:ChapterId='sendero';
 private artProps:Record<string,Phaser.GameObjects.Image>={};
 init(data:{chapter?:ChapterId}={}){this.artChapter=data.chapter??this.store?.state.chapter??'sendero';if(!data.chapter&&!this.store){try{const saved=JSON.parse(localStorage.getItem('pattha-aventura-v1')??'null');if(this.chapterIds.includes(saved?.chapter))this.artChapter=saved.chapter;}catch{}}}
 constructor(private ui: DemoUI, private controls: Controls) { super('adventure'); }
 preload() {
  loadWorldArt(this,this.artChapter);
  if(this.cache.json.exists('sendero'))return;
  for(const c of (campaign as CampaignDefinition).capitulos)this.load.json(c.id,'./'+c.ruta);
  const paths={pattha:'personajes/transparentes/pattha_concepto_B_transparente.png',otto:'personajes/derivados/otto-v1.png',rural:'personajes/derivados/rural-v1.png',gato:'enemigos/gato-v1.png',perro:'enemigos/perro-v1.png'};
  for(const [key,path]of Object.entries(paths))this.load.image(key,'./assets/'+path);
  for(const [key,sheet]of Object.entries(patthaAtlas.sheets))this.load.image('pattha-'+key,'./'+sheet.path);
  this.load.on('progress',(p:number)=>this.ui.loading(p));
  this.load.on('loaderror',()=>{this.originalLoadFailed=true;this.ui.loadError();});
 }
 create(data:{autostart?:boolean;resume?:boolean;chapter?:ChapterId}={}) {
  if(this.originalLoadFailed)return;
  const chapters=this.chapterIds.map(id=>this.cache.json.get(id) as Chapter);
  if(!this.store)this.store=new CampaignStore(chapters);
  this.level=chapters.find(c=>c.id===(data.chapter??this.store.state.chapter))!;
  const saved=this.store.state.chapters[this.level.id];
  if(!this.level || ['pattha','otto','rural','gato','perro',...Object.keys(patthaAtlas.sheets).map(s=>'pattha-'+s)].some(k=>!this.textures.exists(k))){this.ui.loadError();return;}
  const layoutErrors=validateLevelLayout(this.level);
  if(layoutErrors.length){console.error('Distribución del nivel inválida:',layoutErrors);this.ui.loadError();return;}
  this.ui.configureLevel(this.level.monedas.length,this.level.puntaje);
  this.progress=restoreProgress(saved);this.ottoHelping=0;this.saveSignature='';this.health=3;this.ended=false;this.bridgeBuilt=false;this.flags=[];this.allies=[];this.allyLabels=[];this.trail=[];this.visuals=[];this.hurtUntil=0;this.groundedAt=-Infinity;this.jumpUntil=-Infinity;this.lastSample=0;this.checkpoint={x:saved?.checkpoint??this.level.aparicion,y:this.level.mundo.piso};
  this.preparation.cancel();this.posture.reset();this.takeoffMs=0;this.reboundMs=0;this.helpMs=0;
  this.friendConversation=new FriendConversation();
  this.followers=[];this.followDirection=1;
  this.friendPanel=this.add.graphics().setDepth(8);
  this.friendBubble=this.add.text(0,0,'',{fontFamily:'system-ui',fontSize:'15px',color:'#355548',padding:{x:8,y:6},wordWrap:{width:230}}).setOrigin(.5,1).setDepth(9).setVisible(false);
  this.physics.world.setBounds(0,-100,this.level.mundo.ancho,1000);
  this.art=new WorldArt(this,this.level.escenario);this.artProps={};
  this.paintBackground();
  this.ambient=new AmbientSky(this);
  this.solids=this.physics.add.staticGroup();
  for(const [left,right]of this.level.suelo)this.platform((left+right)/2,this.level.mundo.piso,right-left,210);
  for(const [x,top,width]of this.level.plataformas)this.platform(x,top,width,26);
  for(const [x,top,width,height]of this.level.pasajes_bajos??[])this.lowPassage(x,top,width,height);
  this.paintProps();
  this.makeTokens();
  this.player=this.physics.add.sprite(this.checkpoint.x,this.level.mundo.piso,'pattha').setOrigin(.5,1).setDepth(5);
  this.player.setDisplaySize(104,132);
  const raw=this.textures.get('pattha').getSourceImage() as HTMLImageElement;
  this.player.body!.setSize(raw.width*.44,raw.height*.78);
  this.player.body!.setOffset(raw.width*.28,raw.height*.22);
  this.player.setMaxVelocity(340,950).setCollideWorldBounds(false);
  this.physics.add.collider(this.player,this.solids);
  this.pattha=new PatthaAnimator(this,this.player);this.dust=new JumpDust(this);
  for(const [i,key]of ['otto','rural'].entries()){
   const start=allyTarget(this.player,1,i,this.level.mundo.ancho);
   const ally=this.add.image(start.x,start.y,key).setOrigin(.5,1).setDisplaySize(61,82).setDepth(4);
   this.allies.push(ally);
   this.followers.push(new AllyFollower(start.x,start.y));
   this.visuals.push(new CharacterRig(this,ally,key as CharacterKind,i+1));
   this.allyLabels.push(this.add.text(ally.x,ally.y-95,key==='otto'?'Otto':'Rural',{fontFamily:'system-ui',fontSize:'12px',color:'#28513d',backgroundColor:'#f0f8df',padding:{x:8,y:4}}).setOrigin(.5).setDepth(7));
  }
  for(const [key,box]of Object.entries({gato:[25,159,985,1218],perro:[30,187,981,1190]})){const t=this.textures.get(key);if(!t.has('recorte'))t.add('recorte',0,...box as [number,number,number,number]);}
  this.makeEnemies();
  if(this.progress.bridge)this.buildBridge();
  this.events.once('shutdown',()=>{this.ui.stopVoice();this.controls.reset();this.ui.bind(undefined);if(import.meta.env.DEV)delete (window as unknown as {__PATTHA_TEST__?:unknown}).__PATTHA_TEST__;});
  this.cameras.main.setBounds(0,0,this.level.mundo.ancho,720);
  this.cameras.main.startFollow(this.player,true,.1,1,0,0);
  this.ui.bind({restart:autostart=>{
   if(autostart){if(this.store.hasProgress()&&!window.confirm('¿Empezar una nueva aventura? Se reemplaza el avance guardado.'))return;this.store.reset();}
   this.ui.setMode('menu');this.ui.hint('');this.scene.restart({autostart,chapter:autostart?'sendero':this.store.state.chapter});
  },continue:()=>{this.ui.setMode('menu');this.scene.restart({autostart:true,resume:true});},next:()=>{
   if(!this.level.siguiente)return;this.store.state.chapter=this.level.siguiente;this.store.state.chapters[this.level.siguiente]??=captureProgress(createProgress(),this.cache.json.get(this.level.siguiente).aparicion,false);this.store.write();
   this.ui.setMode('menu');this.scene.restart({autostart:true,chapter:this.level.siguiente});
  },setPaused:paused=>{if(paused)this.physics.world.pause();else this.physics.world.resume();},resetInput:()=>this.controls.reset()});
  this.ui.ready(this.store.hasProgress(),this.store.status);
  this.ui.setChapter(this.level.titulo);
  this.ui.setMode(data.autostart?'playing':'menu');
  if(data.autostart){this.persist();if(saved?.completed)this.showSummary();else if(!data.resume)this.ui.dialogue(this.level.dialogos.intro);}
  if(import.meta.env.DEV && new URLSearchParams(location.search).has('test')) {
   (window as unknown as {__PATTHA_TEST__:unknown}).__PATTHA_TEST__={
    snapshot:()=>({chapter:this.level.id,switch:this.progress.switch,antenna:this.progress.antenna,storage:this.store.status,ottoHelping:this.ottoHelping,x:this.player.x,y:this.player.y,vy:(this.player.body as Phaser.Physics.Arcade.Body).velocity.y,grounded:(this.player.body as Phaser.Physics.Arcade.Body).blocked.down,health:this.health,coins:this.progress.coins.size,collected:[...this.progress.coins],gear:this.progress.gear,otto:this.progress.otto,rural:this.progress.rural,bridge:this.progress.bridge,defeated:this.progress.defeated,enemies:this.rivals.getChildren().filter(e=>e.active).map(e=>{const r=e as Enemy;return {x:r.x,y:r.y,top:(r.body as Phaser.Physics.Arcade.Body).top,kind:r.getData('patrol').tipo,min:r.getData('patrol').min,max:r.getData('patrol').max,...(r.getData('behavior') as RivalPatrol).snapshot()};}),followers:this.followers.map(f=>f.snapshot()),ambient:this.ambient.snapshot(),conversation:this.friendConversation.snapshot(),friendBubble:this.friendBubble.visible,friendBubbleAlpha:this.friendBubble.alpha,animations:[this.pattha.snapshot(),...this.visuals.filter(v=>v.root.active).map(v=>v.snapshot())],dust:this.dust.snapshot(),checkpoint:this.checkpoint.x,mode:this.ui.mode,portrait:this.ui.portrait}),
    position:(x:number,y:number)=>{this.posture.reset();this.setLowBody(false);this.player.body!.reset(x,y);this.player.setVelocity(0,0);this.controls.reset();this.preparation.cancel();this.takeoffMs=0;this.reboundMs=0;this.cameras.main.centerOn(x,360);this.regroupAllies();},
    crawl:()=>({posture:this.posture.snapshot(),headroom:this.canStand(),body:{left:(this.player.body as Phaser.Physics.Arcade.Body).left,top:(this.player.body as Phaser.Physics.Arcade.Body).top,bottom:(this.player.body as Phaser.Physics.Arcade.Body).bottom,height:(this.player.body as Phaser.Physics.Arcade.Body).height},passages:this.level.pasajes_bajos}),
   };
  }
 }
 private paintBackground() { this.art.background(); }
 private platform(x:number,top:number,width:number,height:number) {
  const collision=this.add.rectangle(x,top+height/2,width,height,0x000000,0);
  this.solids.add(collision);
  if(height>=64)this.art.ground(x,top,width,height);else this.art.strip(x,top,width,height);

 }
 private lowPassage(x:number,top:number,width:number,height:number) {
  const collision=this.add.rectangle(x,top+height/2,width,height,0,0);this.solids.add(collision);
  this.art.strip(x,top,width,height,'roof');
  this.add.text(x,top-14,'↓ / S · Gateá',{fontFamily:'system-ui',fontSize:'14px',color:'#42644e',backgroundColor:'#edf5dc',padding:{x:9,y:5}}).setOrigin(.5,1).setDepth(3);
 }
 private canStand() {
  const b=this.player.body as Phaser.Physics.Arcade.Body;
  const standing={left:b.center.x-42,right:b.center.x+42,top:b.bottom-this.standingHeight,bottom:b.bottom};
  const solids=this.solids.getChildren().map(s=>s.body as Phaser.Physics.Arcade.StaticBody).filter(b=>b.enable);
  return hasHeadroom(standing,solids);
 }
 private setLowBody(low:boolean) {
  const b=this.player.body as Phaser.Physics.Arcade.Body,height=low?80:this.standingHeight;
  if(Math.abs(b.height-height)<.01)return;
  const raw=this.textures.get('pattha').getSourceImage() as HTMLImageElement,shift=b.height-height;
  b.setSize(raw.width*.44,height/this.player.scaleY,false);b.setOffset(raw.width*.28,raw.height-height/this.player.scaleY);
  // Resizing moves the top, never the feet or the physics displacement accumulated this frame.
  b.position.y+=shift;b.prev.y+=shift;b.prevFrame.y+=shift;b.updateCenter();
 }
 private paintProps() {
  const floor=this.level.mundo.piso;
  for(const [i,c]of this.level.carteles.entries()){
   this.art.piece('common.sign',c.x,floor,170,122,1);
   this.add.text(c.x,floor-82,c.texto,{fontFamily:'system-ui',fontSize:'13px',fontStyle:'bold',color:'#fff4d4',backgroundColor:'#142c49',padding:{x:10,y:7},wordWrap:{width:150},align:'center'}).setOrigin(.5).setDepth(3);
   const bx=c.x+110;if(!this.level.plataformas.some(([x,,w])=>Math.abs(x-bx)<w/2+75))this.art.piece(this.level.escenario+'.'+(i%2?'lamp':'bush'),bx,floor,85,86,-1);
  }
  if(this.level.puente){const {x,ancho,panel}=this.level.puente;this.artProps.bridge=this.art.piece('common.bridge-0',x,floor,ancho,30,1).setOrigin(.5,0);this.artProps.panel=this.art.piece('common.panel-off',panel+40,floor,132,115,1);this.art.piece('common.lock',x+ancho/2+45,floor-55,38,48,2);}
  if(this.level.antena){const x=this.level.antena.x;this.artProps.antenna=this.art.piece('common.antenna-off',x,floor,285,285,1);const otto=this.level.interacciones.find(i=>i.kind==='otto')!;this.artProps.service=this.art.piece('common.service-off',otto.x,floor,126,85,1);this.artProps.switch=this.art.piece('common.switch-off',otto.x+60,floor-70,50,60,2);this.add.text(x,floor-235,'●   ★   ▲',{fontFamily:'system-ui',fontSize:'24px',color:'#fff3ce',backgroundColor:'#152e4b',padding:{x:10,y:5}}).setOrigin(.5).setDepth(3);}
  const signal=this.level.antena?.x??this.level.puente!.panel;this.artProps.signal=this.art.piece('common.signal-off',signal-60,floor-130,68,90,2);
  this.panels=this.add.graphics().setDepth(2);this.paintBridgeStatus();
  for(const x of this.level.puestos_control){const active=x<=this.checkpoint.x;const view=this.art.piece(active?'common.checkpoint-on':'common.checkpoint-off',x,floor,60,90,2);this.flags.push({x,view,active});}
  this.art.piece('common.sign',this.level.salida+55,floor,145,145,1);this.add.text(this.level.salida+55,floor-105,this.level.siguiente?'SEGUIR →':'SEÑAL ★',{fontFamily:'system-ui',fontSize:'14px',color:'#fff0c3',backgroundColor:'#123253',padding:{x:10,y:6}}).setOrigin(.5).setDepth(3);
 }
 private paintBridgeStatus() {
  this.panels.clear();
  if(this.artProps.bridge){const {x,ancho}=this.level.puente!;this.art.state(this.artProps.bridge,'common.bridge-'+(this.progress.bridge?4:0));this.artProps.bridge.setPosition(this.progress.bridge?x:x+ancho/2,this.level.mundo.piso).setDisplaySize(this.progress.bridge?ancho:38,this.progress.bridge?30:190);}
  if(this.artProps.panel)this.art.state(this.artProps.panel,'common.panel-'+(this.progress.rural?'on':'off'));
  if(this.artProps.switch)this.art.state(this.artProps.switch,'common.switch-'+(this.progress.switch?'on':'off'));
  if(this.artProps.service)this.art.state(this.artProps.service,'common.service-'+(this.progress.switch?'on':'off'));
  if(this.artProps.antenna)this.art.state(this.artProps.antenna,'common.antenna-'+(this.progress.antenna?this.level.antena!.orientacion:'off'));
  this.art.state(this.artProps.signal,'common.signal-'+(this.progress.antenna||this.progress.bridge?'on':'off'));
  const panel=this.level.puente?.panel??this.level.antena!.x-25;
  const states=this.level.puente?[this.progress.gear,this.progress.otto,this.progress.rural]:[this.progress.switch,this.progress.antenna];
  states.forEach((on,i)=>this.panels.fillStyle(on?0xffc766:0x294562).fillCircle(panel+i*25,430,7));
 }
 private persist(){
  this.store.state.chapters[this.level.id]=captureProgress(this.progress,this.checkpoint.x,this.ended||Boolean(this.store.state.chapters[this.level.id]?.completed));
  const signature=JSON.stringify(this.store.state);if(signature===this.saveSignature)return;this.saveSignature=signature;this.store.write();
  if(this.store.status==='unavailable'&&!this.storageWarned){this.storageWarned=true;this.ui.toast('Este navegador no permite guardar. Tu avance queda en esta sesión.');}
 }
 private showSummary(){this.ended=true;this.player.setVelocity(0,0);this.ui.win(scoreLevel(this.progress.coins,this.level.monedas.length,this.level.puntaje),{next:Boolean(this.level.siguiente),title:this.level.siguiente?'¡Sendero completado!':'¡La señal volvió!',total:campaignScore(this.store.state,this.chapterIds.map(id=>this.cache.json.get(id)))});}
 private makeTokens() {
  if(!this.textures.exists('coin')){
   const g=this.make.graphics({x:0,y:0});g.fillStyle(0xffda79).fillCircle(20,20,15);g.lineStyle(3,0xb18138).strokeCircle(20,20,15);g.fillStyle(0xfff6bd).fillTriangle(20,8,24,21,16,21).fillTriangle(20,31,24,18,16,18);g.generateTexture('coin',40,40);g.destroy();
   const gear=this.make.graphics({x:0,y:0});gear.fillStyle(0xc68b45).fillCircle(30,30,21);gear.lineStyle(5,0x6b4e2e).strokeCircle(30,30,21);gear.fillStyle(0xe4f2dc).fillCircle(30,30,10);for(let i=0;i<8;i++){const a=i*Math.PI/4;gear.fillStyle(0xc68b45).fillRoundedRect(26+Math.cos(a)*24,26+Math.sin(a)*24,8,8,2);}gear.generateTexture('gear',60,60);gear.destroy();
  }
  const coins=this.physics.add.staticGroup();
  for(const [id,[x,y]]of this.level.monedas.entries()){
   if(this.progress.coins.has(id))continue;
   const coin=coins.create(x,y,'coin') as Phaser.Physics.Arcade.Image;coin.setData('id',id).setDepth(3);
   this.tweens.add({targets:coin,y:y-5,duration:900,repeat:-1,yoyo:true,delay:id*45});
  }
  // Overlaps are installed after the player exists, in the next scene tick.
  this.time.delayedCall(0,()=>{
   this.physics.add.overlap(this.player,coins,(_p,c)=>{
    const coin=c as Phaser.Physics.Arcade.Image;if(collectCoin(this.progress,coin.getData('id'))){coin.disableBody(true,true);if(this.progress.coins.size===this.level.monedas.length)this.ui.toast('¡Juntaste todas las esferas! El bonus te espera en la llegada.');}
   });
   if(!this.level.tuerca||this.progress.gear)return;
   const gear=this.physics.add.staticImage(this.level.tuerca.x,this.level.tuerca.y,'gear').setDepth(3);
   this.physics.add.overlap(this.player,gear,()=>{if(this.progress.gear)return;this.progress.gear=true;gear.disableBody(true,true);this.paintBridgeStatus();this.ui.toast('¡Encontraste la tuerca! Llevásela a Otto.');});
  });
 }
 private makeEnemies() {
  this.rivals=this.physics.add.group();
  for(const [id,info] of this.level.enemigos.entries()){
   if(this.progress.enemyIds.has(id))continue;
   const enemy=this.rivals.create(info.x,this.level.mundo.piso,info.tipo,'recorte') as Enemy;
   enemy.setOrigin(.5,1).setScale(110/enemy.frame.height).setDepth(4).setData('patrol',{...info,dir:-1});
   enemy.setData('enemyId',id).setData('behavior',info.comportamiento==='corredor'?new RunnerState():new RivalPatrol());
   const raw=enemy.frame;
   enemy.body!.setSize(raw.width*.52,raw.height*.87);enemy.body!.setOffset(raw.width*.24,raw.height*.13);
   this.visuals.push(new CharacterRig(this,enemy,info.tipo as CharacterKind,this.visuals.length));
  }
  this.physics.add.collider(this.rivals,this.solids);
  this.physics.add.overlap(this.player,this.rivals,(_p,e)=>this.meetEnemy(e as Enemy));
 }
 private meetEnemy(enemy:Enemy) {
  if(!enemy.active||this.ended||this.ui.mode!=='playing')return;
  const pb=this.player.body as Phaser.Physics.Arcade.Body,eb=enemy.body as Phaser.Physics.Arcade.Body;
  if(canStomp(pb.velocity.y,pb.bottom,eb.top)){
   enemy.disableBody(true,false);enemy.setData('defeated',true);this.progress.defeated++;this.progress.enemyIds.add(enemy.getData('enemyId'));this.persist();this.player.setVelocityY(-420);
   this.preparation.cancel();this.reboundMs=120;this.takeoffMs=0;
   if(this.progress.defeated===1)this.ui.toast('¡Buen salto! También podés pasar por arriba.');
  }else if(this.time.now>this.hurtUntil){
   this.health--;this.hurtUntil=this.time.now+1800;
   this.preparation.cancel();this.takeoffMs=0;
   this.player.setVelocity(this.player.x<enemy.x?-200:200,-290);
   if(this.health<=0)this.respawn();else this.ui.toast('Un choque. Tenés un ratito para alejarte.');
  }
 }
 private respawn() {
  this.posture.reset();this.setLowBody(false);
  this.health=3;this.hurtUntil=this.time.now+2000;this.player.body!.reset(this.checkpoint.x,this.checkpoint.y);this.player.setVelocity(0,0);this.controls.reset();this.trail=[];this.groundedAt=-Infinity;this.jumpUntil=-Infinity;
  this.preparation.cancel();this.takeoffMs=0;this.reboundMs=0;
  this.regroupAllies(true);
  this.ui.toast('Volvés al banderín. ¡Probá de nuevo!');
 }
 private regroupAllies(fade=false) {
  this.trail=[];this.followDirection=this.player.flipX?1:-1;
  this.followers.forEach((follower,i)=>{
   const point=allyTarget(this.player,this.followDirection,i,this.level.mundo.ancho);
   follower.reset(point,fade);this.allies[i].setPosition(point.x,point.y).setAlpha(fade?0:1).setData('animationX',point.x);
  });
 }
 private buildBridge() {
  if(this.bridgeBuilt)return;this.bridgeBuilt=true;
  if(!this.level.puente)return;
  this.platform(this.level.puente.x,this.level.mundo.piso,this.level.puente.ancho,30);this.paintBridgeStatus();
  this.ui.toast('¡Los tres lo hicieron! El puente está listo.');
 }
 private interaction() {
  const point=this.level.interacciones.find(i=>this.player.x>i.min&&this.player.x<i.max);if(!point)return;
  this.helpMs=550;
  if(this.level.id==='bosque'){
   if(point.kind==='otto'){
    if(this.progress.switch){this.ui.toast('¡Otto ya encendió el interruptor!');return;}
    if(this.ottoHelping)return;
    this.ottoHelping=1600;this.ui.dialogue([this.level.dialogos.otto[0]],()=>this.ui.hint('Otto está entrando al acceso…'));
   }else if(!this.progress.switch)this.ui.dialogue(this.level.dialogos.rural_sin_otto);
   else if(!this.progress.antenna)this.ui.openPuzzle(symbol=>{
    if(symbol!==this.level.antena!.orientacion){this.ui.puzzleFeedback('Mirá la estrella de la pista y probá otra vez.',[]);return;}
    this.progress.antenna=true;this.paintBridgeStatus();this.persist();this.ui.dialogue(this.level.dialogos.antena_lista);
   },this.level.acertijo);
   else this.ui.toast('¡La antena recibe la señal! Seguí al banderín.');
  }else if(point.kind==='otto'){
   if(!this.progress.otto){if(helpOtto(this.progress)){this.paintBridgeStatus();this.persist();this.ui.dialogue(this.level.dialogos.otto);}else this.ui.dialogue(this.level.dialogos.otto_sin_tuerca);}
   else this.ui.toast('Otto ya ajustó su lado. ¡Buscá la señal de Rural!');
  }else {
   if(!this.progress.otto)this.ui.dialogue(this.level.dialogos.rural_sin_otto);
   else if(!this.progress.rural)this.ui.openPuzzle(symbol=>{
    const result=chooseSymbol(this.progress,symbol);
    this.ui.puzzleFeedback(result==='retry'?'Casi. Mirá la pista y probá otra vez.':result==='complete'?'¡Esa es la señal!':'¡Bien! Seguí con la próxima forma.',this.progress.symbols);
    this.persist();if(result==='complete'){this.buildBridge();this.ui.dialogue(this.level.dialogos.puente_listo);}
   },this.level.acertijo);
   else this.ui.toast('La señal ya está encendida. ¡A cruzar!');
  }
 }
 update(now:number,delta:number) {
  if(!this.player)return;
  if(this.ui.mode==='playing'&&!this.ui.portrait&&!this.ended)this.updateGameplay(now,Math.min(delta,50));
  this.updateVisuals(delta);this.art.scroll(this.cameras.main.scrollX);
 }
 private updateVisuals(delta:number) {
  const suspended=this.ui.mode==='paused'||this.ui.portrait||document.hidden;
  const dt=Math.min(delta,50),body=this.player.body as Phaser.Physics.Arcade.Body,playing=this.ui.mode==='playing';
  const oldPose=this.pattha.clock.snapshot().pose;
  if(!suspended)this.helpMs=Math.max(0,this.helpMs-dt);
  this.pattha.update(dt,{speed:playing?body.velocity.x:0,vy:body.velocity.y,grounded:!playing||(body.blocked.down&&Math.abs(body.velocity.y)<30),crouching:playing&&this.preparation.crouching,posture:this.posture.snapshot(),takingOff:this.takeoffMs>0,rebounding:this.reboundMs>0,helping:this.helpMs>0,celebrating:this.ended,hurt:playing&&this.time.now<this.hurtUntil-1550,suspended,reducedMotion:this.reducedMotion.matches});
  if(!suspended&&oldPose!=='land'&&this.pattha.clock.snapshot().pose==='land'&&!this.reducedMotion.matches)this.dust.emit(this.player.x,body.bottom,true);
  this.dust.update(dt,suspended,this.reducedMotion.matches);
  this.ambient.update(dt,suspended||!playing||this.ended,!this.ui.airplanesEnabled);
  const chatting=playing&&!this.ended&&!this.ui.portrait;
  const context=this.progress.bridge?'cruzado':this.level.interacciones.some(i=>this.player.x>i.min-100&&this.player.x<i.max)?'puente':'camino';
  const line=this.friendConversation.step(dt,context,this.level.charlas_amigos,suspended||!chatting);
  this.friendBubble.setVisible(Boolean(line)&&chatting);
  this.friendBubble.setAlpha(this.friendConversation.opacity());this.friendPanel.clear();
  const dialogueSpeaker=this.ui.mode==='dialogue'?document.getElementById('portrait')?.dataset.character:null;
  if(line&&chatting){
   const speaker=this.allies[line.quien==='otto'?0:1],listener=this.allies[line.quien==='otto'?1:0];
   const speakerMotion=this.followers[line.quien==='otto'?0:1].snapshot(),listenerMotion=this.followers[line.quien==='otto'?1:0].snapshot();
   if(Math.abs(speakerMotion.vx)<20&&Math.abs(listenerMotion.vx)<20&&Math.abs(speaker.x-listener.x)>12){speaker.setFlipX(listener.x>speaker.x);listener.setFlipX(speaker.x>listener.x);}
   const visual=this.visuals.find(v=>v.host===speaker);
   this.friendBubble.setText((line.quien==='otto'?'Otto':'Rural')+': '+line.texto);
   const camera=this.cameras.main,half=this.friendBubble.width/2+12;
   this.friendBubble.setPosition(Phaser.Math.Clamp(speaker.x,camera.scrollX+half,camera.scrollX+1280-half),Math.max(110,(visual?.root.y??speaker.y)-this.player.displayHeight-20));
   const {x,y,width,height}=this.friendBubble,alpha=this.friendBubble.alpha;
   this.friendPanel.fillStyle(0xf7fff0,.72*alpha).fillRoundedRect(x-width/2,y-height,width,height,10);
   this.friendPanel.lineStyle(1,0x789487,.22*alpha).strokeRoundedRect(x-width/2,y-height,width,height,10);
  }
  for(const visual of this.visuals) {
   if(!visual.root.active)continue;
   const host=visual.host;
   const lastX=host.getData('animationX')??host.x;
   const body='body' in host?host.body as Phaser.Physics.Arcade.Body|null:null;
   const playing=this.ui.mode==='playing'&&host.active;
   const follower=this.followers[this.allies.indexOf(host as Phaser.GameObjects.Image)];
   const speed=playing?(body?body.velocity.x:follower?follower.snapshot().vx:(host.x-lastX)/Math.max(delta,1)*1000):0;
   const airborne=playing?(body?(!body.blocked.down||Math.abs(body.velocity.y)>35):host.y<this.level.mundo.piso-8):false;
   const defeated=Boolean(host.getData('defeated'));
   const talking=(chatting&&line?.quien===visual.kind)||dialogueSpeaker===visual.kind;
   const alert=(host.getData('behavior') as RivalPatrol|undefined)?.snapshot().mode==='warn';
   visual.update(dt,{speed,airborne,suspended,reducedMotion:this.reducedMotion.matches,talking,alert,defeated});
   host.setData('animationX',host.x);
   if(defeated&&visual.clock.snapshot().gesture>=1){host.destroy();}
  }
 }
 private updateGameplay(now:number,delta:number) {
  if(!this.player||this.ui.mode!=='playing'||this.ui.portrait||this.ended)return;
  const body=this.player.body as Phaser.Physics.Arcade.Body;
  if(this.controls.consumeInteract()){this.interaction();if(this.ui.mode!=='playing')return;}
  this.takeoffMs=Math.max(0,this.takeoffMs-delta);this.reboundMs=Math.max(0,this.reboundMs-delta);
  const posture=this.posture.step(delta,{held:this.controls.crouchHeld,grounded:body.blocked.down,headroom:this.canStand()});
  this.setLowBody(posture.phase!=='stand');
  if(posture.phase!=='stand')this.preparation.cancel();
  if(body.blocked.down&&!this.preparation.crouching)this.groundedAt=now;
  if(this.controls.consumeJump()&&!this.controls.crouchHeld&&!posture.blocked)this.jumpUntil=now+(posture.phase==='stand'?140:320);
  if(this.controls.crouchHeld||posture.blocked)this.jumpUntil=-Infinity;
  if(posture.phase==='stand'&&!this.preparation.crouching&&canJump(now,this.groundedAt,this.jumpUntil)){this.preparation.begin(body.blocked.down);this.jumpUntil=-Infinity;this.groundedAt=-Infinity;}
  if(this.preparation.step(delta)) {
   this.player.setVelocityY(-620);this.takeoffMs=70;this.groundedAt=-Infinity;
   if(!this.reducedMotion.matches)this.dust.emit(this.player.x,body.bottom);
  }
  if(!this.controls.jumpHeld && body.velocity.y < -280)this.player.setVelocityY(-280);
  if(now>this.hurtUntil-1500)this.player.setVelocityX(this.controls.axis*(posture.phase==='lower'||posture.phase==='rise'?0:posture.phase==='low'?125:285));
  if(this.controls.axis)this.player.setFlipX(this.controls.axis>0);
  this.player.setAlpha(now<this.hurtUntil?.55+Math.abs(Math.sin(now/85))*.45:1);
  this.player.x=Phaser.Math.Clamp(this.player.x,35,this.level.mundo.ancho-35);
  for(const child of this.rivals.getChildren()){
   const enemy=child as Enemy;if(!enemy.active)continue;
   const patrol=enemy.getData('patrol');
   const behavior=(enemy.getData('behavior') as RivalPatrol).step(delta,{x:enemy.x,playerX:this.player.x,playerY:this.player.y,floor:this.level.mundo.piso,min:patrol.min,max:patrol.max,speed:patrol.velocidad});
   enemy.setVelocityX(behavior.velocity);enemy.setFlipX(behavior.direction>0);
  }
  if(this.player.y>810)this.respawn();
  if(now-this.lastSample>35){this.trail.push({x:this.player.x,y:this.player.y,time:now});this.trail=this.trail.filter(point=>now-point.time<450);this.lastSample=now;}
  if(Math.abs(body.velocity.x)>70){const direction=body.velocity.x>0?1:-1;this.followDirection+=(direction-this.followDirection)*(1-Math.exp(-delta/130));}
  const atMeeting=this.level.interacciones.some(i=>this.player.x>i.min-70&&this.player.x<i.max);
  for(let i=0;i<this.allies.length;i++){
   let point=this.trail[0]??this.player;
   for(let j=this.trail.length-1;j>=0;j--)if(this.trail[j].time<=now-(i+1)*80){point=this.trail[j];break;}
   const target=allyTarget({x:this.player.x,y:point.y},this.followDirection,i,this.level.mundo.ancho);
   if(i===0&&this.ottoHelping>0){const point=this.level.interacciones.find(p=>p.kind==='otto')!;this.ottoHelping=Math.max(0,this.ottoHelping-delta);const phase=1-this.ottoHelping/1600;target.x=point.x-28;target.y=this.level.mundo.piso;const follow=this.followers[i].step(delta,target);this.allies[i].setPosition(follow.x,follow.y).setAlpha(.35+.65*Math.abs(phase*2-1));if(this.ottoHelping===0){this.allies[i].setAlpha(1);this.progress.switch=true;this.paintBridgeStatus();this.persist();this.ui.dialogue([this.level.dialogos.otto[1]]);}continue;}
   const follow=this.followers[i].step(delta,target);
   this.allies[i].setPosition(follow.x,follow.y).setAlpha(follow.alpha);
   if(Math.abs(follow.vx)>35)this.allies[i].setFlipX(follow.facing>0);
   this.allyLabels[i].setPosition(this.allies[i].x,this.allies[i].y-95);
   this.allyLabels[i].setVisible(atMeeting||this.player.x<420);
  }
  for(const flag of this.flags){if(!flag.active && Math.abs(this.player.x-flag.x)<CHECKPOINT_REACH&&body.blocked.down&&Math.abs(body.bottom-this.level.mundo.piso)<3){flag.active=true;this.checkpoint={x:flag.x,y:this.level.mundo.piso};this.art.state(flag.view,'common.checkpoint-on');this.ui.toast('Banderín activado. Tus avances quedan a salvo.');}}
  if(this.ui.mode!=='playing')return;
  const x=this.player.x;
  let hint='';
  if((this.level.pasajes_bajos??[]).some(([center,,width])=>x>center-width/2-75&&x<center+width/2+75))hint='Mantené ↓ / S o Gatear y avanzá. Soltá al salir.';
  const meeting=this.level.interacciones.find(i=>x>i.min&&x<i.max);
  if(meeting)hint='E / Ayudar: hablar con '+(meeting.kind==='otto'?'Otto':'Rural');
  if(this.ottoHelping>0)hint='Otto está entrando al acceso…';
  this.ui.hint(hint);
  const zone=this.level.zonas.find(z=>x<z.hasta)?.nombre??this.level.titulo;
  const objective=this.level.objetivos.find(o=>o.requisito==='exit'||!this.progress[o.requisito])!.texto;
  this.ui.hud(zone,objective,this.progress.coins.size,this.health);
  this.persist();
  if(this.level.puente&&x>this.level.puente.x+this.level.puente.ancho/2&&this.progress.bridge&&!this.progress.clue){this.progress.clue=true;this.persist();this.ui.dialogue(this.level.dialogos.marca);return;}
  if(x>this.level.salida&&(this.level.id==='sendero'?this.progress.bridge:this.progress.antenna)){this.ended=true;this.player.setVelocity(0,0);this.persist();this.ui.dialogue(this.level.dialogos.final,()=>this.showSummary());}
 }
}
