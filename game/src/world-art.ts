import Phaser from 'phaser';
import manifest from '../../data/arte.json';
const frames=new Map(manifest.frames.map(f=>[f.id,f]));
export function loadWorldArt(scene:Phaser.Scene,biome:string){
 const wanted=[biome+'-0','common-0',...(biome==='faro'?['boss-0']:[])];
 for(const id of ['sendero','bosque','tuneles','fabrica','patios','faro'])if(id!==biome&&scene.textures.exists('sky-render-'+id))scene.textures.remove('sky-render-'+id);
 for(const p of manifest.pages){if(!wanted.includes(p.key)&&scene.textures.exists(p.key))scene.textures.remove(p.key);if(wanted.includes(p.key)&&!scene.textures.exists(p.key))scene.load.image(p.key,'./'+p.path);}
}
export class WorldArt {
 private scene:Phaser.Scene;readonly biome:string;
 constructor(scene:Phaser.Scene,biome:string){this.scene=scene;this.biome=biome;for(const f of manifest.frames){if(!scene.textures.exists(f.page))continue;const t=scene.textures.get(f.page);if(!t.has(f.id))t.add(f.id,0,f.rect.x,f.rect.y,f.rect.width,f.rect.height);}}
 piece(id:string,x:number,y:number,w?:number,h?:number,depth=1){const f=frames.get(id);if(!f)throw Error('Recurso ausente: '+id);return this.scene.add.image(x,y,f.page,id).setOrigin(f.anchor[0],f.anchor[1]).setDisplaySize(w??f.logicalSize[0],h??f.logicalSize[1]).setDepth(depth);}
 state(image:Phaser.GameObjects.Image,id:string){const f=frames.get(id)!;image.setTexture(f.page,id);}
 background(){
 const indoors=this.biome==='tuneles';
 this.scene.add.rectangle(0,0,1280,720,indoors?0x152b43:0x7bb5d9).setOrigin(0).setScrollFactor(0).setDepth(-11);
 const key='sky-render-'+this.biome;
 if(!indoors&&!this.scene.textures.exists(key)){
  const f=frames.get(this.biome+'.sky')!,canvas=document.createElement('canvas');canvas.width=f.rect.width;canvas.height=f.rect.height;const ctx=canvas.getContext('2d')!;
  ctx.drawImage(this.scene.textures.get(f.page).getSourceImage() as HTMLImageElement,f.rect.x,f.rect.y,f.rect.width,f.rect.height,0,0,canvas.width,canvas.height);
  const fade=ctx.createLinearGradient(0,canvas.height*.55,0,canvas.height);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,1)');ctx.globalCompositeOperation='destination-out';ctx.fillStyle=fade;ctx.fillRect(0,0,canvas.width,canvas.height);this.scene.textures.addCanvas(key,canvas);
 }
 const layers=indoors?[['interior',720,720,0,-10]]:[['sky',300,300,.04,-10],['distance',490,340,.12,-8],['middle',540,300,.35,-6]];
 for(const [name,y,height,speed,depth]of layers){for(let x=0;x<this.scene.physics.world.bounds.width*Number(speed)+1280;x+=1024)(name==='sky'?this.scene.add.image(x,Number(y),key).setDisplaySize(1024,Number(height)).setDepth(Number(depth)):this.piece(this.biome+'.'+name,x,Number(y),1024,Number(height),Number(depth))).setOrigin(0,1).setScrollFactor(Number(speed),0);}
 }
 scroll(_x:number){}
 strip(x:number,top:number,width:number,height:number,kind='platform'){
  const left=x-width/2,cap=Math.min(64,width/2);
  this.piece(this.biome+'.'+kind+'-left',left,top,64,height,0).setOrigin(0).setCrop(0,0,cap*2,height*2);
  for(let dx=cap;dx<width-cap;dx+=64){const tail=Math.min(64,width-cap-dx);this.piece(this.biome+'.'+kind+'-center',left+dx,top,64,height,0).setOrigin(0).setCrop(0,0,tail*2,height*2);}
  this.piece(this.biome+'.'+kind+'-right',left+width-64,top,64,height,0).setOrigin(0).setCrop((64-cap)*2,0,cap*2,height*2);
 }
 /** Gap between floor segments: a misty ravine with shaded walls instead of the bare sky color. */
 pit(left:number,right:number,top:number){
  const g=this.scene.add.graphics().setDepth(-2),width=right-left,height=720-top;
  const [upper,lower]=this.biome==='bosque'?[0x2f5a5c,0x0b1d2b]:[0x4f7f9c,0x10243a];
  g.fillGradientStyle(upper,upper,lower,lower,1).fillRect(left,top,width,height);
  for(let i=0;i<6;i++){const a=.32-i*.05;g.fillStyle(0x071422,a).fillRect(left+i*4,top,4,height).fillRect(right-(i+1)*4,top,4,height);}
  // Soft overlapping mist bands, wider than the gap so they read as fog rather than discs.
  for(let i=0;i<8;i++)g.fillStyle(0xe8f3ff,.05).fillEllipse(left+width/2+(i%2?12:-12),top+60+i*14,width*1.4,40);
  g.fillStyle(0x071422,.45).fillRect(left,top,width,6);
  return g;
 }
 ground(x:number,top:number,width:number,height:number){
  for(let dy=0;dy<height;dy+=64)for(let dx=0;dx<width;dx+=64){const variant=(Math.floor(dx/64)%3)+1;const id=this.biome+'.'+(dy===0?'top':'fill')+'-v'+variant;this.piece(id,x-width/2+dx,top+dy,64,64,0).setOrigin(0).setCrop(0,0,Math.min(64,width-dx)*2,Math.min(64,height-dy)*2);}
 }
}
