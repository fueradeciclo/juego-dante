import Phaser from 'phaser';
type Puff={x:number;y:number;age:number;life:number;direction:number;radius:number};

/** Lightweight dust: no physics, timers, network textures or particles that advance during a pause. */
export class JumpDust {
  private puffs:Puff[]=[];
  private graphics:Phaser.GameObjects.Graphics;
  constructor(scene:Phaser.Scene) { this.graphics=scene.add.graphics().setDepth(3); }
  emit(x:number,y:number,landing=false) {
    for(const direction of [-1,1])for(let i=0;i<3;i++)this.puffs.push({x:x+direction*(5+i*5),y:y-2,age:0,life:landing?240:340,direction:direction*(.6+i*.3),radius:3.2+i*.8});
    this.puffs=this.puffs.slice(-36);
  }
  update(delta:number,suspended:boolean,reducedMotion:boolean) {
    if(suspended)return;
    if(reducedMotion)this.puffs=[];
    this.graphics.clear();
    this.puffs=this.puffs.filter(p=>{p.age+=delta;return p.age<p.life;});
    for(const p of this.puffs) {
      const t=p.age/p.life,x=p.x+p.direction*t*17,y=p.y-Math.sin(t*Math.PI/2)*9,r=p.radius*(1+t*.6);
      this.graphics.fillStyle(0xf0e2c2,(1-t)*.32).fillEllipse(x,y,r*2.1,r*1.2);
    }
  }
  snapshot() { return this.puffs.map(({x,y,age,life})=>({x,y,age,life})); }
}
