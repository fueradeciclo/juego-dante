import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir,writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const options={headless:true};
if(process.env.PATTHA_CHROMIUM_PATH)options.executablePath=process.env.PATTHA_CHROMIUM_PATH;
else if(!existsSync(chromium.executablePath()))options.channel='chrome';
const browser=await chromium.launch(options),checks=[],errors=[];
const record=name=>{checks.push(name);console.log('✓ '+name);};
const snapshot=p=>p.evaluate(()=>window.__PATTHA_TEST__.snapshot());
const position=(p,x,y)=>p.evaluate(([x,y])=>window.__PATTHA_TEST__.position(x,y),[x,y]);
const trace=(p,duration)=>p.evaluate(duration=>new Promise(resolve=>{
 const frames=[],start=window.__PATTHA_TEST__.snapshot().ambient.elapsed;
 function sample(){const frame=window.__PATTHA_TEST__.snapshot();frames.push(frame);if(frame.ambient.elapsed-start>=duration)resolve(frames);else requestAnimationFrame(sample);}sample();
}),duration);
const smooth=frames=>{
 for(let i=1;i<frames.length;i++){
   const dt=(frames[i].ambient.elapsed-frames[i-1].ambient.elapsed)/1000;
   for(let j=0;j<2;j++)assert.ok(Math.abs(frames[i].followers[j].x-frames[i-1].followers[j].x)<=420*dt+.5,'sin saltos de posición');
 }
};
await mkdir('docs/capturas',{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173/?test=1');await page.locator('#play:not([disabled])').waitFor();await page.locator('#play').click();
 for(let i=0;i<3;i++)await page.locator('#continue').click();
 await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().grounded);
 await page.keyboard.down('ArrowRight');await page.keyboard.down('Space');const start=await trace(page,650);await page.keyboard.up('ArrowRight');await page.keyboard.up('Space');smooth(start);
 assert.ok(start.at(-1).x>270);assert.ok(start.at(-1).followers.every(f=>Math.abs(f.x-start.at(-1).x)<180));
 record('cruzar el antiguo corte del inicio no produce un salto de los ratones');
 await position(page,2570,540);await page.keyboard.down('ArrowRight');const approach=await trace(page,1300);await page.keyboard.up('ArrowRight');smooth(approach);
 assert.ok(approach.at(-1).x>2800);assert.ok(approach.slice(10).every(s=>s.followers.every(f=>Math.abs(f.x-s.x)<185)));
 await page.screenshot({path:'docs/capturas/26-ratones-seguimiento-suave.png'});
 await page.keyboard.down('ArrowLeft');const back=await trace(page,1000);await page.keyboard.up('ArrowLeft');smooth(back);
 assert.ok(back.at(-1).followers.every(f=>Math.abs(f.x-back.at(-1).x)<185));
 await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().followers.every(f=>Math.abs(f.vx)<12));
 record('llegar al puente, volver y frenar conserva cercanía con aceleración suave');
 await position(page,130,540);await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().ambient.visible);
 const sky=await snapshot(page);await page.waitForTimeout(250);assert.ok((await snapshot(page)).ambient.x>sky.ambient.x);
 await page.keyboard.press('Escape');const paused=await snapshot(page);await page.waitForTimeout(300);
 assert.deepEqual((await snapshot(page)).followers,paused.followers);assert.deepEqual((await snapshot(page)).ambient,paused.ambient);
 await page.locator('#resume').click();await page.waitForTimeout(1800);
 assert.equal((await snapshot(page)).conversation,null);
 await page.screenshot({path:'docs/capturas/27-avioneta-fondo.png'});
 record('avioneta tenue al fondo, sin charla temprana; pausa congela avioneta y seguimiento');
 await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().conversation?.quien==='otto'&&window.__PATTHA_TEST__.snapshot().friendBubbleAlpha>.9,null,{timeout:45000});
 await page.screenshot({path:'docs/capturas/28-charla-sutil.png'});
 await position(page,3020,540);await page.waitForTimeout(180);
 assert.equal((await snapshot(page)).conversation,null);
 await page.waitForTimeout(2000);assert.equal((await snapshot(page)).conversation,null);
 record('charla tenue con aparición gradual; cambiar de zona no dispara otra inmediatamente');
 const saved=await snapshot(page);await position(page,4800,850);await page.waitForTimeout(350);
 const respawn=await snapshot(page);assert.ok(Math.abs(respawn.x-saved.checkpoint)<5);assert.ok(respawn.followers.every(f=>Math.abs(f.x-respawn.x)<190));
 record('volver al banderín reúne a los aliados cerca, sin atravesar el mapa');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);assert.equal((await snapshot(page)).ambient.visible,false);
 record('movimiento reducido oculta las avionetas decorativas');
 assert.deepEqual(errors,[]);record('sin errores JavaScript');
 await writeFile('docs/PRUEBAS_SEGUIMIENTO_Y_FONDO.json',JSON.stringify({fecha:new Date().toISOString(),checks,errors,metodo:'Chromium aislado; recorridos con teclado y trazas por cuadro. Posicionamiento de desarrollo para aislar puente, cambio de zona y retorno.'},null,2)+'\n');
}finally{await browser.close();}
