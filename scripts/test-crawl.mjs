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
const state=p=>p.evaluate(()=>({...window.__PATTHA_TEST__.snapshot(),crawl:window.__PATTHA_TEST__.crawl()}));
const ground=p=>p.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().grounded);
const position=(p,x,y=540)=>p.evaluate(([x,y])=>window.__PATTHA_TEST__.position(x,y),[x,y]);
const enter=async p=>{
 await p.goto('http://localhost:5173/?test=1');await p.locator('#play:not([disabled])').waitFor();await p.locator('#play').click();
 for(let i=0;i<3;i++)await p.locator('#continue').click();await ground(p);
};
const trace=async(p,duration)=>p.evaluate(async duration=>{
 const frames=[],start=window.__PATTHA_TEST__.snapshot().ambient.elapsed;
 await new Promise(resolve=>{function sample(){const s=window.__PATTHA_TEST__.snapshot(),c=window.__PATTHA_TEST__.crawl(),hero=s.animations[0];frames.push({ms:s.ambient.elapsed-start,x:s.x,y:s.y,vy:s.vy,pose:hero.pose,index:hero.index,phase:c.posture.phase,blocked:c.posture.blocked,height:c.body.height});if(s.ambient.elapsed-start>=duration)resolve();else requestAnimationFrame(sample);}sample();});return frames;
},duration);
await mkdir('docs/capturas',{recursive:true});
try {
 const gallery=await browser.newPage({viewport:{width:1360,height:940}});monitor(gallery);
 await gallery.goto('http://localhost:5173/animaciones.html');await gallery.waitForFunction(()=>document.querySelector('#gallery-status').textContent.includes('Todos listos'));
 await gallery.locator('.pattha-frames summary').click();
 assert.equal(await gallery.locator('#pattha-frame-grid button').count(),40);
 const cells=await gallery.locator('#pattha-frame-grid [data-sheet="gateo"] canvas').evaluateAll(cs=>cs.map(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return {image:c.toDataURL(),opaque:[...d].filter((a,i)=>i%4===3&&a>80).length};}));
 assert.equal(cells.length,16);assert.ok(cells.every(c=>c.opaque>1000));assert.equal(new Set(cells.map(c=>c.image)).size,16);
 await gallery.locator('#pattha-frame-grid').screenshot({path:'docs/capturas/regresion-05-30-pattha-40-cuadros.png'});
 await gallery.locator('[data-pattha-move="crawl"]').click();const galleryTrace=await gallery.evaluate(async()=>{
  const seen=new Set(),poses=new Set();await new Promise(resolve=>{const start=performance.now();function sample(){const c=document.querySelector('#pattha-showcase');poses.add(c.dataset.pose);if(c.dataset.pose==='crawl')seen.add(c.dataset.frame);if(performance.now()-start>3200)resolve();else requestAnimationFrame(sample);}sample();});return {seen:[...seen],poses:[...poses]};
 });assert.equal(galleryTrace.seen.length,8);for(const pose of ['duckDown','crawl','crawlStop','standUp'])assert.ok(galleryTrace.poses.includes(pose),pose);
 await gallery.locator('#pattha-frame-grid [data-sheet="gateo"][data-frame="6"]').click();await gallery.waitForFunction(()=>document.querySelector('#pattha-showcase').dataset.pose==='crawl');
 await gallery.locator('.pattha-showcase').screenshot({path:'docs/capturas/regresion-05-31-pattha-gateo.png'});
 record('16 dibujos nuevos y ciclo completo de bajar, ocho pasos, frenar y levantarse en la galería');
 await gallery.close();

 const page=await browser.newPage({viewport:{width:1280,height:800}});monitor(page);await enter(page);
 await position(page,4005);await ground(page);
 await page.keyboard.down('ArrowRight');await trace(page,550);await page.keyboard.up('ArrowRight');
 const standing=await state(page);assert.ok(standing.x<4060,'no puede cruzar de pie');assert.ok(Math.abs(standing.y-540)<1);assert.ok(standing.crawl.body.height>100);
 record('el techo bloquea a Pattha de pie');
 await page.keyboard.down('ArrowDown');const lower=await trace(page,220);assert.ok(lower.some(f=>f.pose==='duckDown'));assert.equal((await state(page)).crawl.posture.phase,'low');assert.ok(lower.every(f=>Math.abs(f.y-540)<1),'pies estables al bajar');
 await page.keyboard.down('ArrowRight');const crawlTrace=await trace(page,750);await page.keyboard.up('ArrowRight');
 const inside=await state(page);assert.ok(inside.x>4100&&inside.x<4235);assert.equal(inside.crawl.body.height,80);assert.equal(inside.crawl.headroom,false);assert.ok(crawlTrace.some(f=>f.pose==='crawl'));assert.ok(crawlTrace.every(f=>Math.abs(f.y-540)<1));
 await page.keyboard.up('ArrowDown');await trace(page,220);assert.equal((await state(page)).crawl.posture.phase,'low');
 await page.keyboard.press('Space');const roofTrace=await trace(page,300);assert.ok(roofTrace.every(f=>f.phase==='low'&&Math.abs(f.y-540)<1),'soltar y saltar no permiten atravesar el techo');
 await page.screenshot({path:'docs/capturas/regresion-05-32-pattha-pasaje-bajo.png'});
 record('gatea con pies estables y permanece bajo al soltar o pedir un salto dentro del pasaje');
 await page.keyboard.press('Escape');const frozen=await state(page);await page.waitForTimeout(220);const after=await state(page);assert.deepEqual(after.crawl,frozen.crawl);assert.deepEqual(after.animations,frozen.animations);
 await page.locator('#resume').click();await trace(page,100);assert.equal((await state(page)).crawl.posture.phase,'low');
 record('la pausa mantiene la postura y al volver sigue protegido por el techo');
 await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().x>4290);await page.keyboard.up('ArrowRight');await page.waitForFunction(()=>window.__PATTHA_TEST__.crawl().posture.phase==='stand');
 const outside=await state(page);assert.ok(outside.crawl.body.height>100);assert.ok(Math.abs(outside.y-540)<1);
 await page.keyboard.down('ArrowDown');await trace(page,200);await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().x<4190);await page.keyboard.up('ArrowDown');
 const returnTrace=await trace(page,350);assert.ok(returnTrace.some(f=>f.pose==='crawl'));await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().x<4040&&window.__PATTHA_TEST__.crawl().posture.phase==='stand');await page.keyboard.up('ArrowLeft');
 record('se levanta al salir por cualquiera de los dos extremos y gatea en ambas direcciones');
 await position(page,130);await ground(page);await page.keyboard.down('KeyS');await trace(page,210);assert.equal((await state(page)).crawl.posture.phase,'low');await page.keyboard.up('KeyS');await trace(page,210);assert.equal((await state(page)).crawl.posture.phase,'stand');
 await page.keyboard.down('Space');const jumpTrace=await trace(page,120);await page.keyboard.up('Space');assert.ok(jumpTrace.some(f=>f.vy<0));await ground(page);
 await page.keyboard.down('Space');await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().vy<-200);await page.keyboard.down('ArrowDown');assert.equal((await state(page)).crawl.posture.phase,'stand');await page.keyboard.up('Space');await page.keyboard.up('ArrowDown');await ground(page);
 record('S funciona y los saltos habituales se conservan; agacharse comienza sobre el suelo');
 await page.close();

 const mobile=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});monitor(mobile);await enter(mobile);
 await position(mobile,4005);await ground(mobile);
 const cdp=await mobile.context().newCDPSession(mobile),centers={};
 for(const action of ['right','crouch']){const b=await mobile.locator(`[data-action="${action}"]`).boundingBox();assert.ok(b);centers[action]={x:b.x+b.width/2,y:b.y+b.height/2};}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...centers.crouch},{id:2,...centers.right}]});
 await mobile.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().x>4140);let m=await state(mobile);assert.equal(m.crawl.posture.phase,'low');assert.equal(m.animations[0].pose,'crawl');
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await mobile.screenshot({path:'docs/capturas/regresion-05-33-pattha-gateo-mobile.png'});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await trace(mobile,200);assert.equal((await state(mobile)).crawl.posture.phase,'low');
 await mobile.setViewportSize({width:390,height:844});await mobile.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().portrait);const portrait=await state(mobile);await mobile.waitForTimeout(200);assert.deepEqual((await state(mobile)).crawl,portrait.crawl);
 await mobile.setViewportSize({width:844,height:390});await mobile.waitForFunction(()=>!window.__PATTHA_TEST__.snapshot().portrait);if(await mobile.locator('#resume').isVisible())await mobile.locator('#resume').click();await trace(mobile,100);assert.equal((await state(mobile)).crawl.posture.phase,'low');
 record('multitáctil permite Gatear + avanzar, cabe en horizontal y mantiene postura al girar el celular');
 assert.deepEqual(errors,[]);record('sin errores JavaScript');
 await writeFile('docs/PRUEBAS_GATEO_05.json',JSON.stringify({fecha:new Date().toISOString(),checks,errors,lower,crawlTrace,roofTrace,returnTrace,metodo:'Chrome aislado con controles reales y cuerpo Arcade; móvil emulado multitáctil. Trazas con tiempo activo del juego.'},null,2)+'\n');
}finally{await browser.close();}
