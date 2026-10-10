import Phaser from 'phaser';
import { Adventure } from './adventure.ts';
import { Controls } from './input.ts';
import { DemoUI } from './ui.ts';
import { animatePortraits } from './portraits.ts';
import './style.css';

const ui=new DemoUI();
animatePortraits();
const controls=new Controls(()=>ui.mode==='playing'&&!ui.portrait,e=>ui.shortcut(e));
new Phaser.Game({
 type:Phaser.AUTO,parent:'game',width:1280,height:720,backgroundColor:'#dfeddd',
 scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
 physics:{default:'arcade',arcade:{gravity:{x:0,y:1500},debug:false}},
 render:{antialias:true,pixelArt:false,roundPixels:false},
 scene:[new Adventure(ui,controls)],
 audio:{noAudio:true},
});
