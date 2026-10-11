export const AIRPLANE_WIDTH=72;
export const AIRPLANE_HEIGHT=44;

/** Our small vector airplane, shared by the game and the gallery. Coordinates around its center. */
export function paintAirplane(ctx:CanvasRenderingContext2D) {
 const triangle=(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number)=>{
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.closePath();ctx.fill();
 };
 ctx.fillStyle='#5b7c79';ctx.strokeStyle='#436563';ctx.lineWidth=1.2;
 ctx.beginPath();ctx.roundRect(-22,-3,43,7,3);ctx.fill();ctx.stroke();
 triangle(-17,-2,-24,-12,-22,1);
 ctx.fillStyle='#8fa582';triangle(-6,0,6,-14,11,-1);triangle(-4,1,7,13,12,2);
 ctx.fillStyle='#d3e1d4';ctx.beginPath();ctx.roundRect(5,-6,9,5,2);ctx.fill();
 ctx.strokeStyle='#436563';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(24,-7);ctx.lineTo(24,7);ctx.stroke();
}
