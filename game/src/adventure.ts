import Phaser from 'phaser';
import { canJump, canStomp, chooseSymbol, collectCoin, createProgress, helpOtto, type Progress } from './rules.ts';
import type { Controls } from './input.ts';
import type { DemoUI, Line } from './ui.ts';
import { CharacterRig } from './character-rig.ts';
import type { CharacterKind } from './character-art.ts';
import { PatthaAnimator } from './pattha-animator.ts';
import { patthaAtlas } from './pattha-art.ts';
import { JumpPreparation } from './pattha-state.ts';
import { JumpDust } from './jump-dust.ts';

type Level = { personajes:Record<string,string>;mundo:{ancho:number;alto:number;piso:number};suelo:number[][];plataformas:number[][];monedas:number[][];enemigos:{tipo:string;x:number;min:number;max:number;velocidad:number}[];puestos_control:number[];dialogos:Record<string,Line[]> };
type Enemy = Phaser.Physics.Arcade.Sprite;
export class Adventure extends Phaser.Scene {
 progress: Progress=createProgress();
 player!: Phaser.Physics.Arcade.Sprite;
 private level!: Level;
 private solids!: Phaser.Physics.Arcade.StaticGroup;
 private rivals!: Phaser.Physics.Arcade.Group;
 private allies:Phaser.GameObjects.Image[]=[];
 private allyLabels:Phaser.GameObjects.Text[]=[];
 private trail:{x:number;y:number}[]=[];
 private checkpoint={x:130,y:540};
 private flags:{x:number;view:Phaser.GameObjects.Graphics;active:boolean}[]=[];
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
 private takeoffMs=0;
 private reboundMs=0;
 private helpMs=0;
 private reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  private originalLoadFailed=false;
 constructor(private ui: DemoUI, private controls: Controls) { super('adventure'); }
 preload() {
  if(this.cache.json.exists('level'))return;
  this.load.json('level','./data/demo_plataformas.json');
  const paths={pattha:'personajes/transparentes/pattha_concepto_B_transparente.png',otto:'personajes/transparentes/raton_verde_concepto_transparente.png',rural:'personajes/transparentes/rural_concepto_transparente.png',gato:'enemigos/gato-v1.png',perro:'enemigos/perro-v1.png'};
  for(const [key,path]of Object.entries(paths))this.load.image(key,'./assets/'+path);
  for(const [key,sheet]of Object.entries(patthaAtlas.sheets))this.load.image('pattha-'+key,'./'+sheet.path);
  this.load.on('progress',(p:number)=>this.ui.loading(p));
  this.load.on('loaderror',()=>{this.originalLoadFailed=true;this.ui.loadError();});
 }
 create(data:{autostart?:boolean}={}) {
  if(this.originalLoadFailed)return;
  this.level=this.cache.json.get('level') as Level;
  if(!this.level || ['pattha','otto','rural','gato','perro','pattha-carrera','pattha-salto','pattha-reposo'].some(k=>!this.textures.exists(k))){this.ui.loadError();return;}
  this.progress=createProgress();this.health=3;this.ended=false;this.bridgeBuilt=false;this.flags=[];this.allies=[];this.allyLabels=[];this.trail=[];this.visuals=[];this.hurtUntil=0;this.groundedAt=-Infinity;this.jumpUntil=-Infinity;this.lastSample=0;this.checkpoint={x:130,y:this.level.mundo.piso};
  this.preparation.cancel();this.takeoffMs=0;this.reboundMs=0;this.helpMs=0;
  this.physics.world.setBounds(0,-100,this.level.mundo.ancho,1000);
  this.paintBackground();
  this.solids=this.physics.add.staticGroup();
  for(const [left,right]of this.level.suelo)this.platform((left+right)/2,this.level.mundo.piso,right-left,210);
  for(const [x,top,width]of this.level.plataformas)this.platform(x,top,width,26);
  this.paintProps();
  this.makeTokens();
  this.player=this.physics.add.sprite(130,this.level.mundo.piso,'pattha').setOrigin(.5,1).setDepth(5);
  this.player.setDisplaySize(104,132);
  const raw=this.textures.get('pattha').getSourceImage() as HTMLImageElement;
  this.player.body!.setSize(raw.width*.44,raw.height*.78);
  this.player.body!.setOffset(raw.width*.28,raw.height*.22);
  this.player.setMaxVelocity(340,950).setCollideWorldBounds(false);
  this.physics.add.collider(this.player,this.solids);
  this.pattha=new PatthaAnimator(this,this.player);this.dust=new JumpDust(this);
  for(const [i,key]of ['otto','rural'].entries()){
   const ally=this.add.image(220+i*90,this.level.mundo.piso,key).setOrigin(.5,1).setDisplaySize(61,82).setDepth(4);
   this.allies.push(ally);
   this.visuals.push(new CharacterRig(this,ally,key as CharacterKind,i+1));
   this.allyLabels.push(this.add.text(ally.x,ally.y-95,key==='otto'?'Otto':'Rural',{fontFamily:'system-ui',fontSize:'12px',color:'#28513d',backgroundColor:'#f0f8df',padding:{x:8,y:4}}).setOrigin(.5).setDepth(7));
  }
  for(const [key,box]of Object.entries({gato:[25,159,985,1218],perro:[30,187,981,1190]})){const t=this.textures.get(key);if(!t.has('recorte'))t.add('recorte',0,...box as [number,number,number,number]);}
  this.makeEnemies();
  this.cameras.main.setBounds(0,0,this.level.mundo.ancho,720);
  this.cameras.main.startFollow(this.player,true,.1,1,0,0);
  this.ui.bind({restart:autostart=>{this.ui.setMode('menu');this.ui.hint('');this.scene.restart({autostart});},setPaused:paused=>{if(paused)this.physics.world.pause();else this.physics.world.resume();},resetInput:()=>this.controls.reset()});
  this.ui.ready();
  this.ui.setMode(data.autostart?'playing':'menu');
  if(data.autostart)this.ui.dialogue(this.level.dialogos.intro);
  if(import.meta.env.DEV && new URLSearchParams(location.search).has('test')) {
   (window as unknown as {__PATTHA_TEST__:unknown}).__PATTHA_TEST__={
    snapshot:()=>({x:this.player.x,y:this.player.y,vy:(this.player.body as Phaser.Physics.Arcade.Body).velocity.y,grounded:(this.player.body as Phaser.Physics.Arcade.Body).blocked.down,health:this.health,coins:this.progress.coins.size,gear:this.progress.gear,otto:this.progress.otto,rural:this.progress.rural,bridge:this.progress.bridge,defeated:this.progress.defeated,enemies:this.rivals.getChildren().filter(e=>e.active).map(e=>{const r=e as Enemy;return {x:r.x,y:r.y,top:(r.body as Phaser.Physics.Arcade.Body).top,kind:r.getData('patrol').tipo};}),animations:[this.pattha.snapshot(),...this.visuals.filter(v=>v.root.active).map(v=>v.snapshot())],dust:this.dust.snapshot(),checkpoint:this.checkpoint.x,mode:this.ui.mode,portrait:this.ui.portrait}),
    position:(x:number,y:number)=>{this.player.body!.reset(x,y);this.player.setVelocity(0,0);this.controls.reset();this.preparation.cancel();this.takeoffMs=0;this.reboundMs=0;},
   };
  }
 }
 private paintBackground() {
  const sky=this.add.graphics().setScrollFactor(0).setDepth(-10);
  sky.fillStyle(0xe4f2dc).fillRect(0,0,1280,720);
  sky.fillStyle(0xd1e9dd).fillRect(0,0,1280,190);
  sky.fillStyle(0xffedb4).fillCircle(1050,105,47);
  const far=this.add.graphics().setScrollFactor(.12).setDepth(-8);
  for(let x=-100;x<9000;x+=460){far.fillStyle(0xb4d3c2).fillEllipse(x,470,720,490);far.fillStyle(0xc0dccc).fillEllipse(x+230,550,450,470);}
  const near=this.add.graphics().setScrollFactor(.3).setDepth(-6);
  for(let x=0;x<10000;x+=400){near.fillStyle(0x8ebaa1).fillEllipse(x,615,550,490);near.fillStyle(0xa2cab0).fillEllipse(x+240,600,330,420);}
  const clouds=this.add.graphics().setScrollFactor(.08).setDepth(-7);
  clouds.fillStyle(0xfaffef,.85);
  for(const x of [130,570,1150,1780,2270]){clouds.fillRoundedRect(x,95+(x%3)*18,120,28,14).fillCircle(x+35,95+(x%3)*18,23).fillCircle(x+70,88+(x%3)*18,29);}
 }
 private platform(x:number,top:number,width:number,height:number) {
  const collision=this.add.rectangle(x,top+height/2,width,height,0x000000,0);
  this.solids.add(collision);
  const g=this.add.graphics().setDepth(0);
  g.fillStyle(0xb98660).fillRoundedRect(x-width/2,top,width,height,10);
  g.lineStyle(3,0x2f5042).strokeRoundedRect(x-width/2,top,width,height,10);
  g.fillStyle(0x4c9a66).fillRoundedRect(x-width/2,top,width,16,8);
  g.fillStyle(0xb5e68e).fillRoundedRect(x-width/2+4,top+2,width-8,5,3);
  for(let dx=25;dx<width-15;dx+=51){g.fillStyle(0x98704f,.6).fillCircle(x-width/2+dx,top+40+(dx%3)*20,3);}
 }
 private paintProps() {
  const props=this.add.graphics().setDepth(1);
  for(const x of [100,1200,2050,2590,3700,4050,4600,5210,6140,6500,7290]){
   props.fillStyle(0x477d57).fillCircle(x,526,25).fillCircle(x+28,525,18);
   props.fillStyle(0x70aa72).fillCircle(x+15,511,22);
   props.fillStyle(0xead797).fillCircle(x+4,506,3).fillCircle(x+22,515,3);
  }
  const sign=(x:number,label:string)=>{
   props.fillStyle(0x977451).fillRect(x-4,475,8,65);props.fillStyle(0xf5ebbd).fillRoundedRect(x-75,443,150,41,8);props.lineStyle(2,0x49654a).strokeRoundedRect(x-75,443,150,41,8);
   this.add.text(x,463,label,{fontFamily:'system-ui',fontSize:'12px',color:'#405844',fontStyle:'bold'}).setOrigin(.5);
  };
  sign(180,'¡Vamos juntos!');sign(1500,'Saltá por arriba ↑');sign(2830,'Un puente entre tres');sign(6460,'¡Falta poquito! →');
  this.panels=this.add.graphics().setDepth(2);this.paintBridgeStatus();
  props.fillStyle(0x496956).fillRect(3120,420,9,120).fillRect(3580,420,9,120);props.lineStyle(4,0x6e8960).lineBetween(3124,430,3584,430);
  for(const x of this.level.puestos_control){const view=this.add.graphics().setDepth(2);view.fillStyle(0x58735a).fillRect(x,467,5,73);view.fillStyle(0xdacb96).fillTriangle(x+5,467,x+45,482,x+5,497);this.flags.push({x,view,active:false});}
  props.fillStyle(0x95764f).fillRect(7200,384,8,156);props.fillStyle(0x3b8d6c).fillTriangle(7208,384,7280,409,7208,437);
  this.add.text(7230,356,'LLEGADA',{fontFamily:'system-ui',fontSize:'13px',fontStyle:'bold',color:'#2d5944',backgroundColor:'#f3f6dc',padding:{x:10,y:5}}).setOrigin(.5);
 }
 private paintBridgeStatus() {
  this.panels.clear();
  for(let i=0;i<3;i++){this.panels.fillStyle((i===0?this.progress.gear:i===1?this.progress.otto:this.progress.rural)?0xa5d97d:0x55756c).fillRoundedRect(2910+i*42,432,29,38,7);}
 }
 private makeTokens() {
  if(!this.textures.exists('coin')){
   const g=this.make.graphics({x:0,y:0});g.fillStyle(0xffda79).fillCircle(20,20,15);g.lineStyle(3,0xb18138).strokeCircle(20,20,15);g.fillStyle(0xfff6bd).fillTriangle(20,8,24,21,16,21).fillTriangle(20,31,24,18,16,18);g.generateTexture('coin',40,40);g.destroy();
   const gear=this.make.graphics({x:0,y:0});gear.fillStyle(0xc68b45).fillCircle(30,30,21);gear.lineStyle(5,0x6b4e2e).strokeCircle(30,30,21);gear.fillStyle(0xe4f2dc).fillCircle(30,30,10);for(let i=0;i<8;i++){const a=i*Math.PI/4;gear.fillStyle(0xc68b45).fillRoundedRect(26+Math.cos(a)*24,26+Math.sin(a)*24,8,8,2);}gear.generateTexture('gear',60,60);gear.destroy();
  }
  const coins=this.physics.add.staticGroup();
  for(const [id,[x,y]]of this.level.monedas.entries()){
   const coin=coins.create(x,y,'coin') as Phaser.Physics.Arcade.Image;coin.setData('id',id).setDepth(3);
   this.tweens.add({targets:coin,y:y-5,duration:900,repeat:-1,yoyo:true,delay:id*45});
  }
  // Overlaps are installed after the player exists, in the next scene tick.
  this.time.delayedCall(0,()=>{
   this.physics.add.overlap(this.player,coins,(_p,c)=>{
    const coin=c as Phaser.Physics.Arcade.Image;if(collectCoin(this.progress,coin.getData('id')))coin.disableBody(true,true);
   });
   const gear=this.physics.add.staticImage(2740,315,'gear').setDepth(3);
   this.physics.add.overlap(this.player,gear,()=>{if(this.progress.gear)return;this.progress.gear=true;gear.disableBody(true,true);this.paintBridgeStatus();this.ui.toast('¡Encontraste la tuerca! Llevásela a Otto.');});
  });
 }
 private makeEnemies() {
  this.rivals=this.physics.add.group();
  for(const info of this.level.enemigos){
   const enemy=this.rivals.create(info.x,this.level.mundo.piso,info.tipo,'recorte') as Enemy;
   enemy.setOrigin(.5,1).setScale(110/enemy.frame.height).setDepth(4).setData('patrol',{...info,dir:-1});
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
   enemy.disableBody(true,false);this.progress.defeated++;this.player.setVelocityY(-420);
   this.preparation.cancel();this.reboundMs=120;this.takeoffMs=0;
   this.tweens.add({targets:enemy,alpha:0,y:enemy.y-25,duration:330,onComplete:()=>enemy.destroy()});
   const star=this.add.text(enemy.x,enemy.y-90,'✦',{fontSize:'28px',color:'#ffedaf'}).setOrigin(.5).setDepth(8);this.tweens.add({targets:star,y:star.y-40,alpha:0,duration:650,onComplete:()=>star.destroy()});
   if(this.progress.defeated===1)this.ui.toast('¡Buen salto! También podés pasar por arriba.');
  }else if(this.time.now>this.hurtUntil){
   this.health--;this.hurtUntil=this.time.now+1800;
   this.preparation.cancel();this.takeoffMs=0;
   this.player.setVelocity(this.player.x<enemy.x?-200:200,-290);
   if(this.health<=0)this.respawn();else this.ui.toast('Un choque. Tenés un ratito para alejarte.');
  }
 }
 private respawn() {
  this.health=3;this.hurtUntil=this.time.now+2000;this.player.body!.reset(this.checkpoint.x,this.checkpoint.y);this.player.setVelocity(0,0);this.controls.reset();this.trail=[];this.groundedAt=-Infinity;this.jumpUntil=-Infinity;
  this.preparation.cancel();this.takeoffMs=0;this.reboundMs=0;
  this.ui.toast('Volvés al banderín. ¡Probá de nuevo!');
 }
 private buildBridge() {
  if(this.bridgeBuilt)return;this.bridgeBuilt=true;
  this.platform(3355,this.level.mundo.piso,410,30);this.paintBridgeStatus();
  this.ui.toast('¡Los tres lo hicieron! El puente está listo.');
 }
 private interaction() {
  const x=this.player.x;
  if(x>2760&&x<3150)this.helpMs=550;
  if(x>2760&&x<2950){
   if(!this.progress.otto){if(helpOtto(this.progress)){this.paintBridgeStatus();this.ui.dialogue(this.level.dialogos.otto);}else this.ui.dialogue(this.level.dialogos.otto_sin_tuerca);}
   else this.ui.toast('Otto ya ajustó su lado. ¡Buscá la señal de Rural!');
  }else if(x>=2950&&x<3150){
   if(!this.progress.otto)this.ui.dialogue(this.level.dialogos.rural_sin_otto);
   else if(!this.progress.rural)this.ui.openPuzzle(symbol=>{
    const result=chooseSymbol(this.progress,symbol);
    this.ui.puzzleFeedback(result==='retry'?'Casi. Mirá la pista y probá otra vez.':result==='complete'?'¡Esa es la señal!':'¡Bien! Seguí con la próxima forma.',this.progress.symbols);
    if(result==='complete'){this.buildBridge();this.ui.dialogue([{quien:'rural',texto:'¡Esa es! Otto ajustó la tuerca y vos encendiste la señal. ¡Ahora podemos cruzar!'}]);}
   });
   else this.ui.toast('La señal ya está encendida. ¡A cruzar!');
  }
 }
 update(now:number,delta:number) {
  if(!this.player)return;
  if(this.ui.mode==='playing'&&!this.ui.portrait&&!this.ended)this.updateGameplay(now,Math.min(delta,50));
  this.updateVisuals(delta);
 }
 private updateVisuals(delta:number) {
  const suspended=this.ui.mode==='paused'||this.ui.portrait||document.hidden;
  const dt=Math.min(delta,50),body=this.player.body as Phaser.Physics.Arcade.Body,playing=this.ui.mode==='playing';
  const oldPose=this.pattha.clock.snapshot().pose;
  if(!suspended)this.helpMs=Math.max(0,this.helpMs-dt);
  this.pattha.update(dt,{speed:playing?body.velocity.x:0,vy:body.velocity.y,grounded:!playing||(body.blocked.down&&Math.abs(body.velocity.y)<30),crouching:playing&&this.preparation.crouching,takingOff:this.takeoffMs>0,rebounding:this.reboundMs>0,helping:this.helpMs>0,celebrating:this.ended,hurt:playing&&this.time.now<this.hurtUntil-1550,suspended,reducedMotion:this.reducedMotion.matches});
  if(!suspended&&oldPose!=='land'&&this.pattha.clock.snapshot().pose==='land'&&!this.reducedMotion.matches)this.dust.emit(this.player.x,body.bottom,true);
  this.dust.update(dt,suspended,this.reducedMotion.matches);
  for(const visual of this.visuals) {
   if(!visual.root.active)continue;
   const host=visual.host;
   const lastX=host.getData('animationX')??host.x;
   const body='body' in host?host.body as Phaser.Physics.Arcade.Body|null:null;
   const playing=this.ui.mode==='playing'&&host.active;
   const speed=playing?(body?body.velocity.x:(host.x-lastX)/Math.max(delta,1)*1000):0;
   const airborne=playing?(body?(!body.blocked.down||Math.abs(body.velocity.y)>35):host.y<this.level.mundo.piso-8):false;
   visual.update(Math.min(delta,50),{speed,airborne,suspended,reducedMotion:this.reducedMotion.matches});
   host.setData('animationX',host.x);
  }
 }
 private updateGameplay(now:number,delta:number) {
  if(!this.player||this.ui.mode!=='playing'||this.ui.portrait||this.ended)return;
  const body=this.player.body as Phaser.Physics.Arcade.Body;
  if(this.controls.consumeInteract()){this.interaction();if(this.ui.mode!=='playing')return;}
  this.takeoffMs=Math.max(0,this.takeoffMs-delta);this.reboundMs=Math.max(0,this.reboundMs-delta);
  if(body.blocked.down&&!this.preparation.crouching)this.groundedAt=now;
  if(this.controls.consumeJump())this.jumpUntil=now+140;
  if(!this.preparation.crouching&&canJump(now,this.groundedAt,this.jumpUntil)){this.preparation.begin(body.blocked.down);this.jumpUntil=-Infinity;this.groundedAt=-Infinity;}
  if(this.preparation.step(delta)) {
   this.player.setVelocityY(-620);this.takeoffMs=70;this.groundedAt=-Infinity;
   if(!this.reducedMotion.matches)this.dust.emit(this.player.x,body.bottom);
  }
  if(!this.controls.jumpHeld && body.velocity.y < -280)this.player.setVelocityY(-280);
  if(now>this.hurtUntil-1500)this.player.setVelocityX(this.controls.axis*285);
  if(this.controls.axis)this.player.setFlipX(this.controls.axis>0);
  this.player.setAlpha(now<this.hurtUntil?.55+Math.abs(Math.sin(now/85))*.45:1);
  this.player.x=Phaser.Math.Clamp(this.player.x,35,this.level.mundo.ancho-35);
  for(const child of this.rivals.getChildren()){
   const enemy=child as Enemy;if(!enemy.active)continue;
   const patrol=enemy.getData('patrol');if(enemy.x<patrol.min)patrol.dir=1;if(enemy.x>patrol.max)patrol.dir=-1;
   enemy.setVelocityX(patrol.dir*patrol.velocidad);enemy.setFlipX(patrol.dir>0);
  }
  if(this.player.y>810)this.respawn();
  if(now-this.lastSample>45){this.trail.push({x:this.player.x,y:this.player.y});if(this.trail.length>45)this.trail.shift();this.lastSample=now;}
  const atMeeting=this.player.x>2690&&this.player.x<3150;
  for(let i=0;i<this.allies.length;i++){
   const point=this.trail[Math.max(0,this.trail.length-1-(i+1)*10)]??{x:this.player.x-80*(i+1),y:this.player.y};
   const followX=Math.abs(point.x-this.player.x)<90*(i+1)?this.player.x-90*(i+1):point.x;
   const target=atMeeting?{x:i===0?2870:3020,y:this.level.mundo.piso}:{x:this.player.x<270?this.player.x+90*(i+1):Math.max(35,followX),y:point.y};
   if(Math.abs(target.x-this.allies[i].x)>1)this.allies[i].setFlipX(target.x>this.allies[i].x);
   this.allies[i].setPosition(Phaser.Math.Linear(this.allies[i].x,target.x,.2),Phaser.Math.Linear(this.allies[i].y,target.y,.2));
   this.allyLabels[i].setPosition(this.allies[i].x,this.allies[i].y-95);
   this.allyLabels[i].setVisible(atMeeting||this.player.x<420);
  }
  for(const flag of this.flags){if(!flag.active && Math.abs(this.player.x-flag.x)<55&&body.blocked.down){flag.active=true;this.checkpoint={x:flag.x,y:this.player.y};flag.view.fillStyle(0xb9e68a).fillTriangle(flag.x+5,467,flag.x+45,482,flag.x+5,497);this.ui.toast('Banderín activado. Tus avances quedan a salvo.');}}
  const x=this.player.x;
  let hint='';
  if(x>2760&&x<2950)hint=this.progress.otto?'Otto ya ayudó. Seguí hasta Rural →':'E / Ayudar: hablar con Otto';
  else if(x>=2950&&x<3150)hint=this.progress.rural?'¡El puente está listo! →':'E / Ayudar: escuchar a Rural';
  this.ui.hint(hint);
  const zone=x<2400?'Primeros saltos':x<3560?'El puente entre amigos':'El último tramo';
  const objective=x<2400?'Saltá sobre los animales o pasá por arriba.':!this.progress.gear?'Buscá la tuerca en la plataforma alta.':!this.progress.otto?'Llevale la tuerca a Otto.':!this.progress.rural?'Rural tiene la pista de la señal.':'Seguí los banderines hasta la llegada.';
  this.ui.hud(zone,objective,this.progress.coins.size,this.health);
  if(x>7140&&this.progress.bridge){this.ended=true;this.player.setVelocity(0,0);this.ui.dialogue(this.level.dialogos.final,()=>this.ui.win(this.progress.coins.size));}
 }
}
