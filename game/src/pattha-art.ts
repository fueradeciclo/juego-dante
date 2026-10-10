import atlas from '../../assets/animaciones/pattha/atlas.json';
import type { PatthaFrame, PatthaSheet } from './pattha-state.ts';

export const patthaAtlas=atlas;
export type PatthaArt={frames:Record<PatthaSheet,HTMLCanvasElement[]>};
const sheetNames=Object.keys(atlas.sheets) as PatthaSheet[];
type SheetSpec={anchors:number[][];flip:boolean[];rects:number[][];absoluteAnchors?:boolean;scale?:number};
let loaded:Promise<PatthaArt>|undefined;

/** Slice and align at runtime, retaining the RGBA source sheets without resampling/editing them on disk. */
export function preparePattha(images:Record<PatthaSheet,HTMLImageElement>):PatthaArt {
  const frames={} as PatthaArt['frames'];
  for(const sheet of sheetNames) {
    const spec:SheetSpec=atlas.sheets[sheet],source=images[sheet],scale=spec.scale??1;
    frames[sheet]=spec.anchors.map(([ax,ay],i)=>{
      const canvas=document.createElement('canvas');canvas.width=atlas.canvasWidth;canvas.height=atlas.canvasHeight;
      const ctx=canvas.getContext('2d')!;
      ctx.translate(atlas.canvasWidth/2,atlas.baseline);ctx.scale(spec.flip[i]?-scale:scale,scale);
      const [sx,sy,w,h]=spec.rects[i];
      const pivotX=(spec.absoluteAnchors?0:(i%atlas.columns)*atlas.frameWidth)+ax-sx,pivotY=(spec.absoluteAnchors?0:Math.floor(i/atlas.columns)*atlas.frameHeight)+ay-sy;
      ctx.drawImage(source,sx,sy,w,h,-pivotX,-pivotY,w,h);
      return canvas;
    });
  }
  return {frames};
}
export function loadPatthaArt():Promise<PatthaArt> {
  return loaded??=Promise.all(sheetNames.map(sheet=>new Promise<[PatthaSheet,HTMLImageElement]>((resolve,reject)=>{
    const img=new Image();img.onload=()=>resolve([sheet,img]);img.onerror=()=>reject(new Error('No cargó el set de Pattha: '+sheet));img.src='./'+atlas.sheets[sheet].path;
  }))).then(entries=>preparePattha(Object.fromEntries(entries) as Record<PatthaSheet,HTMLImageElement>));
}
export function patthaBreath(frame:PatthaFrame) { return frame.pose==='idle'||frame.pose==='think'||frame.pose==='bored'?Math.sin(frame.elapsed/620)*.004*frame.motion:0; }
export function paintPattha(ctx:CanvasRenderingContext2D,width:number,height:number,art:PatthaArt,frame:PatthaFrame,flip=false,lift=0,fitHeight=580) {
  ctx.clearRect(0,0,width,height);
  const scale=Math.min(width/460,height/fitHeight)*.96;
  ctx.save();ctx.translate(width/2,height*.93-lift);ctx.scale(flip?-scale:scale,scale);
  const breath=patthaBreath(frame);ctx.scale(1-breath,1+breath);
  ctx.drawImage(art.frames[frame.sheet][frame.index],-atlas.canvasWidth/2,-atlas.baseline+frame.footOffset);
  ctx.restore();
}
