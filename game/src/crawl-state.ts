export type CrouchPhase = 'stand'|'lower'|'low'|'rise';
export type CrouchFrame = {phase:CrouchPhase;amount:number;blocked:boolean};
export type BodyRect = {left:number;right:number;top:number;bottom:number};

/** Touching the floor is safe; any overlap with the standing volume blocks getting up. */
export function hasHeadroom(standing:BodyRect,solids:BodyRect[]):boolean {
 return !solids.some(s=>standing.left<s.right-.5&&standing.right>s.left+.5&&standing.top<s.bottom-.5&&standing.bottom>s.top+.5);
}

/** Reversible transitions, using active game time. Releasing under a roof keeps the low pose. */
export class CrawlPosture {
 private frame:CrouchFrame={phase:'stand',amount:0,blocked:false};
 step(delta:number,input:{held:boolean;grounded:boolean;headroom:boolean;suspended?:boolean}):CrouchFrame {
  if(input.suspended)return this.frame;
  const {amount}=this.frame;
  const blocked=amount>0&&!input.headroom;
  const low=(input.held&&(input.grounded||amount>0))||blocked;
  const next=blocked?1:Math.max(0,Math.min(1,amount+(low?1:-1)*Math.max(0,delta)/180));
  this.frame={amount:next,blocked,phase:next===0?'stand':next===1?'low':low?'lower':'rise'};
  return this.frame;
 }
 snapshot() {return this.frame;}
 reset() {this.frame={phase:'stand',amount:0,blocked:false};}
}
