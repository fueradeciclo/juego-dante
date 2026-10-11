import Phaser from 'phaser';
import { AmbientPass } from './companion-state.ts';
import { AIRPLANE_WIDTH, AIRPLANE_HEIGHT, paintAirplane } from './ambient-art.ts';

/** Original tiny vector airplane, drawn locally and kept behind the forest and game objects. */
export class AmbientSky {
  private clock=new AmbientPass();
  private plane:Phaser.GameObjects.Image;
  constructor(scene:Phaser.Scene){
    if(!scene.textures.exists('ambient-airplane')){
      const canvas=document.createElement('canvas');canvas.width=AIRPLANE_WIDTH;canvas.height=AIRPLANE_HEIGHT;
      const ctx=canvas.getContext('2d')!;ctx.translate(canvas.width/2,canvas.height/2);paintAirplane(ctx);
      scene.textures.addCanvas('ambient-airplane',canvas);
    }
    this.plane=scene.add.image(0,0,'ambient-airplane').setScrollFactor(0).setDepth(-6.5).setAlpha(.72).setVisible(false);
  }
  update(delta:number,suspended:boolean,reducedMotion:boolean){
    const frame=this.clock.step(delta,suspended,reducedMotion);
    this.plane.setVisible(frame.visible).setPosition(frame.x,frame.y).setScale(frame.direction*1.15,1.15);
  }
  snapshot(){return {...this.clock.snapshot(),visible:this.plane.visible,alpha:this.plane.alpha,depth:this.plane.depth};}
}
