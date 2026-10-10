import { loadPatthaArt, paintPattha, patthaAtlas } from './pattha-art.ts';
import { PatthaClock, type PatthaFrame, type PatthaSheet, type PatthaPose } from './pattha-state.ts';

type Move='run'|'jump'|'idle'|'think'|'bored'|'help'|'celebrate';
const labels:Record<string,string>={run:'Corriendo',crouch:'Se agacha',takeoff:'Se impulsa',rise:'Está subiendo',apex:'Llegó arriba',fall:'Está bajando',land:'Amortigua con las piernas',recover:'Se acomoda',idle:'Espera',blink:'Parpadea',think:'Piensa',bored:'Se aburre un poquito',help:'Ayuda',celebrate:'¡Festeja!',stop:'Frena'};
export async function animatePatthaPreview() {
  const canvas=document.getElementById('pattha-showcase') as HTMLCanvasElement;
  const art=await loadPatthaArt(),clock=new PatthaClock();
  let move:Move='run',elapsed=0,previous=performance.now();
  let selected:{sheet:PatthaSheet;index:number;pose:PatthaPose}|undefined;
  const framePoses:Record<PatthaSheet,PatthaPose[]>={carrera:Array(8).fill('run'),salto:['crouch','takeoff','rise','apex','fall','land','recover','rebound'],reposo:['idle','blink','breathe','think','think','bored','help','celebrate']};
  const grid=document.getElementById('pattha-frame-grid')!;
  for(const sheet of ['carrera','salto','reposo'] as PatthaSheet[])for(let index=0;index<8;index++) {
    const button=document.createElement('button'),thumbnail=document.createElement('canvas'),caption=document.createElement('span');
    button.dataset.sheet=sheet;button.dataset.frame=String(index);button.setAttribute('aria-pressed','false');
    thumbnail.width=144;thumbnail.height=156;
    const frame={...clock.snapshot(),sheet,index,pose:framePoses[sheet][index]};
    paintPattha(thumbnail.getContext('2d')!,144,156,art,frame,true);
    caption.textContent=patthaAtlas.sheets[sheet].names[index].replaceAll('_',' ');
    button.append(thumbnail,caption);grid.append(button);
    button.onclick=()=>{
      selected={sheet,index,pose:framePoses[sheet][index]};
      grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      document.querySelectorAll('[data-pattha-move]').forEach(b=>b.setAttribute('aria-pressed','false'));
      canvas.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});
    };
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  for(const button of document.querySelectorAll<HTMLButtonElement>('[data-pattha-move]'))button.onclick=()=>{
    move=button.dataset.patthaMove as Move;elapsed=0;selected=undefined;grid.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));
    document.querySelectorAll('[data-pattha-move]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  };
  function loop(now:number) {
    const dt=Math.min(now-previous,50);previous=now;if(!document.hidden)elapsed+=dt;
    const box=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2),w=Math.round(box.width*ratio),h=Math.round(box.height*ratio);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    const cycle=elapsed%1750,air=move==='jump'&&cycle>=414&&cycle<1189,crouch=move==='jump'&&cycle>=350&&cycle<414;
    const seconds=(cycle-414)/1000,vy=-620+1600*seconds;
    let frame:PatthaFrame=clock.step(dt,{speed:move==='run'?285:0,grounded:!air,vy,crouching:crouch,takingOff:air&&cycle<484,suspended:document.hidden,reducedMotion:reduced.matches});
    if(['think','bored','help','celebrate'].includes(move))frame={...frame,pose:move as PatthaFrame['pose'],sheet:'reposo',index:move==='think'?3:move==='bored'?5:move==='help'?6:7,gesture:1};
    if(selected)frame={...frame,...selected,elapsed:0,footOffset:selected.pose==='rise'?-22:selected.pose==='apex'?-10:0};
    const lift=air&&!selected?Math.max(0,620*seconds-800*seconds*seconds)*h/730:0;
    paintPattha(canvas.getContext('2d')!,w,h,art,frame,true,lift,820);
    const ctx=canvas.getContext('2d')!;
    ctx.save();ctx.globalCompositeOperation='destination-over';ctx.fillStyle='#d6e9cb';ctx.beginPath();ctx.ellipse(w/2,h*.56,h*.38,h*.34,0,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.strokeStyle='#92b68a';ctx.lineWidth=ratio*2;ctx.beginPath();ctx.moveTo(w*.13,h*.93);ctx.lineTo(w*.87,h*.93);ctx.stroke();
    if(move==='jump'&&!selected&&cycle>=414&&cycle<740&&!reduced.matches) {
      const t=(cycle-414)/326;
      for(const sign of [-1,1])for(let i=0;i<3;i++){
        ctx.fillStyle=`rgba(173,155,119,${(1-t)*.22})`;ctx.beginPath();ctx.ellipse(w/2+sign*(9+i*7+t*24)*ratio,h*.93-3*ratio-t*8*ratio,(4+i+t*3)*ratio,(2+i*.4+t)*ratio,0,0,Math.PI*2);ctx.fill();
      }
    }
    canvas.dataset.pose=frame.pose;canvas.dataset.frame=String(frame.index);canvas.dataset.sheet=frame.sheet;
    document.getElementById('pattha-pose-label')!.textContent=labels[frame.pose]??'Pattha';
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
