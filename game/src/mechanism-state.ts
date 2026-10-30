/** Shared deterministic mechanisms for the isolated lab and the future campaign. Milliseconds, logical pixels. */
export type Rect={x:number;y:number;width:number;height:number};
export const overlaps=(a:Rect,b:Rect)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
export type PlatformDefinition={x:number;y:number;toX:number;toY:number;duration:number;width:number;height:number};
export class MovingPlatformState {
 private elapsed=0;private active:boolean;private x:number;private y:number;
 readonly definition:PlatformDefinition;
 constructor(definition:PlatformDefinition,active=true){this.definition=definition;this.active=active;this.x=definition.x;this.y=definition.y;}
 activate(){this.active=true;}
 reset(){this.elapsed=0;this.x=this.definition.x;this.y=this.definition.y;}
 step(delta:number,suspended=false){
  const previous={x:this.x,y:this.y};
  if(this.active&&!suspended){this.elapsed+=Math.max(0,delta);const t=this.elapsed/this.definition.duration;const progress=(1-Math.cos(Math.PI*t))/2;this.x=this.definition.x+(this.definition.toX-this.definition.x)*progress;this.y=this.definition.y+(this.definition.toY-this.definition.y)*progress;}
  return {...this.snapshot(),dx:this.x-previous.x,dy:this.y-previous.y};
 }
 snapshot(){return {x:this.x,y:this.y,active:this.active,elapsed:this.elapsed};}
}
export type GateMode='open'|'warning'|'closing'|'closed'|'opening';
export class GateState {
 private mode:GateMode='open';private remaining=0;private amount=0;
 readonly area:Rect;
 constructor(area:Rect){this.area=area;}
 requestClosed(){if(this.mode==='open'){this.mode='warning';this.remaining=1000;}}
 requestOpen(){if(this.mode!=='open'){this.mode='opening';this.remaining=400;}}
 step(delta:number,occupants:Rect[]=[],suspended=false){
  if(suspended)return this.snapshot();
  const dt=Math.max(0,delta),occupied=occupants.some(r=>overlaps(this.area,r));
  if((this.mode==='warning'||this.mode==='closing')&&occupied){this.mode='warning';this.remaining=1000;this.amount=0;return this.snapshot();}
  this.remaining=Math.max(0,this.remaining-dt);
  if(this.mode==='warning'&&this.remaining===0){this.mode='closing';this.remaining=400;}
  else if(this.mode==='closing'){this.amount=1-this.remaining/400;if(this.remaining===0){this.mode='closed';this.amount=1;}}
  else if(this.mode==='opening'){this.amount=this.remaining/400;if(this.remaining===0){this.mode='open';this.amount=0;}}
  return this.snapshot();
 }
 snapshot(){return {mode:this.mode,remaining:this.remaining,amount:this.amount,solid:this.mode==='closed'};}
}
export type BossMode='ready'|'warnJump'|'jump'|'warnRush'|'rush'|'recover'|'impact'|'defeated';
export type BossSave={phases:number;otto:boolean;rural:boolean};
const freshBoss=():BossSave=>({phases:0,otto:false,rural:false});
export class BossState {
 private progress:BossSave;private mode:BossMode='ready';private elapsed=0;private x:number;private y:number;
 private from=0;private target=0;private attacks=0;private direction=1;private next:'jump'|'rush'='jump';
 get width(){return ['jump','rush','recover','warnJump'].includes(this.mode)?160:125;}
 get height(){return ['jump','rush','recover','warnJump'].includes(this.mode)?108:175;}
 readonly arena:{left:number;right:number;floor:number};
 constructor(arena={left:420,right:1160,floor:540},saved?:BossSave){
  this.arena=arena;
  if(saved&&(!Number.isInteger(saved.phases)||saved.phases<0||saved.phases>3||typeof saved.otto!=='boolean'||typeof saved.rural!=='boolean'||saved.rural&&!saved.otto))throw Error('Estado del jefe inválido');
  this.progress=saved?{...saved}:freshBoss();this.x=arena.right-100;this.y=arena.floor;if(this.progress.phases===3)this.mode='defeated';
 }
 helpOtto(){if(this.mode==='defeated')return false;this.progress.otto=true;return true;}
 solveRural(symbol:number){if(!this.progress.otto||symbol!==1||this.mode==='defeated')return false;this.progress.rural=true;return true;}
 save():BossSave{return {...this.progress};}
 retry(){this.mode=this.progress.phases===3?'defeated':'ready';this.elapsed=0;this.x=this.arena.right-100;this.y=this.arena.floor;this.next='jump';this.attacks=0;}
 private warning(playerX:number){
  this.from=this.x;this.direction=playerX>=this.x?1:-1;
  // Choose a fixed destination with safe edges, never retarget in flight.
  this.target=Math.max(this.arena.left+75,Math.min(this.arena.right-75,this.x+this.direction*380));
  if(this.progress.phases>0){this.target=this.x>(this.arena.left+this.arena.right)/2?this.arena.left+150:this.arena.right-150;this.direction=this.target>this.x?1:-1;}
  this.mode=this.next==='jump'?'warnJump':'warnRush';this.elapsed=0;
 }
 step(delta:number,playerX:number,suspended=false){
  if(suspended||this.mode==='defeated')return this.snapshot();
  // Consume remaining frame time across boundaries; large frame gaps do not shorten warnings.
  let pending=Math.min(250,Math.max(0,delta));
  while(pending>0){
   if(this.mode==='ready'){this.warning(playerX);}
   const mode:BossMode=this.mode;
   const duration=mode==='warnJump'||mode==='warnRush'?1000:mode==='jump'?1400:mode==='rush'?1200:mode==='recover'?2500:mode==='impact'?650:0;
   if(!duration)break;
   const dt=Math.min(pending,duration-this.elapsed);this.elapsed+=dt;pending-=dt;
   if(mode==='jump'){const t=this.elapsed/1400;this.x=this.from+(this.target-this.from)*t;this.y=this.arena.floor-4*350*t*(1-t);}
   if(mode==='rush')this.x=this.from+(this.target-this.from)*this.elapsed/1200;
   if(this.elapsed>=duration){
    this.elapsed=0;
    if(mode==='warnJump')this.mode='jump';
    else if(mode==='warnRush')this.mode='rush';
    else if(mode==='jump'||mode==='rush'){this.x=this.target;this.y=this.arena.floor;this.mode='recover';this.attacks++;}
    else if(mode==='recover'){this.next=this.next==='jump'?'rush':'jump';this.mode='ready';}
    else if(mode==='impact'){this.progress.phases++;this.progress.otto=false;this.progress.rural=false;this.mode=this.progress.phases===3?'defeated':'ready';}
   }
  }
  return this.snapshot();
 }
 stomp(velocityY:number,playerBottom:number){
  const top=this.y-this.height;
  if(this.mode!=='recover'||!this.progress.rural||velocityY<=45||playerBottom>top+34||playerBottom<top-45)return false;
  this.mode='impact';this.elapsed=0;return true;
 }
 snapshot(){return {mode:this.mode,x:this.x,y:this.y,target:this.target,direction:this.direction,elapsed:this.elapsed,attacks:this.attacks,phase:this.progress.phases+1,phasesWon:this.progress.phases,otto:this.progress.otto,rural:this.progress.rural,vulnerable:this.mode==='recover'&&this.progress.rural,body:{x:this.x-this.width/2,y:this.y-this.height,width:this.width,height:this.height},gateCount:Math.min(2,this.progress.phases+1)};}
}
export class JumpingCatState {
 private elapsed=0;private mode:'idle'|'warn'|'jump'|'recover'='idle';private from=0;private target=0;private x:number;private y:number;
 readonly min:number;readonly max:number;readonly floor:number;
 constructor(min:number,max:number,floor:number){this.min=min;this.max=max;this.floor=floor;this.x=min;this.y=floor;}
 step(delta:number,playerX:number,suspended=false){
  if(suspended)return this.snapshot();
  this.elapsed+=Math.max(0,delta);
  if(this.mode==='idle'&&Math.abs(playerX-this.x)<360){this.mode='warn';this.elapsed=0;this.from=this.x;this.target=this.x<(this.min+this.max)/2?this.max:this.min;}
  else if(this.mode==='warn'&&this.elapsed>=1000){this.mode='jump';this.elapsed=0;}
  else if(this.mode==='jump'){const t=Math.min(1,this.elapsed/1000);this.x=this.from+(this.target-this.from)*t;this.y=this.floor-4*180*t*(1-t);if(t===1){this.mode='recover';this.elapsed=0;}}
  else if(this.mode==='recover'&&this.elapsed>=1800){this.mode='idle';this.elapsed=0;}
  return this.snapshot();
 }
 snapshot(){return {mode:this.mode,x:this.x,y:this.y,target:this.target,elapsed:this.elapsed};}
}
export class DuoState {
 private elapsed=0;
 step(delta:number,suspended=false){if(!suspended)this.elapsed+=Math.max(0,delta);return this.snapshot();}
 snapshot(){const t=this.elapsed%6000;return {elapsed:this.elapsed,cat:t<1000?'warn':t<2000?'rush':'recover',dog:t>=3000&&t<4000?'warn':t>=4000&&t<5000?'rush':'recover',safe:t>=2000&&t<3000||t>=5000};}
}

/** Rural's antenna dial: rotate between three orientations, then lock. Wrong locks only give a hint. */
export class AntennaDial {
 private value:0|1|2;
 readonly target:0|1|2;
 constructor(target:0|1|2,start:0|1|2=0){this.target=target;this.value=start===target?((start+1)%3) as 0|1|2:start;}
 get orientation(){return this.value;}
 rotate(step:-1|1){this.value=((this.value+step+3)%3) as 0|1|2;return this.value;}
 lock(){return this.value===this.target;}
}
