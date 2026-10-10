import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir,writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const options={headless:true};
if(process.env.PATTHA_CHROMIUM_PATH)options.executablePath=process.env.PATTHA_CHROMIUM_PATH;
else if(!existsSync(chromium.executablePath()))options.channel='chrome';
const browser=await chromium.launch(options),checks=[],errors=[];
const record=name=>{checks.push(name);console.log('✓ '+name);};
const monitor=p=>p.on('pageerror',e=>errors.push(e.message));
const snapshot=p=>p.evaluate(()=>window.__PATTHA_TEST__.snapshot());
const hero=p=>p.evaluate(()=>window.__PATTHA_TEST__.snapshot().animations.find(a=>a.kind==='pattha'));
await mkdir('docs/capturas',{recursive:true});
try {
 const gallery=await browser.newPage({viewport:{width:1360,height:940}});monitor(gallery);
 await gallery.goto('http://localhost:5173/animaciones.html');
 await gallery.waitForFunction(()=>document.querySelector('#gallery-status').textContent.includes('Todos listos'));
 await gallery.waitForFunction(()=>document.querySelector('#pattha-showcase').dataset.pose==='run');
 const run=await gallery.evaluate(async()=>{
  const seen=new Set();await new Promise(resolve=>{let start=performance.now();function sample(){const c=document.querySelector('#pattha-showcase');seen.add(c.dataset.frame);if(performance.now()-start>800)resolve();else requestAnimationFrame(sample);}sample();});return [...seen];
 });assert.equal(run.length,8);record('carrera visible de ocho cuadros completos');
 await gallery.screenshot({path:'docs/capturas/15-pattha-carrera.png'});
 await gallery.locator('.pattha-frames summary').click();
 assert.equal(await gallery.locator('#pattha-frame-grid button').count(),40);
 const hashes=await gallery.locator('#pattha-frame-grid canvas').evaluateAll(canvases=>canvases.map(c=>{
  const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  return {nonzero:[...data].filter((_,i)=>i%4===3&&data[i]>80).length,image:c.toDataURL()};
 }));assert.ok(hashes.every(h=>h.nonzero>1000));assert.equal(new Set(hashes.map(h=>h.image)).size,40);
 record('40 poses distintas con píxeles opacos y atlas sin cuadros vacíos');
 await gallery.locator('#pattha-frame-grid').screenshot({path:'docs/capturas/30-pattha-40-cuadros.png'});
 for(const [index,pose]of [[0,'crouch'],[1,'takeoff'],[2,'rise'],[4,'fall'],[5,'land']]) {
  await gallery.locator(`#pattha-frame-grid [data-sheet="salto"][data-frame="${index}"]`).click();
  await gallery.waitForFunction(pose=>document.querySelector('#pattha-showcase').dataset.pose===pose,pose);
  await gallery.locator('.pattha-showcase').screenshot({path:`docs/capturas/16-pattha-${pose}.png`});
 }
 record('preparación, impulso, subida, caída y aterrizaje se pueden revisar cuadro a cuadro');
 await gallery.locator('[data-pattha-move="jump"]').click();
 const jumpPoses=await gallery.evaluate(async()=>{
  const poses=new Set();await new Promise(resolve=>{let start=performance.now();function sample(){poses.add(document.querySelector('#pattha-showcase').dataset.pose);if(performance.now()-start>1900)resolve();else requestAnimationFrame(sample);}sample();});return [...poses];
 });for(const pose of ['crouch','takeoff','rise','apex','fall','land','recover'])assert.ok(jumpPoses.includes(pose),pose);
 record('preview recorre toda la secuencia del salto');

 const page=await browser.newPage({viewport:{width:1280,height:800}});monitor(page);
 await page.goto('http://localhost:5173/?test=1');await page.locator('#play:not([disabled])').waitFor();await page.locator('#play').click();
 for(let i=0;i<3;i++)await page.locator('#continue').click();
 await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().grounded);
 await page.keyboard.down('Space');
 const trace=await page.evaluate(async()=>{
  const frames=[];await new Promise(resolve=>{let start=performance.now();function sample(){const s=window.__PATTHA_TEST__.snapshot(),p=s.animations.find(a=>a.kind==='pattha');frames.push({ms:performance.now()-start,y:s.y,vy:s.vy,pose:p.pose,dust:s.dust.length});if(performance.now()-start>1100)resolve();else requestAnimationFrame(sample);}sample();});return frames;
 });await page.keyboard.up('Space');
 for(const pose of ['crouch','takeoff','rise','apex','fall','land','recover'])assert.ok(trace.some(f=>f.pose===pose),pose);
 const launch=trace.find(f=>f.vy<0);assert.ok(launch.ms<110,'preparación breve');assert.ok(trace.some(f=>f.dust>0),'polvo al despegar');
 assert.ok(Math.min(...trace.map(f=>f.y))<425,'se mantiene la altura útil para plataformas');
 record('salto real: agacharse breve, impulso, subida y caída por velocidad, compresión y polvo');
 await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().grounded);
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(220);await page.screenshot({path:'docs/capturas/20-pattha-carrera-juego.png'});await page.keyboard.up('ArrowRight');
 const y=(await snapshot(page)).y;await page.keyboard.press('Space');await page.waitForTimeout(150);assert.ok((await snapshot(page)).y<y-10);
 await page.screenshot({path:'docs/capturas/21-pattha-polvo-juego.png'});
 record('un toque corto sigue produciendo un salto');
 await page.keyboard.press('Escape');const frozen=await snapshot(page);await page.waitForTimeout(250);const after=await snapshot(page);
 assert.deepEqual(after.animations,frozen.animations);assert.deepEqual(after.dust,frozen.dust);assert.equal(after.y,frozen.y);
 record('pausa congela física, cuadros y polvo juntos');
 await page.locator('#resume').click();await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().grounded);
 await page.emulateMedia({reducedMotion:'reduce'});await page.keyboard.down('Space');await page.waitForTimeout(160);assert.equal((await snapshot(page)).dust.length,0);await page.keyboard.up('Space');
 record('movimiento reducido elimina el polvo decorativo y mantiene el salto');
 const mobile=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});monitor(mobile);
 await mobile.goto('http://localhost:5173/animaciones.html');await mobile.waitForFunction(()=>document.querySelector('#gallery-status').textContent.includes('Todos listos'));
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await mobile.screenshot({path:'docs/capturas/17-pattha-mobile.png',fullPage:true});
 record('nuevo preview cabe en navegador mobile horizontal');
 assert.deepEqual(errors,[]);record('sin errores JavaScript');
 await writeFile('docs/PRUEBAS_PATTHA_03.json',JSON.stringify({version:'0.3',fecha:new Date().toISOString(),checks,errors,trace,metodo:'Chromium aislado: arte realmente pintado, atlas y movimientos con controles. Mobile emulado.'},null,2)+'\n');
}finally{await browser.close();}
