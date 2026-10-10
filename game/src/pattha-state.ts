import { AnimationClock, type AnimationFrame, type AnimationInput } from './animation-state.ts';

export type PatthaPose = 'idle'|'blink'|'breathe'|'run'|'stop'|'crouch'|'takeoff'|'rise'|'apex'|'fall'|'land'|'recover'|'rebound'|'think'|'bored'|'help'|'celebrate'|'hurt';
export type PatthaSheet = 'carrera'|'salto'|'reposo';
export type PatthaInput = AnimationInput & { vy?:number; grounded?:boolean; crouching?:boolean; takingOff?:boolean; rebounding?:boolean; helping?:boolean; celebrating?:boolean; hurt?:boolean };
export type PatthaFrame = AnimationFrame & { pose:PatthaPose; sheet:PatthaSheet; index:number; footOffset:number; eyeFrame:number };
const poses:Record<Exclude<PatthaPose,'run'>,[PatthaSheet,number]>={
  idle:['reposo',0],blink:['reposo',1],breathe:['reposo',2],think:['reposo',3],bored:['reposo',5],help:['reposo',6],celebrate:['reposo',7],
  stop:['salto',6],crouch:['salto',0],takeoff:['salto',1],rise:['salto',2],apex:['salto',3],fall:['salto',4],land:['salto',5],recover:['salto',6],rebound:['salto',7],hurt:['salto',4],
};

/** Hero-specific drawn poses; physical velocity determines ascent/fall, never a timed fake jump. */
export class PatthaClock {
  readonly idleClock:AnimationClock;
  private stride=0;
  private wasAirborne=false;
  private wasMoving=false;
  private landing=0;
  private stopping=0;
  private frame:PatthaFrame={state:'idle',elapsed:0,idleMs:0,phase:0,blink:0,gesture:0,motion:1,pose:'idle',sheet:'reposo',index:0,footOffset:0,eyeFrame:0};
  constructor(seed=0) { this.idleClock=new AnimationClock(seed); }
  step(delta:number,input:PatthaInput):PatthaFrame {
    if(input.suspended)return this.frame;
    const dt=Math.max(0,Number.isFinite(delta)?delta:0);
    const air=input.grounded===undefined?Boolean(input.airborne):!input.grounded;
    const moving=Math.abs(input.speed)>9;
    const base=this.idleClock.step(dt,{...input,airborne:air||input.crouching});
    this.landing=Math.max(0,this.landing-dt);this.stopping=Math.max(0,this.stopping-dt);
    if(this.wasAirborne&&!air&&!input.crouching)this.landing=moving?95:165;
    if(this.wasMoving&&!moving&&!air)this.stopping=100;
    if(moving&&!air)this.stride+=Math.abs(input.speed)*dt/1000/21;
    let pose:PatthaPose;
    if(input.crouching)pose='crouch';
    else if(input.hurt)pose='hurt';
    else if(input.rebounding&&air)pose='rebound';
    else if(input.takingOff&&air)pose='takeoff';
    else if(air)pose=(input.vy??0)<-90?'rise':(input.vy??0)>90?'fall':'apex';
    else if(input.celebrating)pose='celebrate';
    else if(input.helping)pose='help';
    else if(this.landing>0)pose=this.landing>65?'land':'recover';
    else if(moving)pose='run';
    else if(this.stopping>0)pose='stop';
    else if(base.state==='think'&&base.gesture>.12)pose='think';
    else if(base.state==='bored'&&base.gesture>.12)pose='bored';
    else if(base.blink>.3)pose='blink';
    else pose='idle';
    let [sheet,index]=pose==='run'?['carrera' as const,Math.floor(this.stride)%8]:poses[pose];
    if(pose==='think'&&base.blink>.3)index=4;
    const footOffset=pose==='rise'?-22:pose==='apex'?-10:0;
    this.frame={...base,pose,sheet,index,footOffset,eyeFrame:pose==='blink'||(pose==='think'&&index===4)?2:pose==='bored'?1:0};
    this.wasAirborne=air;this.wasMoving=moving;
    return this.frame;
  }
  snapshot() { return this.frame; }
}

/** A short, pausable preparation. Edge/coyote jumps launch immediately. */
export class JumpPreparation {
  private remaining=-1;
  begin(grounded:boolean) { if(this.remaining<0)this.remaining=grounded?64:0; }
  step(delta:number,suspended=false):boolean {
    if(suspended||this.remaining<0)return false;
    this.remaining-=Math.max(0,delta);
    if(this.remaining>0)return false;
    this.remaining=-1;return true;
  }
  get crouching() { return this.remaining>=0; }
  cancel() { this.remaining=-1; }
}
