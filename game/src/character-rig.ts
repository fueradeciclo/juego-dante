import Phaser from 'phaser';
import { AnimationClock, type AnimationInput } from './animation-state.ts';
import { blinkFrame, partPose, prepareRig, rigPose, rivalBrows, vanishPuffs, type CharacterKind, type PreparedPart } from './character-art.ts';

type Host = Phaser.GameObjects.Image | Phaser.Physics.Arcade.Sprite;
export class CharacterRig {
  readonly clock:AnimationClock;
  readonly root:Phaser.GameObjects.Container;
  private layers:{image:Phaser.GameObjects.Image;part:PreparedPart;keys:string[]}[]=[];
  private bubble:Phaser.GameObjects.Graphics;
  private expression:Phaser.GameObjects.Graphics;
  private definition;
  constructor(scene:Phaser.Scene, readonly host:Host, readonly kind:CharacterKind, seed:number) {
    this.clock=new AnimationClock(seed);
    const rig=prepareRig(kind,scene.textures.get(kind).getSourceImage() as HTMLImageElement);
    this.definition=rig.definition;
    this.root=scene.add.container(host.x,host.y).setDepth(host.depth);
    host.setVisible(false);
    for(const part of rig.parts) {
      const canvases=part.blinkCanvases??[part.canvas];
      const keys=canvases.map((canvas,i)=>{
        const key=`rig-${kind}-${part.name}-${i}`;
        if(!scene.textures.exists(key))scene.textures.addCanvas(key,canvas);
        return key;
      });
      const [x,y,w,h]=part.box;
      const image=scene.add.image(0,0,keys[0]).setOrigin((part.pivot[0]-x)/w,(part.pivot[1]-y)/h);
      this.root.add(image);this.layers.push({image,part,keys});
    }
    this.expression=scene.add.graphics();this.root.add(this.expression);
    this.bubble=scene.add.graphics();this.root.add(this.bubble);
    host.once(Phaser.GameObjects.Events.DESTROY,()=>this.root.destroy());
    this.update(0,{speed:0});
  }
  update(delta:number,input:AnimationInput) {
    const frame=this.clock.step(delta,input);
    const [bx,by,bw,bh]=this.definition.bounds;
    const body=rigPose(this.kind,frame);
    this.root.setPosition(this.host.x,this.host.y+body.y*this.host.displayHeight).setAlpha(this.host.alpha*body.alpha).setRotation(body.angle);
    this.root.setScale(this.host.displayWidth/bw*(this.host.flipX?-1:1)*body.scaleX,this.host.displayHeight/bh*body.scaleY);
    for(const {image,part,keys} of this.layers) {
      const pose=partPose(part.name,frame,this.kind),[,,w,h]=part.box;
      image.setTexture(keys[part.name==='head'?blinkFrame(frame):0]);
      image.setPosition(part.pivot[0]-bx-bw/2+pose.x,part.pivot[1]-by-bh+pose.y).setRotation(pose.angle);
      image.setScale(w/image.frame.width*pose.scaleX,h/image.frame.height*pose.scaleY);
    }
    this.bubble.clear();
    this.expression.clear();
    if((this.kind==='gato'||this.kind==='perro')&&frame.state!=='vanish') {
      const [hx,hy]=this.definition.parts.head!.pivot,head=partPose('head',frame,this.kind);
      this.expression.setPosition(hx-bx-bw/2+head.x,hy-by-bh+head.y).setRotation(head.angle);
      this.expression.lineStyle(bh*.009,0x4b352c,1);
      for(const brow of rivalBrows(this.definition))this.expression.lineBetween(brow.x1,brow.y1,brow.x2,brow.y2);
    }
    for(const puff of vanishPuffs(frame,bw,bh))this.bubble.fillStyle(0xfff6d7,puff.alpha).fillCircle(puff.x,puff.y,puff.r);
    if(frame.state==='alert') {
      // A steady warning, without flashes or a sudden sound.
      this.bubble.lineStyle(bh*.012,0x7b473b,1).lineBetween(-bw*.08,-bh*1.14,-bw*.08,-bh*1.04);
      this.bubble.fillStyle(0x7b473b).fillCircle(-bw*.08,-bh*.995,bh*.009);
    }
    if(frame.state==='think'&&frame.gesture>.1) {
      const x=-bw*.24,y=-bh*1.04,r=bh*.032;
      this.bubble.fillStyle(0xf9fff0,frame.gesture).lineStyle(bh*.005,0x47685b,frame.gesture);
      this.bubble.fillEllipse(x,y,r*4.4,r*3).strokeEllipse(x,y,r*4.4,r*3);
      for(const [cx,cy,cr] of [[x+r*.65,y+r*1.8,r*.36],[x+r,y+r*2.7,r*.22]])this.bubble.fillCircle(cx,cy,cr).strokeCircle(cx,cy,cr);
      this.bubble.fillStyle(0x47685b,frame.gesture);
      for(const dx of [-.9,0,.9])this.bubble.fillCircle(x+dx*r,y,r*.17);
    }
  }
  snapshot() {
    const frame=this.clock.snapshot();
    return {kind:this.kind,x:this.host.x,y:this.host.y,visualY:this.root.y,alpha:this.root.alpha,...frame,eyeFrame:blinkFrame(frame),leftLeg:partPose('leftLeg',frame,this.kind).angle,rightLeg:partPose('rightLeg',frame,this.kind).angle};
  }
}
