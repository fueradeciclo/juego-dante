import type { Mode } from './ui.ts';

/** Original instrumental sketch: 64 bars at 150 BPM. No recordings or external samples. */
export class AdventureMusic {
 private context?: AudioContext;
 private output?: GainNode;
 private timer?: ReturnType<typeof setInterval>;
 private step=0;
 private next=0;
 private volume=.22;
 private muted=false;
 private mode: Mode='menu';
 private blocked=false;
 private noise?: AudioBuffer;
 constructor() {
  const button=document.getElementById('music-toggle') as HTMLButtonElement;
  const slider=document.getElementById('music-volume') as HTMLInputElement;
  button.onclick=()=>{this.muted=!this.muted;button.textContent=this.muted?'♫ Activar':'♫ Silenciar';button.setAttribute('aria-pressed',String(this.muted));this.unlock();this.level();};
  slider.oninput=()=>{this.volume=Number(slider.value)/100;this.unlock();this.level();};
  document.addEventListener('pointerdown',()=>this.unlock());
  document.addEventListener('keydown',()=>this.unlock());
 }
 private unlock() {
  if(!this.context){
   this.context=new AudioContext();this.output=this.context.createGain();this.output.gain.value=0;this.output.connect(this.context.destination);
   this.noise=this.context.createBuffer(1,this.context.sampleRate,this.context.sampleRate);
   const samples=this.noise.getChannelData(0);let seed=42;
   for(let i=0;i<samples.length;i++){seed=(1664525*seed+1013904223)>>>0;samples[i]=seed/2147483648-1;}
   this.next=this.context.currentTime+.05;
   this.timer=setInterval(()=>this.schedule(),25);
  }
  if(!this.blocked&&this.mode!=='menu'&&this.mode!=='paused')void this.context.resume().catch(()=>{});
  this.level();
 }
 setState(mode: Mode, blocked: boolean) {
  this.mode=mode;this.blocked=blocked;
  if(this.context){
   if(blocked||mode==='paused'||mode==='menu')void this.context.suspend().catch(()=>{});
   else {this.next=Math.max(this.next,this.context.currentTime+.02);void this.context.resume().catch(()=>{});}
  }
  this.level();
 }
 private level(){if(this.output&&this.context)this.output.gain.setTargetAtTime(this.muted||this.blocked||this.mode==='menu'||this.mode==='paused'?0:this.volume*(this.mode==='dialogue'||this.mode==='puzzle'?.3:1),this.context.currentTime,.1);}
 private tone(midi:number,time:number,duration:number,gain:number,guitar=false){
  const c=this.context!,o=c.createOscillator(),amp=c.createGain();o.type=guitar?'sawtooth':'triangle';o.frequency.value=440*2**((midi-69)/12);
  amp.gain.setValueAtTime(0,time);amp.gain.linearRampToValueAtTime(gain,time+.006);amp.gain.exponentialRampToValueAtTime(.0001,time+duration);
  if(guitar){const distortion=c.createWaveShaper(),curve=new Float32Array(512);for(let i=0;i<512;i++){const x=i/255.5-1;curve[i]=Math.tanh(x*4);}distortion.curve=curve;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=2600;o.connect(distortion);distortion.connect(filter);filter.connect(amp);}else o.connect(amp);
  amp.connect(this.output!);o.start(time);o.stop(time+duration+.02);o.onended=()=>{o.disconnect();amp.disconnect();};
 }
 private drum(time:number,kind:'kick'|'snare'|'hat'){
  const c=this.context!,amp=c.createGain();amp.connect(this.output!);
  const length=kind==='hat'?.055:kind==='snare'?.16:.2;
  amp.gain.setValueAtTime(kind==='kick'?.65:kind==='snare'?.28:.09,time);amp.gain.exponentialRampToValueAtTime(.0001,time+length);
  if(kind==='kick'){const o=c.createOscillator();o.frequency.setValueAtTime(140,time);o.frequency.exponentialRampToValueAtTime(45,time+.13);o.connect(amp);o.start(time);o.stop(time+length);}
  else {const source=c.createBufferSource();source.buffer=this.noise!;const filter=c.createBiquadFilter();filter.type='highpass';filter.frequency.value=kind==='hat'?6500:1200;source.connect(filter);filter.connect(amp);source.start(time);source.stop(time+length);}
 }
 private schedule(){
  const c=this.context!;if(c.state!=='running')return;
  if(this.next<c.currentTime)this.next=c.currentTime+.02;
  while(this.next<c.currentTime+.12){
   const s=this.step%1024,bar=Math.floor(s/16),beat=s%16,t=this.next;
   const root=[40,36,43,38][Math.floor(bar/2)%4];
   const build=bar>=24&&bar<32;const epic=bar>=32;
   if(beat%2===0){this.tone(root-12,t,.18,.3);this.tone(root,t,.12,.10,true);this.tone(root+7,t,.12,.07,true);this.drum(t,'hat');}
   if(beat===0||beat===8||(epic&&[2,6,10,14].includes(beat)))this.drum(t,'kick');
   if(beat===4||beat===12||(build&&bar>=30&&beat%2===0))this.drum(t,'snare');
   if(bar>=8&&beat%4===0){const melody=[12,15,19,22,19,15,17,14];this.tone(root+melody[(Math.floor(beat/4)+(bar%2)*4)%8],t,.36,epic?.12:.08,true);}
   this.step++;this.next+=.1;
  }
 }
}
