import { readFlag, saveFlag, SOUND_KEY } from './preferences.ts';

/** Original synthesized cues: no files, samples or network. Each tone: [from Hz, to Hz, start s, length s, wave, gain]. */
export type Cue='coin'|'jump'|'stomp'|'bump'|'checkpoint'|'gear'|'success'|'rotate'|'retry'|'celebrate';
type Tone=[number,number,number,number,OscillatorType,number];
export const CUES:Record<Cue,Tone[]>={
 coin:[[988,988,0,.06,'square',.18],[1319,1319,.055,.12,'square',.18]],
 jump:[[260,520,0,.13,'triangle',.28]],
 stomp:[[520,780,0,.08,'square',.16],[780,1040,.07,.1,'square',.14]],
 bump:[[330,220,0,.16,'sine',.3]],
 checkpoint:[[659,659,0,.1,'triangle',.25],[784,784,.09,.1,'triangle',.25],[1047,1047,.18,.2,'triangle',.25]],
 gear:[[440,880,0,.18,'triangle',.25],[1175,1175,.16,.14,'square',.12]],
 success:[[523,523,0,.12,'triangle',.25],[659,659,.11,.12,'triangle',.25],[784,784,.22,.12,'triangle',.25],[1047,1047,.33,.3,'triangle',.28]],
 rotate:[[600,700,0,.06,'square',.1]],
 retry:[[392,330,0,.18,'sine',.22]],
 celebrate:[[523,523,0,.14,'square',.16],[659,659,.13,.14,'square',.16],[784,784,.26,.14,'square',.16],[1047,1047,.39,.14,'square',.16],[784,784,.52,.1,'square',.14],[1047,1047,.62,.45,'square',.18]],
};
export class SoundEffects {
 private context?:AudioContext;
 private enabled=readFlag(SOUND_KEY)??true;
 private volume=.5;
 private button?:HTMLButtonElement|null;
 constructor(button?:HTMLButtonElement|null) {
  this.button=button;
  this.render();
  if(button)button.onclick=()=>{this.enabled=!this.enabled;saveFlag(SOUND_KEY,this.enabled);this.render();this.unlock();if(this.enabled)this.play('rotate');};
  // Browsers only start audio after a gesture; the context is created on the first one.
  document.addEventListener('pointerdown',()=>this.unlock());
  document.addEventListener('keydown',()=>this.unlock());
 }
 get on(){return this.enabled;}
 private render(){if(!this.button)return;this.button.textContent=this.enabled?'Sonidos: sí':'Sonidos: no';this.button.setAttribute('aria-pressed',String(!this.enabled));}
 private unlock(){
  if(!this.enabled)return;
  try{this.context??=new AudioContext();if(this.context.state==='suspended')void this.context.resume();}catch{/* Without Web Audio the game stays silent. */}
 }
 play(cue:Cue){
  const ctx=this.context;if(!this.enabled||!ctx||ctx.state!=='running'||document.hidden)return;
  const start=ctx.currentTime+.01;
  for(const [from,to,offset,length,wave,gain]of CUES[cue]){
   const osc=ctx.createOscillator(),amp=ctx.createGain(),t=start+offset;
   osc.type=wave;osc.frequency.setValueAtTime(from,t);osc.frequency.linearRampToValueAtTime(to,t+length);
   amp.gain.setValueAtTime(0,t);amp.gain.linearRampToValueAtTime(gain*this.volume,t+.01);amp.gain.exponentialRampToValueAtTime(.001,t+length);
   osc.connect(amp).connect(ctx.destination);osc.start(t);osc.stop(t+length+.02);
  }
 }
}
