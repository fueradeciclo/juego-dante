import { AmbientPass } from './companion-state.ts';
import { paintAirplane } from './ambient-art.ts';

export function animateSkyPreview(){
 const canvas=document.getElementById('sky-preview') as HTMLCanvasElement;
 const button=document.getElementById('preview-flight') as HTMLButtonElement;
 const label=document.getElementById('sky-preview-note')!;
 const clock=new AmbientPass(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let manualFlight=false;
 clock.startPass();button.onclick=()=>{clock.startPass();manualFlight=true;};
 let previous=performance.now();
 function loop(now:number){
  const dt=Math.min(50,now-previous);previous=now;
  const frame=clock.step(dt,document.hidden,reduced.matches&&!manualFlight);
  if(manualFlight&&!frame.visible)manualFlight=false;
  const still=reduced.matches&&!manualFlight;
  const box=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2),w=Math.round(box.width*ratio),h=Math.round(box.height*ratio);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  const ctx=canvas.getContext('2d')!;
  ctx.fillStyle='#d1e9dd';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#faffef';
  for(const x of [.18,.67]){ctx.beginPath();ctx.ellipse(w*x,h*.29,w*.07,h*.09,0,0,Math.PI*2);ctx.ellipse(w*(x+.04),h*.25,w*.045,h*.13,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#b4d3c2';ctx.beginPath();ctx.ellipse(w*.25,h*1.13,w*.57,h*.45,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#a2cab0';ctx.beginPath();ctx.ellipse(w*.86,h*1.08,w*.55,h*.35,0,0,Math.PI*2);ctx.fill();
  if(frame.visible||still){
   ctx.save();ctx.globalAlpha=.72;ctx.translate(still?w*.5:w*frame.x/1280,h*.43+(frame.y-76)*ratio);
   ctx.scale((still?1:frame.direction)*1.15*ratio,1.15*ratio);paintAirplane(ctx);ctx.restore();
  }
  label.textContent=still?'Reducir movimiento está activado. Tocá el botón para ver un vuelo.':'Pequeñas y tranquilas, acompañan el cielo mientras jugás.';
  canvas.dataset.flight=still?'still':frame.visible?'flying':'waiting';canvas.dataset.x=String(frame.x);
  requestAnimationFrame(loop);
 }
 requestAnimationFrame(loop);
}
