import type { RivalMode } from './companion-state.ts';
/** A charge never turns around. Reaching the boundary ends it before recovery. */
export class RunnerState {
 private mode:RivalMode='patrol';private remaining=0;private direction=1;private velocity=0;
 step(delta:number,i:{x:number;playerX:number;playerY:number;floor:number;min:number;max:number;speed:number;suspended?:boolean}) {
  if(i.suspended)return this.snapshot();
  const dt=Math.max(0,delta);this.remaining=Math.max(0,this.remaining-dt);
  if(this.mode==='warn'&&this.remaining===0){this.mode='rush';this.remaining=1200;}
  else if(this.mode==='rush'&&(this.remaining===0||i.x<=i.min||i.x>=i.max)){this.mode='recover';this.remaining=2200;}
  else if(this.mode==='recover'&&this.remaining===0)this.mode='patrol';
  if(this.mode==='patrol') {
   if(i.x<=i.min)this.direction=1;if(i.x>=i.max)this.direction=-1;
   if(Math.abs(i.playerX-i.x)<320&&Math.abs(i.playerY-i.floor)<145&&i.playerX>=i.min&&i.playerX<=i.max){this.direction=i.playerX>=i.x?1:-1;this.mode='warn';this.remaining=900;}
  }
  this.velocity=this.mode==='warn'||this.mode==='recover'?0:this.direction*i.speed*(this.mode==='rush'?2.5:.7);
  if(dt>0)this.velocity=Math.max((i.min-i.x)*1000/dt,Math.min((i.max-i.x)*1000/dt,this.velocity));
  return this.snapshot();
 }
 snapshot(){return {mode:this.mode,remaining:this.remaining,direction:this.direction,velocity:this.velocity};}
}
