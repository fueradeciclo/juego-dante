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
await mkdir('docs/capturas',{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:1280,height:800}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173/?test=1');await page.locator('#play:not([disabled])').waitFor();await page.locator('#play').click();
 for(let i=0;i<3;i++)await page.locator('#continue').click();
 await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().conversation?.quien==='otto',null,{timeout:45000});
 let s=await snapshot(page);assert.equal(s.mode,'playing');assert.equal(s.friendBubble,true);
 assert.equal(s.animations.find(a=>a.kind==='otto').state,'talk');
 await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().friendBubbleAlpha>.9);
 await page.screenshot({path:'docs/capturas/22-amigos-charlando.png'});
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(160);
 s=await snapshot(page);const talkingStep=s.animations.find(a=>a.kind==='otto');
 assert.equal(talkingStep.state,'talk');assert.equal(talkingStep.travel,'walk');
 await page.waitForTimeout(100);assert.notEqual((await snapshot(page)).animations.find(a=>a.kind==='otto').leftLeg,talkingStep.leftLeg);
 await page.keyboard.up('ArrowRight');
 await page.keyboard.press('Escape');const frozen=await snapshot(page);await page.waitForTimeout(300);
 s=await snapshot(page);assert.deepEqual(s.conversation,frozen.conversation);assert.deepEqual(s.animations,frozen.animations);
 await page.locator('#resume').click();
 await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().conversation?.quien==='rural');
 assert.equal((await snapshot(page)).animations.find(a=>a.kind==='rural').state,'talk');
 record('Otto le habla a Rural y Rural responde; siguen caminando al hablar y la pausa congela la charla');
 await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().conversation===null);
 const hop=await page.evaluate(async()=>{
   let lifted=false;const end=performance.now()+7000;
   while(performance.now()<end){const a=window.__PATTHA_TEST__.snapshot().animations.filter(a=>a.kind==='otto'||a.kind==='rural');if(a.some(a=>a.visualY<a.y-2)){lifted=true;break;}await new Promise(r=>requestAnimationFrame(r));}return lifted;
 });assert.equal(hop,true);record('los amigos tienen saltitos decorativos al esperar');

 for(const kind of ['gato','perro']) {
   s=await snapshot(page);const enemy=s.enemies.find(e=>e.kind===kind);
   const safeX=enemy.x+85<=enemy.max?enemy.x+85:enemy.x-85;
   await position(page,safeX,540);
   await page.waitForFunction(kind=>window.__PATTHA_TEST__.snapshot().enemies.some(e=>e.kind===kind&&e.mode==='warn'),kind);
   s=await snapshot(page);const warning=s.enemies.find(e=>e.kind===kind&&e.mode==='warn');assert.equal(warning.velocity,0);
   assert.equal(s.animations.find(a=>a.kind===kind&&Math.abs(a.x-warning.x)<1).state,'alert');
   await page.screenshot({path:`docs/capturas/23-${kind}-al-acecho.png`});
   await page.waitForFunction(kind=>window.__PATTHA_TEST__.snapshot().enemies.some(e=>e.kind===kind&&e.mode==='rush'),kind);
   await position(page,130,540);
   await page.waitForTimeout(1000);
   s=await snapshot(page);assert.ok(s.enemies.every(e=>e.x>=e.min-3&&e.x<=e.max+3));
   record(`${kind}: aviso visible, avance y patrulla dentro de sus límites`);
   // Isolate a real stomp using only player positioning; no enemy/progress mutation.
   const victim=s.enemies.find(e=>e.kind===kind);
   const count=s.defeated;
   await position(page,victim.x,victim.top-35);
   await page.waitForFunction(count=>window.__PATTHA_TEST__.snapshot().defeated===count+1,count);
   await page.keyboard.press('Escape');s=await snapshot(page);
   const disappearing=s.animations.find(a=>a.kind===kind&&a.state==='vanish');assert.ok(disappearing);
   assert.equal(s.enemies.some(e=>Math.abs(e.x-disappearing.x)<1),false);
   await page.waitForTimeout(350);assert.deepEqual((await snapshot(page)).animations,s.animations);
   await page.locator('#resume').click();await page.waitForTimeout(280);
   await page.screenshot({path:`docs/capturas/24-${kind}-desaparicion.png`});
   await page.waitForTimeout(750);s=await snapshot(page);
   assert.equal(s.defeated,count+1);assert.equal(s.animations.some(a=>a.kind===kind&&a.state==='vanish'),false);
   record(`${kind}: salto real, desaparición suave, colisión desactivada de inmediato y pausa respetada`);
   await position(page,130,540);
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(80);
 s=await snapshot(page);assert.ok(s.animations.every(a=>a.motion===.15));
 assert.ok(s.animations.filter(a=>a.kind==='otto'||a.kind==='rural').every(a=>a.visualY===a.y));
 record('movimiento reducido evita saltitos decorativos');
 const gallery=await browser.newPage({viewport:{width:1360,height:1000}});gallery.on('pageerror',e=>errors.push(e.message));
 await gallery.goto('http://localhost:5173/animaciones.html');await gallery.waitForFunction(()=>document.querySelector('#gallery-status').textContent.includes('Todos listos'));
 for(const [mode,kinds]of [['talk',['otto','rural']],['alert',['gato','perro']],['vanish',['gato','perro']]]) {
   await gallery.locator(`[data-preview="${mode}"]`).click();
   await gallery.waitForFunction(({mode,kinds})=>kinds.every(kind=>document.querySelector(`canvas[data-character="${kind}"]`).dataset.state===mode),{mode,kinds});
 }
 await gallery.locator('.character-cards').screenshot({path:'docs/capturas/25-galeria-rivales.png'});
 record('galería permite revisar charlas, acecho y desaparición');
 assert.deepEqual(errors,[]);record('sin errores JavaScript');
 await writeFile('docs/PRUEBAS_AMIGOS_Y_RIVALES.json',JSON.stringify({fecha:new Date().toISOString(),checks,errors,metodo:'Chromium aislado, tiempo activo real, saltos con posicionamiento de desarrollo, sin modificar rivales ni progreso.'},null,2)+'\n');
}finally{await browser.close();}
