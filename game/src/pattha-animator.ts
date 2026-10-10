import Phaser from 'phaser';
import { PatthaClock, type PatthaInput, type PatthaSheet } from './pattha-state.ts';
import { patthaAtlas, preparePattha, patthaBreath } from './pattha-art.ts';

export class PatthaAnimator {
  readonly clock=new PatthaClock();
  readonly kind='pattha';
  readonly root:Phaser.GameObjects.Container;
  private sprite:Phaser.GameObjects.Image;
  constructor(scene:Phaser.Scene,readonly host:Phaser.Physics.Arcade.Sprite) {
    const sheets={} as Record<PatthaSheet,HTMLImageElement>;
    for(const key of ['carrera','salto','reposo'] as PatthaSheet[])sheets[key]=scene.textures.get('pattha-'+key).getSourceImage() as HTMLImageElement;
    const art=preparePattha(sheets);
    for(const [sheet,frames]of Object.entries(art.frames))for(const [i,canvas]of frames.entries()) {
      const key=`pattha-v3-${sheet}-${i}`;if(!scene.textures.exists(key))scene.textures.addCanvas(key,canvas);
    }
    this.root=scene.add.container(host.x,host.y).setDepth(host.depth);host.setVisible(false);
    this.sprite=scene.add.image(0,0,'pattha-v3-reposo-0').setOrigin(.5,patthaAtlas.baseline/patthaAtlas.canvasHeight);
    this.root.add(this.sprite);host.once(Phaser.GameObjects.Events.DESTROY,()=>this.root.destroy());
    this.update(0,{speed:0,grounded:true});
  }
  update(delta:number,input:PatthaInput) {
    const frame=this.clock.step(delta,input),scale=this.host.displayHeight/patthaAtlas.referenceHeight,breath=patthaBreath(frame);
    this.root.setPosition(this.host.x,this.host.y).setAlpha(this.host.alpha).setScale(this.host.flipX?-scale:scale,scale);
    this.sprite.setTexture(`pattha-v3-${frame.sheet}-${frame.index}`).setPosition(0,frame.footOffset).setScale(1-breath,1+breath);
  }
  snapshot() { return {kind:this.kind,x:this.host.x,y:this.host.y,...this.clock.snapshot()}; }
}
