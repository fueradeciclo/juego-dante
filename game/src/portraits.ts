import { AnimationClock, type AnimationFrame } from './animation-state.ts';
import { loadRig, paintRig, type CharacterKind, type PreparedRig } from './character-art.ts';

export type PreviewMode='auto'|'walk'|'blink'|'think'|'bored';
export function animatePortraits(mode:()=>PreviewMode=()=> 'auto') {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const entries=[...document.querySelectorAll<HTMLCanvasElement>('canvas[data-character]')].map((canvas,i)=>({
    canvas,clock:new AnimationClock(i+1),kind:'' as string,rig:undefined as PreparedRig|undefined,
  }));
  let previous=performance.now(),stopped=false;
  const loop=(now:number)=>{
    if(stopped)return;
    const delta=Math.min(now-previous,50);previous=now;
    const suspended=document.hidden||Boolean(document.querySelector('#rotate:not([hidden]), #paused:not([hidden])'));
    for(const entry of entries) {
      if(entry.canvas.closest('[hidden]'))continue;
      const kind=entry.canvas.dataset.character as CharacterKind;
      if(kind!==entry.kind) {
        entry.kind=kind;entry.rig=undefined;entry.clock=new AnimationClock(entries.indexOf(entry)+1);
        void loadRig(kind).then(rig=>{if(entry.kind===kind)entry.rig=rig;}).catch(()=>{entry.canvas.setAttribute('aria-label','No se pudo cargar el personaje');});
      }
      if(!entry.rig)continue;
      const bounds=entry.canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);
      const width=Math.round(bounds.width*ratio),height=Math.round(bounds.height*ratio);
      if(!width||!height)continue;
      if(entry.canvas.width!==width||entry.canvas.height!==height){entry.canvas.width=width;entry.canvas.height=height;}
      const choice=mode();
      let frame:AnimationFrame=entry.clock.step(delta,{speed:choice==='walk'?150:0,suspended,reducedMotion:reduced.matches});
      if(choice==='think'||choice==='bored')frame={...frame,state:choice,gesture:1};
      if(choice==='blink')frame={...frame,state:'idle',blink:1};
      paintRig(entry.canvas.getContext('2d')!,width,height,entry.rig,frame,entry.canvas.dataset.flip==='true');
      entry.canvas.dataset.state=frame.state;entry.canvas.dataset.eye=String(frame.blink);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  window.addEventListener('pagehide',()=>{stopped=true;},{once:true});
}
