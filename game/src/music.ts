import type { Mode } from './ui.ts';

/** Family-selected recording, served locally with the game. */
export class AdventureMusic {
 private audio=new Audio(`${import.meta.env.BASE_URL}assets/audio/pattha-main-theme-v1.mp3`);
 private fallback=false;
 private volume=.22;
 private muted=false;
 private mode: Mode='menu';
 private blocked=false;
 private unlocked=false;
 constructor() {
  this.audio.addEventListener('error',()=>{
   if(this.fallback){console.warn('[PATTHA audio] Tampoco pudo cargarse el respaldo.');return;}
   this.fallback=true;console.warn('[PATTHA audio] Falló la música oficial; usando Triumph in Steel.');
   this.audio.src=`${import.meta.env.BASE_URL}assets/audio/triumph-in-steel.mp3`;this.audio.load();this.sync();
  });
  this.audio.loop=true;
  this.audio.preload='metadata';
  const button=document.getElementById('music-toggle') as HTMLButtonElement;
  const slider=document.getElementById('music-volume') as HTMLInputElement;
  button.onclick=()=>{this.muted=!this.muted;button.textContent=this.muted?'♫ Activar':'♫ Silenciar';button.setAttribute('aria-pressed',String(this.muted));this.unlock();};
  slider.oninput=()=>{this.volume=Number(slider.value)/100;this.unlock();};
  document.addEventListener('pointerdown',()=>this.unlock());
  document.addEventListener('keydown',()=>this.unlock());
 }
 restart(){this.audio.pause();this.audio.currentTime=0;}
 private unlock(){this.unlocked=true;this.sync();}
 setState(mode: Mode, blocked: boolean) {
  if(mode==='menu'&&this.mode!=='menu')this.audio.currentTime=0;
  this.mode=mode;this.blocked=blocked;this.sync();
 }
 private sync(){
  this.audio.muted=this.muted;
  this.audio.volume=this.volume*(this.mode==='dialogue'||this.mode==='puzzle'?.3:1);
  if(this.blocked||this.mode==='menu'||this.mode==='paused')this.audio.pause();
  else if(this.unlocked&&this.audio.paused)void this.audio.play().catch(()=>{
   // A later interaction retries playback when the browser blocks autoplay.
  });
 }
}
