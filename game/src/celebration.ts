import Phaser from 'phaser';
type Piece={x:number;y:number;vx:number;vy:number;spin:number;angle:number;color:number;age:number};
const COLORS=[0xffc766,0x3f8fd8,0x9bd35a,0xfff3ce,0xe98b5a];

/** Chapter-end confetti. Pauses with the game; reduced motion shows a still burst of stars instead. */
export class Celebration {
 private pieces:Piece[]=[];
 private graphics:Phaser.GameObjects.Graphics;
 private still=0;
 private stillAt={x:0,y:0};
 constructor(private scene:Phaser.Scene){this.graphics=scene.add.graphics().setDepth(9);}
 burst(x:number,y:number,reducedMotion:boolean){
  if(reducedMotion){this.still=1800;this.stillAt={x,y};return;}
  for(let i=0;i<70;i++){const a=-Math.PI/2+(Math.random()-.5)*1.9,s=380+Math.random()*420;this.pieces.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,spin:(Math.random()-.5)*12,angle:Math.random()*6,color:COLORS[i%COLORS.length],age:0});}
 }
 get active(){return this.pieces.length>0||this.still>0;}
 update(delta:number,suspended:boolean){
  if(suspended)return;
  const dt=delta/1000;this.graphics.clear();
  if(this.still>0){
   this.still=Math.max(0,this.still-delta);
   for(let i=0;i<8;i++){const a=i*Math.PI/4;this.graphics.fillStyle(COLORS[i%COLORS.length],.9).fillCircle(this.stillAt.x+Math.cos(a)*70,this.stillAt.y+Math.sin(a)*45,6);}
  }
  this.pieces=this.pieces.filter(p=>{p.age+=delta;return p.age<2200&&p.y<this.scene.cameras.main.scrollY+760;});
  for(const p of this.pieces){
   p.vy+=900*dt;p.vx*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt;p.angle+=p.spin*dt;
   const w=9*Math.abs(Math.cos(p.angle))+2;
   this.graphics.fillStyle(p.color,Math.min(1,(2200-p.age)/400)).fillRect(p.x-w/2,p.y-4,w,8);
  }
 }
}
