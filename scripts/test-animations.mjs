import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const options={headless:true};
if(process.env.PATTHA_CHROMIUM_PATH)options.executablePath=process.env.PATTHA_CHROMIUM_PATH;
else if(!existsSync(chromium.executablePath()))options.channel='chrome';
const browser=await chromium.launch(options);
const checks=[],errors=[];
const record=name=>{checks.push(name);console.log('✓ '+name);};
const monitor=page=>page.on('pageerror',e=>errors.push(e.message));
const snapshot=page=>page.evaluate(()=>window.__PATTHA_TEST__.snapshot());
const portraits=page=>page.evaluate(()=>[...document.querySelectorAll('canvas[data-character]')].map(c=>({kind:c.dataset.character,state:c.dataset.state,eye:c.dataset.eye,pixels:c.toDataURL()})));
await mkdir('docs/capturas',{recursive:true});
try {
  const gallery=await browser.newPage({viewport:{width:1360,height:900}});monitor(gallery);
  await gallery.goto('http://localhost:5173/animaciones.html');
  await gallery.waitForFunction(()=>document.querySelector('#gallery-status').textContent.includes('Todos listos'));
  const initial=await portraits(gallery);assert.equal(initial.length,5);
  await gallery.locator('[data-preview="walk"]').click();
  await gallery.waitForFunction(()=>[...document.querySelectorAll('[data-character]')].every(c=>c.dataset.state==='walk'));
  const first=await portraits(gallery);await gallery.waitForTimeout(200);const second=await portraits(gallery);
  for(let i=0;i<5;i++)assert.notEqual(first[i].pixels,second[i].pixels,first[i].kind+' camina');
  await gallery.screenshot({path:'docs/capturas/08-animaciones-caminar.png'});
  record('los cinco personajes cambian sus dibujos al caminar');
  await gallery.locator('[data-preview="blink"]').click();
  await gallery.waitForFunction(()=>[...document.querySelectorAll('[data-character]')].every(c=>Number(c.dataset.eye)===1));
  const blink=await portraits(gallery);
  for(let i=0;i<5;i++)assert.notEqual(initial[i].pixels,blink[i].pixels,blink[i].kind+' parpadea');
  await gallery.screenshot({path:'docs/capturas/09-animaciones-parpadear.png'});
  record('los cinco personajes tienen una pose de ojos cerrados');
  for(const [mode,file] of [['think','10-animaciones-pensar.png'],['bored','11-animaciones-aburrirse.png']]) {
    await gallery.locator(`[data-preview="${mode}"]`).click();
    await gallery.waitForFunction(mode=>[...document.querySelectorAll('[data-character]')].every(c=>c.dataset.state===mode),mode);
    await gallery.screenshot({path:'docs/capturas/'+file});
  }
  record('vista familiar permite comparar pensar y aburrirse en los cinco personajes');

  const page=await browser.newPage({viewport:{width:1280,height:800}});monitor(page);
  await page.goto('http://localhost:5173/?test=1');await page.locator('#play:not([disabled])').waitFor();
  await page.locator('#play').click();for(let i=0;i<3;i++)await page.locator('#continue').click();
  await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().animations.filter(a=>['pattha','otto','rural'].includes(a.kind)).every(a=>a.state==='think'&&a.gesture>.2),null,{timeout:16000});
  await page.screenshot({path:'docs/capturas/12-espera-pensando.png'});
  let s=await snapshot(page);assert.ok(s.animations.some(a=>a.kind==='gato'&&a.state==='walk'));assert.ok(s.animations.some(a=>a.kind==='perro'&&a.state==='walk'));
  record('esperar en el nivel activa pensar en el trío; gatos y perros caminan al patrullar');
  await page.keyboard.press('Escape');const frozen=(await snapshot(page)).animations;
  await page.waitForTimeout(300);assert.deepEqual((await snapshot(page)).animations,frozen);
  await page.locator('#resume').click();await page.keyboard.down('ArrowRight');await page.waitForTimeout(170);
  s=await snapshot(page);const player=s.animations.find(a=>a.kind==='pattha');assert.equal(player.state,'walk');assert.equal(player.idleMs,0);assert.equal(player.pose,'run');assert.equal(player.sheet,'carrera');
  await page.keyboard.up('ArrowRight');await page.keyboard.down('Space');await page.waitForTimeout(130);
  assert.equal((await snapshot(page)).animations.find(a=>a.kind==='pattha').state,'air');await page.keyboard.up('Space');
  record('pausa congela todos los rigs; caminar cancela pensar y saltar cambia la pose');
  await page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().grounded);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(70);
  assert.ok((await snapshot(page)).animations.every(a=>a.motion===.15));
  record('preferencia de movimiento reducido se aplica también al nivel');

  const mobile=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2});monitor(mobile);
  await mobile.goto('http://localhost:5173/animaciones.html');
  await mobile.waitForFunction(()=>document.querySelector('#gallery-status').textContent.includes('Todos listos'));
  await mobile.locator('[data-preview="walk"]').click();await mobile.waitForTimeout(100);
  assert.equal(await mobile.locator('canvas[data-character]').count(),5);
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await mobile.screenshot({path:'docs/capturas/13-animaciones-mobile.png'});
  record('galería horizontal mobile sin desborde de ancho');
  assert.deepEqual(errors,[]);record('sin errores JavaScript de animación');
  await writeFile('docs/PRUEBAS_ANIMACIONES.json',JSON.stringify({fecha:new Date().toISOString(),checks,errors,metodo:'Reloj unitario, poses pintadas en Canvas, controles de teclado y espera real en Chromium; mobile horizontal emulado.'},null,2)+'\n');
} finally {await browser.close();}
