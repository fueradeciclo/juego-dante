import { Narration } from './narration.ts';
import recordings from '../../assets/audio/narracion/MANIFEST.json';
import { AdventureMusic } from './music.ts';
import { readAirplaneChoice, saveAirplaneChoice } from './ambient-preference.ts';
import type { SymbolId, LevelScore, ScoreRules } from './rules.ts';
export type Mode = 'menu'|'playing'|'dialogue'|'puzzle'|'paused'|'won';
export type Line = { quien: string; texto: string; voz_id?:string };
type Actions = { continue:()=>void;next:()=>void; restart: (autostart: boolean) => void; setPaused: (paused: boolean) => void; resetInput: () => void };
const get = <T extends HTMLElement=HTMLElement>(id: string) => document.getElementById(id) as T;
export class DemoUI {
 private music=new AdventureMusic();
 private voice=new Narration(message=>this.toast(message));
 private clueVoice?:string;
 private recording(id?:string):string|undefined {return id?(recordings.disponibles as Record<string,string>)[id]:undefined;}
 mode: Mode = 'menu';
 portrait = false;
 touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
 private skyReduced=matchMedia('(prefers-reduced-motion: reduce)');
 private airplaneChoice=readAirplaneChoice();
 get airplanesEnabled(){return this.airplaneChoice??!this.skyReduced.matches;}
 private syncAirplanes(){document.querySelectorAll<HTMLInputElement>('[data-airplanes-toggle]').forEach(input=>input.checked=this.airplanesEnabled);}
 private pausedFrom: Mode = 'playing';
 private actions?: Actions;
 private lines: Line[] = [];
 private lineIndex=0;
 private afterDialogue=()=>{};
 private symbolHandler?: (s: SymbolId)=>void;
 private toastTimer?: ReturnType<typeof setTimeout>;
 private previousFocus?: HTMLElement;
 private sphereTotal=0;
 private scoreRules!: ScoreRules;
 constructor() {
  this.syncAirplanes();
  this.skyReduced.addEventListener('change',()=>this.syncAirplanes());
  document.querySelectorAll<HTMLInputElement>('[data-airplanes-toggle]').forEach(input=>input.onchange=()=>{
   this.airplaneChoice=input.checked;saveAirplaneChoice(input.checked);this.syncAirplanes();
  });
  get('campaign-continue').onclick=()=>this.actions?.continue();
  get('next-chapter').onclick=()=>this.actions?.next();
  get('repeat-voice').onclick=()=>this.voice.repeat();
  get('repeat-clue').onclick=()=>this.voice.play(this.clueVoice);
  if(!Object.keys(recordings.disponibles).length){get<HTMLButtonElement>('voice-toggle').disabled=true;get('voice-toggle').textContent='Voz: pendiente';get('voice-toggle').title='Faltan las grabaciones del adulto. Podés jugar con texto.';}
  get('voice-toggle').onclick=()=>{const muted=this.voice.toggle();get('voice-toggle').textContent=muted?'Voz: apagada':'Voz: activada';get('voice-toggle').setAttribute('aria-pressed',String(muted));};
  get('play').onclick=()=>{this.music.restart();this.actions?.restart(true);};
  get('restart').onclick=()=>{this.music.restart();this.actions?.restart(true);};
  get('replay').onclick=()=>{this.music.restart();this.actions?.restart(true);};
  get('back').onclick=()=>this.actions?.restart(false);
  get('win-back').onclick=()=>this.actions?.restart(false);
  get('pause').onclick=()=>this.pause();
  get('resume').onclick=()=>this.resume();
  get('continue').onclick=()=>this.nextLine();
  get<HTMLInputElement>('touch-toggle').checked=this.touch;
  get('touch-toggle').onchange=e=>{this.touch=(e.target as HTMLInputElement).checked;this.render();};
  document.querySelectorAll<HTMLButtonElement>('[data-symbol]').forEach(b=>b.onclick=()=>this.symbolHandler?.(Number(b.dataset.symbol) as SymbolId));
  get('fullscreen').onclick=async()=>{
   const stage=get('stage');
   try { if (document.fullscreenElement) await document.exitFullscreen(); else { await stage.requestFullscreen(); const o=screen.orientation as ScreenOrientation & {lock?:(s:string)=>Promise<void>}; await o.lock?.('landscape').catch(()=>{}); } } catch { this.toast('Si no se abre la pantalla completa, podés jugar igual.'); }
  };
  window.addEventListener('resize',()=>this.orientation());
  window.addEventListener('blur',()=>{if(this.mode==='playing')this.pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden && this.mode!=='menu' && this.mode!=='won')this.pause();});
  document.addEventListener('keydown', e=>{
   if(e.code!=='Tab' || !['dialogue','puzzle','paused','won'].includes(this.mode))return;
   const id={dialogue:'dialogue',puzzle:'puzzle',paused:'paused',won:'won'}[this.mode as 'dialogue'|'puzzle'|'paused'|'won'];
   const buttons=[...get(id).querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')].filter(b=>!b.hidden&&b.getClientRects().length>0);
   if(!buttons.length)return;
   const first=buttons[0],last=buttons[buttons.length-1];
   if(e.shiftKey && document.activeElement===first){last.focus();e.preventDefault();}
   else if(!e.shiftKey && document.activeElement===last){first.focus();e.preventDefault();}
  });
  this.orientation();
 }
 bind(actions: Actions|undefined) { this.actions=actions;this.render(); }
 ready(hasSave=false,status='ok') { if(this.toastTimer)clearTimeout(this.toastTimer);get('toast').hidden=true;this.hint(''); get<HTMLButtonElement>('play').disabled=false;get('play').textContent='Nueva aventura →';get('campaign-continue').hidden=!hasSave;get('loading-status').textContent=status==='invalid'?'El guardado no es compatible. Podés comenzar una nueva aventura.':status==='unavailable'?'Guardado no disponible: tu avance queda en esta sesión.':'Dos capítulos · Objetivo 15–20 min · Reintentos libres'; }
 setChapter(title:string){get('chapter-name').textContent=title;}
 stopVoice(){this.voice.stop();}
 loading(progress: number) { get('loading-status').textContent='Preparando personajes · '+Math.round(progress*100)+'%'; }
 loadError() { get('loading-status').textContent='No se pudo cargar un recurso. Recargá la página para volver a intentar.'; }
 private orientation() { this.portrait=(matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints>0) && innerHeight>innerWidth;this.actions?.resetInput();this.render(); }
 setMode(mode: Mode) { if(mode!==this.mode)this.voice.stop();this.mode=mode;this.actions?.resetInput();this.render(); }
 render() {
  if(this.portrait||document.hidden)this.voice.stop();
  this.music.setState(this.mode,this.portrait||document.hidden);
  for(const id of ['menu','dialogue','puzzle','paused','won'])get(id).hidden=this.mode!==id;
  get('hud').hidden=this.mode==='menu'||this.mode==='won';
  get('pause').hidden=this.mode==='menu'||this.mode==='won';
  get('touch-controls').hidden=!this.touch||this.mode!=='playing'||this.portrait;
  get('rotate').hidden=!this.portrait;
  if(this.mode!=='playing')get('interaction-hint').hidden=true;
  this.actions?.setPaused(this.mode!=='playing'||this.portrait||document.hidden);
 }
 pause() { if(['paused','menu','won'].includes(this.mode))return;this.previousFocus=document.activeElement as HTMLElement;this.pausedFrom=this.mode;this.setMode('paused');get('resume').focus(); }
 resume() { if(this.mode!=='paused')return;this.setMode(this.pausedFrom);this.previousFocus?.focus(); }
 shortcut(e: KeyboardEvent): boolean {
  if(e.code==='Escape') { e.preventDefault();if(this.mode==='paused')this.resume();else this.pause();return true; }
  if(this.mode==='dialogue' && ['Space','Enter'].includes(e.code)) {e.preventDefault();if(!e.repeat)this.nextLine();return true;}
  if(this.mode==='puzzle' && ['Digit1','Digit2','Digit3'].includes(e.code)){e.preventDefault();if(!e.repeat)this.symbolHandler?.((Number(e.code.slice(-1))-1) as SymbolId);return true;}
  return false;
 }
 dialogue(lines: Line[], after=()=>{}) { this.lines=lines;this.lineIndex=0;this.afterDialogue=after;this.setMode('dialogue');this.drawLine();get('continue').focus(); }
 private drawLine() {
  const line=this.lines[this.lineIndex];
  const names:Record<string,string>={pattha:'Pattha',otto:'Otto',rural:'Rural',candado:'Don Candado'};
  const portraits:Record<string,string>={pattha:'pattha_concepto_B',otto:'raton_verde_concepto',rural:'rural_concepto'};
  get('speaker').textContent=names[line.quien]??line.quien;
  get('line').textContent=line.texto;
  get('portrait').hidden=line.quien==='candado';get('candado-icon').hidden=line.quien!=='candado';
  get<HTMLCanvasElement>('portrait').dataset.character=portraits[line.quien]?line.quien:'pattha';
  const source=this.recording(line.voz_id);get<HTMLButtonElement>('repeat-voice').disabled=!source;this.voice.play(source);
  get('continue').textContent=this.lineIndex===this.lines.length-1?'¡Vamos! →':'Seguir →';
 }
 nextLine() { if(this.mode!=='dialogue')return;if(++this.lineIndex<this.lines.length)this.drawLine();else {this.setMode('playing');this.afterDialogue();if((this.mode as Mode)==='playing')get('game').focus();} }
 openPuzzle(handler: (s:SymbolId)=>void,config:{tipo:'secuencia'|'orientacion';pista:string;voz_id?:string}={tipo:'secuencia',pista:'● → ★ → ▲'}) {
  const orientation=config.tipo==='orientacion';get('puzzle').classList.toggle('orientation',orientation);get('puzzle-title').textContent=orientation?'Orientemos la antena':'Una señal entre amigos';get('puzzle-instructions').textContent=orientation?'Tocá la orientación que coincide con la señal del faro.':'Tocá las formas en el orden de la pista.';get('puzzle-clue').textContent=config.pista;get('puzzle-clue').setAttribute('aria-label',config.pista);
  document.querySelectorAll<HTMLButtonElement>('[data-symbol]').forEach((b,i)=>{b.textContent=orientation?['↖ ●','↑ ★','↗ ▲'][i]:['●','★','▲'][i];b.setAttribute('aria-label',orientation?['Antena izquierda, círculo','Antena arriba, estrella','Antena derecha, triángulo'][i]:['Círculo','Estrella','Triángulo'][i]);});
  this.clueVoice=this.recording(config.voz_id);get<HTMLButtonElement>('repeat-clue').disabled=!this.clueVoice; this.symbolHandler=handler;this.puzzleFeedback('Podés probar todas las veces que quieras.',[]);this.setMode('puzzle');this.voice.play(this.clueVoice);get('puzzle').querySelector<HTMLButtonElement>('button')?.focus(); }
 puzzleFeedback(message: string, sequence: SymbolId[]) { get('puzzle-feedback').textContent=message;document.querySelectorAll<HTMLButtonElement>('[data-symbol]').forEach(b=>{b.classList.toggle('selected',sequence.includes(Number(b.dataset.symbol) as SymbolId));b.disabled=sequence.length===3;}); }
 toast(message: string) { clearTimeout(this.toastTimer);get('toast').textContent=message;get('toast').hidden=false;this.toastTimer=setTimeout(()=>{get('toast').hidden=true;},3300); }
 hint(message: string) { get('interaction-hint').hidden=!message;get('interaction-hint').textContent=message; }
 configureLevel(total: number, rules: ScoreRules) {
  this.sphereTotal=total;this.scoreRules=rules;
  get('coins').textContent='0';get('coins-total').textContent=String(total);
  get('coin-counter').title=`${rules.puntos_por_esfera} puntos por esfera. Juntá todas para recibir ${rules.bonus_todas.toLocaleString('es-AR')} puntos extra al finalizar.`;
  get('win-bonus').hidden=true;
 }
 hud(zone: string, objective: string, coins: number, energy: number) { get('zone').textContent=zone;get('objective').textContent=objective;get('coins').textContent=String(coins);get('coin-counter').setAttribute('aria-label',`${coins} de ${this.sphereTotal} esferas`);get('energy').textContent='● '.repeat(energy)+'○ '.repeat(3-energy);get('energy').setAttribute('aria-label','Energía: '+energy+' de 3'); }
 win(score: LevelScore,chapter:{next:boolean;title:string;total:number}={next:false,title:'Llegaron los tres.',total:score.total}) {
  get('win-title').textContent=chapter.title;get('next-chapter').hidden=!chapter.next;get('campaign-total').textContent='Total de la aventura: '+chapter.total.toLocaleString('es-AR')+' puntos';get('win-description').textContent=chapter.next?'Encontramos una marca de candado. La pista sigue hacia el bosque.':'Don Candado tiene la Gran Chispa. La próxima aventura seguirá hacia el faro.';
  const points=(value:number)=>value.toLocaleString('es-AR')+' puntos';
  get('win-coins').textContent=`Juntaste ${score.collected} de ${score.available} esferas ✦`;
  get('win-base').textContent=points(score.base);
  get('win-score').textContent=points(score.total);
  get('win-bonus').hidden=!score.complete;
  get('win-bonus').textContent=score.complete?`¡Todas las esferas! Bonus: +${points(score.bonus)}`:'';
  get('win-tip').hidden=score.complete;
  get('win-tip').textContent=`Juntá las ${score.available} para ganar ${points(this.scoreRules.bonus_todas)} extra.`;
  this.setMode('won');get(chapter.next?'next-chapter':'replay').focus();
 }
}
