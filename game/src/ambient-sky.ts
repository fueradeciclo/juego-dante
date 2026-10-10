import Phaser from 'phaser';
import { AmbientPass } from './companion-state.ts';

/** Original tiny vector airplane. No textures, audio, interaction, or external assets. */
export class AmbientSky {
  private clock=new AmbientPass();
  private plane:Phaser.GameObjects.Container;
  constructor(scene:Phaser.Scene){
    const shape=scene.add.graphics();
    shape.fillStyle(0x718f8b).fillRoundedRect(-22,-3,43,7,3);
    shape.fillTriangle(-17,-2,-24,-12,-22,1);
    shape.fillStyle(0x9fae99).fillTriangle(-6,0,6,-14,11,-1).fillTriangle(-4,1,7,13,12,2);
    shape.fillStyle(0xb4c8b9).fillRoundedRect(5,-6,9,5,2);
    shape.lineStyle(1.5,0x718f8b).lineBetween(24,-7,24,7);
    this.plane=scene.add.container(0,0,[shape]).setScrollFactor(0).setDepth(-9).setAlpha(.42).setVisible(false);
  }
  update(delta:number,suspended:boolean,reducedMotion:boolean){
    const frame=this.clock.step(delta,suspended,reducedMotion);
    this.plane.setVisible(frame.visible).setPosition(frame.x,frame.y).setScale(frame.direction,1);
  }
  snapshot(){return {...this.clock.snapshot(),visible:this.plane.visible};}
}
