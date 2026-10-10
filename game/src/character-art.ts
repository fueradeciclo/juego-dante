import definitions from '../../assets/animaciones/rigs.json';
import type { AnimationFrame } from './animation-state.ts';

export type CharacterKind = 'pattha' | 'otto' | 'rural' | 'gato' | 'perro';
export type PartName = 'torso' | 'head' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg' | 'tail';
type Point = [number, number];
type Box = [number, number, number, number];
type Eye = { center:Point; radius:Point; sample:Point; line:string };
type PartDefinition = { pivot:Point; polygon:Point[] };
export type RigDefinition = { nombre:string; source:string; bounds:Box; bodyPivot:Point; parts:Partial<Record<PartName,PartDefinition>>; eyes:Eye[] };
export type PreparedPart = { name:PartName; pivot:Point; box:Box; canvas:HTMLCanvasElement; blinkCanvases?:HTMLCanvasElement[] };
export type PreparedRig = { kind:CharacterKind; definition:RigDefinition; parts:PreparedPart[] };
export type PartPose = { x:number; y:number; angle:number; scaleX:number; scaleY:number };
export const rigs = definitions.personajes as unknown as Record<CharacterKind,RigDefinition>;
export const characterKinds = Object.keys(rigs) as CharacterKind[];
const cache = new Map<CharacterKind,PreparedRig>();
const loads = new Map<CharacterKind,Promise<PreparedRig>>();
const extractionOrder:PartName[] = ['head','rightArm','leftArm','rightLeg','leftLeg','tail'];
const paintOrder:PartName[] = ['tail','leftLeg','rightLeg','torso','leftArm','rightArm','head'];

function canvas(width:number, height:number):HTMLCanvasElement {
  const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(width)); c.height=Math.max(1,Math.round(height)); return c;
}
function path(ctx:CanvasRenderingContext2D, polygon:Point[], scale:number, x:number, y:number) {
  ctx.beginPath();
  polygon.forEach(([px,py],i)=>{ const dx=(px-x)*scale,dy=(py-y)*scale; if(i)ctx.lineTo(dx,dy); else ctx.moveTo(dx,dy); });
  ctx.closePath();
}

/** Clip source pixels into reusable layers at load time. No source file is edited or reillustrated. */
export function prepareRig(kind:CharacterKind, source:HTMLImageElement):PreparedRig {
  const existing=cache.get(kind); if(existing)return existing;
  const definition=rigs[kind], [bx,by,bw,bh]=definition.bounds;
  const resolution=512/bh;
  const remaining=canvas(bw*resolution,bh*resolution);
  const rc=remaining.getContext('2d')!;
  rc.drawImage(source,bx,by,bw,bh,0,0,remaining.width,remaining.height);
  const original=canvas(remaining.width,remaining.height);original.getContext('2d')!.drawImage(remaining,0,0);
  const parts:PreparedPart[]=[];
  for(const name of extractionOrder) {
    const part=definition.parts[name]; if(!part)continue;
    const xs=part.polygon.map(p=>p[0]),ys=part.polygon.map(p=>p[1]);
    const x=Math.max(bx,Math.floor(Math.min(...xs))),y=Math.max(by,Math.floor(Math.min(...ys)));
    const w=Math.min(bx+bw,Math.ceil(Math.max(...xs)))-x,h=Math.min(by+bh,Math.ceil(Math.max(...ys)))-y;
    const layer=canvas(w*resolution,h*resolution),ctx=layer.getContext('2d')!;
    path(ctx,part.polygon,resolution,x,y);ctx.clip();
    ctx.drawImage(remaining,(bx-x)*resolution,(by-y)*resolution);
    parts.push({name,pivot:part.pivot,box:[x,y,w,h],canvas:layer});
    rc.save();rc.globalCompositeOperation='destination-out';path(rc,part.polygon,resolution,bx,by);rc.fill();rc.restore();
  }
  // Keep source pixels behind each joint, like overlapping paper cutouts.
  // This covers the small gaps exposed by a rotation without drawing new anatomy.
  for(const name of extractionOrder) {
    const part=definition.parts[name];if(!part)continue;
    const [px,py]=part.pivot;
    const radius=bh*(name.endsWith('Arm')?.14:name==='head'?.085:.085);
    rc.save();rc.beginPath();rc.arc((px-bx)*resolution,(py-by)*resolution,radius*resolution,0,Math.PI*2);rc.clip();rc.drawImage(original,0,0);rc.restore();
  }
  parts.push({name:'torso',pivot:definition.bodyPivot,box:definition.bounds,canvas:remaining});
  const head=parts.find(p=>p.name==='head')!;
  head.blinkCanvases=[head.canvas,...[0.55,1].map(closure=>closedEyes(head,definition.eyes,source,closure))];
  parts.sort((a,b)=>paintOrder.indexOf(a.name)-paintOrder.indexOf(b.name));
  const rig={kind,definition,parts};cache.set(kind,rig);return rig;
}

function closedEyes(head:PreparedPart, eyes:Eye[], source:HTMLImageElement, closure:number) {
  const result=canvas(head.canvas.width,head.canvas.height),ctx=result.getContext('2d')!;
  ctx.drawImage(head.canvas,0,0);
  const sample=canvas(source.naturalWidth,source.naturalHeight),sc=sample.getContext('2d',{willReadFrequently:true})!;
  sc.drawImage(source,0,0);
  const [hx,hy,hw,hh]=head.box,sx=result.width/hw,sy=result.height/hh;
  for(const eye of eyes) {
    const color=sc.getImageData(eye.sample[0],eye.sample[1],1,1).data;
    const x=(eye.center[0]-hx)*sx,y=(eye.center[1]-hy)*sy,rx=eye.radius[0]*sx,ry=eye.radius[1]*sy;
    ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.clip();
    const skin=(px:number,py:number)=>{
      const p=sc.getImageData(Math.round(px),Math.round(py),1,1).data;
      const c=p[3]<200||p[0]+p[1]+p[2]<85?color:p;
      return `rgb(${c[0]} ${c[1]} ${c[2]})`;
    };
    const fill=ctx.createLinearGradient(x,y-ry,x,y+ry);
    fill.addColorStop(0,skin(eye.center[0],eye.center[1]-eye.radius[1]*1.13));
    fill.addColorStop(.5,`rgb(${color[0]} ${color[1]} ${color[2]})`);
    fill.addColorStop(1,skin(eye.center[0],eye.center[1]+eye.radius[1]*1.13));
    ctx.fillStyle=fill;ctx.fillRect(x-rx-1,y-ry-1,rx*2+2,ry*2+2);
    if(closure<1) {
      const ex=(eye.center[0]-eye.radius[0]-hx)*sx,ey=(eye.center[1]-eye.radius[1]-hy)*sy;
      const height=ry*2*(1-closure);
      ctx.drawImage(head.canvas,ex,ey,rx*2,ry*2,x-rx,y-height/2,rx*2,height);
    }
    ctx.restore();
    if(closure===1) {
      ctx.strokeStyle=eye.line;ctx.lineWidth=Math.max(1.3,rx*.15);ctx.lineCap='round';ctx.beginPath();
      ctx.moveTo(x-rx*.72,y);ctx.quadraticCurveTo(x,y+ry*.16,x+rx*.72,y);ctx.stroke();
    }
  }
  return result;
}

export function loadRig(kind:CharacterKind):Promise<PreparedRig> {
  if(cache.has(kind))return Promise.resolve(cache.get(kind)!);
  if(loads.has(kind))return loads.get(kind)!;
  const request=new Promise<PreparedRig>((resolve,reject)=>{
    const image=new Image(); image.onload=()=>resolve(prepareRig(kind,image));
    image.onerror=()=>reject(new Error('No se pudo cargar '+rigs[kind].nombre)); image.src='./assets/'+rigs[kind].source;
  });loads.set(kind,request);return request;
}

export function blinkFrame(frame:AnimationFrame):number {
  if(frame.state==='vanish')return 2;
  const closure=frame.state==='bored'?Math.max(frame.blink,frame.gesture*.95):frame.blink;
  return closure>.78?2:closure>.24?1:0;
}

export function partPose(name:PartName, frame:AnimationFrame, kind:CharacterKind='pattha'):PartPose {
  const pose={x:0,y:0,angle:0,scaleX:1,scaleY:1};
  const breath=Math.sin(frame.elapsed/680)*frame.motion;
  const stride=Math.sin(frame.phase)*frame.motion;
  const travel=frame.state==='talk'?frame.travel??'idle':frame.state;
  if(travel==='walk') {
    pose.y=-Math.abs(Math.sin(frame.phase))*13*frame.motion;
    if(name==='leftLeg') {pose.angle=stride*.13;pose.y-=Math.max(0,stride)*18;}
    if(name==='rightLeg') {pose.angle=-stride*.13;pose.y-=Math.max(0,-stride)*18;}
    if(name==='leftArm')pose.angle=-stride*.13;
    if(name==='rightArm')pose.angle=stride*.13;
    if(name==='head')pose.angle=stride*.015;
  } else if(travel==='air') {
    if(name==='leftLeg')pose.angle=-.13*frame.motion;
    if(name==='rightLeg')pose.angle=.16*frame.motion;
    if(name==='leftArm')pose.angle=.17*frame.motion;
    if(name==='rightArm')pose.angle=-.18*frame.motion;
  } else {
    if(!name.endsWith('Leg'))pose.y=breath*3;
    if(name==='torso')pose.scaleY=1+breath*.003;
    if(name==='head')pose.angle=breath*.007;
    if(frame.state==='think') {
      if(name==='head') {pose.angle-=frame.gesture*.10;pose.y-=frame.gesture*9;}
      if(name==='leftArm')pose.angle+=frame.gesture*.23;
    }
    if(frame.state==='bored') {
      if(name==='head') {pose.angle+=frame.gesture*.065;pose.y+=frame.gesture*16;}
      if(name==='leftArm')pose.angle-=frame.gesture*.19;
      if(name==='rightArm')pose.angle+=frame.gesture*.09;
      if(name==='torso')pose.scaleY-=frame.gesture*.008;
    }
  }
  if(name==='tail')pose.angle+=Math.sin(frame.elapsed/360)*(.045+(travel==='walk'?.08:0))*frame.motion;
  if(kind!=='pattha') {
    const rival=kind==='gato'||kind==='perro';
    if(travel==='walk') {
      if(name.endsWith('Leg')){pose.angle*=rival?1.65:1.2;pose.x+=(name==='leftLeg'?stride:-stride)*(rival?10:6);}
      if(name.endsWith('Arm'))pose.angle*=rival?1.8:1.25;
      if(name==='head'){pose.angle+=rival?-.055*frame.motion:stride*.02;pose.y-=Math.abs(stride)*8;}
      if(name==='tail')pose.angle+=Math.sin(frame.phase+.6)*(kind==='gato'?.12:.075)*frame.motion;
    }
    if(frame.state==='talk') {
      if(name==='head') {pose.angle=Math.sin(frame.elapsed/170)*.04*frame.motion;pose.y-=frame.gesture*8*frame.motion;}
      if(name==='leftArm')pose.angle+=(-.18-frame.gesture*.12)*frame.motion;
      if(name==='tail')pose.angle+=Math.sin(frame.elapsed/250)*.07*frame.motion;
    }
    if(frame.state==='alert') {
      if(name==='head'){pose.angle=-.085*frame.motion;pose.y+=7*frame.motion;}
      if(name==='leftArm')pose.angle-=.23*frame.motion;
      if(name==='rightArm')pose.angle+=.17*frame.motion;
      if(name==='tail')pose.angle+=.19*frame.motion;
    }
    if(frame.state==='vanish') {
      pose.angle=0;pose.y=0;
      if(name.endsWith('Arm'))pose.angle=(name==='leftArm'?-.2:.2)*Math.sin(frame.gesture*Math.PI)*frame.motion;
    }
  }
  return pose;
}

export function rigPose(kind:CharacterKind,frame:AnimationFrame) {
  const pose={y:0,angle:0,scaleX:1,scaleY:1,alpha:1};
  if(kind==='pattha')return pose;
  if(frame.state==='vanish') {
    const t=frame.gesture;
    pose.alpha=1-Math.max(0,(t-.18)/.82);
    if(frame.motion===1){pose.y=-Math.sin(t*Math.PI)*.065;pose.angle=Math.sin(t*Math.PI)*.1;pose.scaleX=1-t*.28;pose.scaleY=1-t*.32;}
  }else if((kind==='otto'||kind==='rural')&&frame.state==='idle'&&frame.motion===1) {
    const age=(frame.elapsed+(kind==='rural'?1500:0))%6400;
    if(age<640)pose.y=-Math.sin(age/640*Math.PI)*.045;
  }
  return pose;
}

export function vanishPuffs(frame:AnimationFrame,w:number,h:number) {
  if(frame.state!=='vanish'||frame.motion!==1)return [];
  const t=frame.gesture,alpha=Math.sin(t*Math.PI)*.7;
  return Array.from({length:5},(_,i)=>{const a=i*Math.PI*2/5;return {x:Math.cos(a)*w*(.14+t*.28),y:-h*.5+Math.sin(a)*h*(.09+t*.14)-t*h*.1,r:h*(.018+Math.sin(t*Math.PI)*.022),alpha};});
}

/** Small removable brows add a mischievous expression; source eyes stay intact. */
export function rivalBrows(definition:RigDefinition) {
  const pivot=definition.parts.head!.pivot,h=definition.bounds[3];
  return definition.eyes.map((eye,i)=>{
    const x=eye.center[0]-pivot[0],y=eye.center[1]-pivot[1]-eye.radius[1]*.93;
    const tilt=(i===0?1:-1)*h*.013;
    return {x1:x-eye.radius[0]*.72,y1:y-tilt,x2:x+eye.radius[0]*.72,y2:y+tilt};
  });
}

export function drawThought(ctx:CanvasRenderingContext2D, definition:RigDefinition, opacity:number) {
  if(opacity<=.1)return;
  const [,,w,h]=definition.bounds,x=-w*.24,y=-h*1.04,r=h*.032;
  ctx.save();ctx.globalAlpha=opacity;ctx.fillStyle='#f9fff0';ctx.strokeStyle='#47685b';ctx.lineWidth=h*.005;
  ctx.beginPath();ctx.ellipse(x,y,r*2.2,r*1.5,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  for(const [cx,cy,cr] of [[x+r*.65,y+r*1.8,r*.36],[x+r,y+r*2.7,r*.22]]) {
    ctx.beginPath();ctx.arc(cx,cy,cr,0,Math.PI*2);ctx.fill();ctx.stroke();
  }
  ctx.fillStyle='#47685b';
  for(const dx of [-.9,0,.9]){ctx.beginPath();ctx.arc(x+dx*r,y,r*.17,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

/** Also used by menu, dialogue portraits and the family animation preview. */
export function paintRig(ctx:CanvasRenderingContext2D, width:number, height:number, rig:PreparedRig, frame:AnimationFrame, flip=false) {
  const [bx,by,bw,bh]=rig.definition.bounds;
  ctx.clearRect(0,0,width,height);
  const scale=Math.min(width/(bw*1.18),height/(bh*1.17));
  const body=rigPose(rig.kind,frame);
  ctx.save();ctx.translate(width/2,(height+bh*scale)/2+bh*scale*.025+body.y*bh*scale);ctx.scale(flip?-scale:scale,scale);ctx.rotate(body.angle);ctx.scale(body.scaleX,body.scaleY);ctx.globalAlpha=body.alpha;
  for(const part of rig.parts) {
    const pose=partPose(part.name,frame,rig.kind),[x,y,w,h]=part.box;
    ctx.save();ctx.translate(part.pivot[0]-bx-bw/2+pose.x,part.pivot[1]-by-bh+pose.y);ctx.rotate(pose.angle);ctx.scale(pose.scaleX,pose.scaleY);
    const source=part.blinkCanvases?.[blinkFrame(frame)]??part.canvas;
    ctx.drawImage(source,x-part.pivot[0],y-part.pivot[1],w,h);
    if(part.name==='head'&&(rig.kind==='gato'||rig.kind==='perro')&&frame.state!=='vanish') {
      ctx.strokeStyle='#4b352c';ctx.lineWidth=bh*.009;ctx.lineCap='round';
      for(const brow of rivalBrows(rig.definition)){ctx.beginPath();ctx.moveTo(brow.x1,brow.y1);ctx.lineTo(brow.x2,brow.y2);ctx.stroke();}
    }
    ctx.restore();
  }
  if(frame.state==='think')drawThought(ctx,rig.definition,frame.gesture);
  for(const puff of vanishPuffs(frame,bw,bh)){ctx.globalAlpha=puff.alpha;ctx.fillStyle='#fff6d7';ctx.beginPath();ctx.arc(puff.x,puff.y,puff.r,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}
