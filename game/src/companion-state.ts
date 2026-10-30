export type RivalMode = 'patrol' | 'warn' | 'rush' | 'recover';
type PatrolInput = { x:number; playerX:number; playerY:number; floor:number; min:number; max:number; speed:number; suspended?:boolean };

/** Short, signalled advances stay inside each rival's original safe platform. */
export class RivalPatrol {
  private mode:RivalMode='patrol';
  private remaining=0;
  private direction=-1;
  private velocity=0;
  step(delta:number,input:PatrolInput) {
    if(input.suspended)return this.snapshot();
    this.remaining=Math.max(0,this.remaining-Math.max(0,delta));
    if(input.x<=input.min)this.direction=1;
    if(input.x>=input.max)this.direction=-1;
    if(this.mode==='warn'&&this.remaining===0){this.mode='rush';this.remaining=850;}
    else if(this.mode==='rush'&&(this.remaining===0||input.x<=input.min||input.x>=input.max)){this.mode='recover';this.remaining=1400;}
    else if(this.mode==='recover'&&this.remaining===0)this.mode='patrol';
    const nearby=Math.abs(input.playerX-input.x)<190&&Math.abs(input.playerY-input.floor)<145&&input.playerX>=input.min&&input.playerX<=input.max;
    if(this.mode==='patrol'&&nearby){this.mode='warn';this.remaining=480;this.direction=input.playerX>=input.x?1:-1;}
    this.velocity=this.mode==='warn'?0:this.direction*input.speed*(this.mode==='rush'?1.6:this.mode==='recover'?.85:1.15);
    // Clamp next movement before it can leave the patrol area, even in a long frame.
    const dt=Math.max(0,delta)/1000;
    if(dt>0)this.velocity=Math.max((input.min-input.x)/dt,Math.min((input.max-input.x)/dt,this.velocity));
    return this.snapshot();
  }
  snapshot(){return {mode:this.mode,remaining:this.remaining,direction:this.direction,velocity:this.velocity};}
}

export type FriendLine = { quien:'otto'|'rural'; texto:string };
export type FriendChats = Record<string,FriendLine[]>;
/** Non-blocking two-way exchanges use active play time, with a long quiet interval. */
export class FriendConversation {
  private wait=20000;
  private age=0;
  private index=0;
  private context='';
  private lines:FriendLine[]=[];
  step(delta:number,context:string,chats:FriendChats,suspended=false):FriendLine|null {
    if(suspended)return this.snapshot();
    const dt=Math.max(0,delta);
    if(this.lines.length&&context!==this.context){this.lines=[];this.wait=60000;}
    if(!this.lines.length){
      this.wait-=dt;
      if(this.wait<=0){this.context=context;this.lines=chats[context]??[];this.index=0;this.age=0;if(!this.lines.length)this.wait=60000;}
    }else {
      this.age+=dt;
      if(this.age>=4800){this.age=0;this.index++;if(this.index>=this.lines.length){this.lines=[];this.wait=60000;}}
    }
    return this.snapshot();
  }
  snapshot(){return this.lines.length&&this.age<4400?this.lines[this.index]??null:null;}
  opacity(){return this.snapshot()?Math.min(1,this.age/300,(4400-this.age)/300):0;}
}

export type FollowPoint={x:number;y:number};
/** Small fixed substeps make acceleration and braking independent of the display rate. */
export class AllyFollower {
  private vx=0;
  private vy=0;
  private facing=1;
  private arrival=1;
  private x:number;
  private y:number;
  constructor(x:number,y:number){this.x=x;this.y=y;}
  reset(point:FollowPoint,fade=false){this.x=point.x;this.y=point.y;this.vx=0;this.vy=0;this.arrival=fade?0:1;}
  step(delta:number,target:FollowPoint,suspended=false) {
    if(suspended)return this.snapshot();
    const dt=Math.min(100,Math.max(0,delta))/1000;
    const steps=Math.max(1,Math.ceil(dt*120)),step=dt/steps;
    for(let i=0;i<steps;i++){
      const axis=(position:number,velocity:number,destination:number,maxSpeed:number,acceleration:number)=>{
        const error=destination-position;
        const desired=Math.max(-maxSpeed,Math.min(maxSpeed,error*12));
        const change=(desired-velocity)*(1-Math.exp(-18*step));
        const next=velocity+Math.max(-acceleration*step,Math.min(acceleration*step,change));
        const value=position+(velocity+next)*.5*step;
        if(Math.abs(error)<.1&&Math.abs(next)<2)return {position:destination,velocity:0};
        return {position:value,velocity:next};
      };
      const horizontal=axis(this.x,this.vx,target.x,420,2200),vertical=axis(this.y,this.vy,target.y,780,4200);
      this.x=horizontal.position;this.vx=horizontal.velocity;this.y=vertical.position;this.vy=vertical.velocity;
    }
    if(Math.abs(this.vx)>35)this.facing=this.vx>0?1:-1;
    this.arrival=Math.min(1,this.arrival+dt/.35);
    return this.snapshot();
  }
  snapshot(){return {x:this.x,y:this.y,vx:this.vx,vy:this.vy,facing:this.facing,alpha:this.arrival};}
}

/** Formation changes gradually on reversal; there is no threshold that swaps front/back. */
export function allyTarget(player:FollowPoint,direction:number,index:number,width:number):FollowPoint {
  // Wide enough that Otto and Rural never hide behind Pattha (104 px wide) or each other (61 px).
  const spacing=92+index*70;
  const smooth=(t:number)=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v);};
  let offset=-direction*spacing;
  offset+=Math.max(0,direction)*spacing*2*(1-smooth((player.x-130)/220));
  offset-=Math.max(0,-direction)*spacing*2*(1-smooth((width-130-player.x)/220));
  return {x:Math.max(35,Math.min(width-35,player.x+offset)),y:player.y};
}

export class AmbientPass {
  private elapsed=0;
  step(delta:number,suspended=false,reducedMotion=false){if(!suspended&&!reducedMotion)this.elapsed+=Math.max(0,delta);return this.snapshot(reducedMotion);}
  snapshot(reducedMotion=false){
    const age=this.elapsed-1600,cycle=Math.max(0,Math.floor(age/26000)),progress=(age%26000)/16000;
    const direction=cycle%2===0?1:-1;
    return {elapsed:this.elapsed,visible:!reducedMotion&&age>=0&&progress<1,direction,x:direction>0?-60+1400*progress:1340-1400*progress,y:76+(cycle%2)*8+Math.sin(progress*Math.PI)*4};
  }
  /** A manual gallery preview starts just inside the sky; it never affects the game clock. */
  startPass(){this.elapsed=3100;}
}
