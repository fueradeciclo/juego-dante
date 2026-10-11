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
const snap=p=>p.evaluate(()=>window.__PATTHA_TEST__.snapshot());
const playing=p=>p.waitForFunction(()=>window.__PATTHA_TEST__?.snapshot().mode==='playing');
async function intro(p){await p.waitForFunction(()=>window.__PATTHA_TEST__&&['playing','dialogue'].includes(window.__PATTHA_TEST__.snapshot().mode));for(let i=0;i<10;i++){if((await snap(p)).mode!=='dialogue')break;await p.locator('#continue').click();}await playing(p);}
await mkdir('docs/capturas',{recursive:true});
try{
 const gallery=await browser.newPage({viewport:{width:1280,height:800}});monitor(gallery);await gallery.emulateMedia({reducedMotion:'reduce'});
 await gallery.goto('http://127.0.0.1:5173/animaciones.html');await gallery.waitForFunction(()=>document.querySelector('#sky-preview')?.dataset.flight==='still');
 await gallery.locator('#preview-flight').click();await gallery.waitForFunction(()=>document.querySelector('#sky-preview').dataset.flight==='flying');
 const first=await gallery.locator('#sky-preview').evaluate(c=>({x:Number(c.dataset.x),image:c.toDataURL()}));
 await gallery.waitForFunction(x=>Number(document.querySelector('#sky-preview').dataset.x)>x+30,first.x);
 const second=await gallery.locator('#sky-preview').evaluate(c=>({x:Number(c.dataset.x),image:c.toDataURL()}));assert.notEqual(first.image,second.image);
 await gallery.locator('.sky-showcase').screenshot({path:'docs/capturas/35-avioneta-galeria.png'});
 record('la galería permite ver un vuelo real incluso con reducir movimiento; cambian los píxeles del cielo');
 await gallery.setViewportSize({width:844,height:390});await gallery.locator('#preview-flight').click();assert.equal(await gallery.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await gallery.locator('.sky-showcase').screenshot({path:'docs/capturas/36-avioneta-galeria-horizontal.png'});
 record('vista previa sin desborde en móvil horizontal');await gallery.close();

 const page=await browser.newPage({viewport:{width:1280,height:800}});monitor(page);await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:5173/?test=1');await page.locator('#play:not([disabled])').waitFor();
 assert.equal(await page.locator('#menu [data-airplanes-toggle]').isChecked(),false);
 await page.locator('#menu [data-airplanes-toggle]').check();await page.locator('#play').click();await intro(page);
 await page.waitForFunction(()=>{const a=window.__PATTHA_TEST__.snapshot().ambient;return a.visible&&a.x>430&&a.x<800;});
 const flight=(await snap(page)).ambient;assert.ok(flight.elapsed<10000);assert.equal(flight.alpha,.72);assert.equal(flight.depth,-6.5);
 await page.screenshot({path:'docs/capturas/37-avioneta-sendero.png'});record('opción explícita activa avionetas bajo reducir movimiento; primer vuelo visible antes de diez segundos');
 await page.keyboard.press('Escape');const paused=(await snap(page)).ambient;await page.waitForTimeout(220);assert.deepEqual((await snap(page)).ambient,paused);
 await page.locator('#paused [data-airplanes-toggle]').uncheck();await page.waitForFunction(()=>!window.__PATTHA_TEST__.snapshot().ambient.visible);
 await page.locator('#paused [data-airplanes-toggle]').check();await page.locator('#resume').click();await page.waitForFunction(x=>window.__PATTHA_TEST__.snapshot().ambient.x>x+10,paused.x);
 record('pausa congela el vuelo y el control permite ocultarlo o reanudarlo sin reiniciar la partida');
 await page.reload();await page.locator('#play:not([disabled])').waitFor();assert.equal(await page.locator('#menu [data-airplanes-toggle]').isChecked(),true);record('la elección se conserva al recargar');
 await page.evaluate(()=>{
  const state={checkpoint:130,gear:false,otto:false,rural:false,bridge:false,switch:false,antenna:false,clue:false,symbols:[],coins:[],enemies:[],completed:false};
  localStorage.setItem('pattha-aventura-v1',JSON.stringify({version:1,chapter:'bosque',chapters:{sendero:{...state,gear:true,otto:true,rural:true,bridge:true,symbols:[0,1,2],completed:true},bosque:state}}));
 });await page.reload();await page.locator('#campaign-continue:not([hidden])').waitFor();await page.locator('#campaign-continue').click();await intro(page);
 await page.waitForFunction(()=>{const a=window.__PATTHA_TEST__.snapshot().ambient;return a.visible&&a.x>430&&a.x<800;});assert.equal((await snap(page)).chapter,'bosque');
 await page.screenshot({path:'docs/capturas/38-avioneta-bosque.png'});record('el vuelo también se renderiza en el Bosque de Antenas por encima de las copas');
 const automatic=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true});monitor(automatic);await automatic.emulateMedia({reducedMotion:'no-preference'});
 await automatic.goto('http://127.0.0.1:5173/?test=1');await automatic.locator('#play:not([disabled])').waitFor();assert.equal(await automatic.locator('#menu [data-airplanes-toggle]').isChecked(),true);
 assert.equal(await automatic.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await automatic.emulateMedia({reducedMotion:'reduce'});await automatic.waitForFunction(()=>!document.querySelector('#menu [data-airplanes-toggle]').checked);
 record('sin preferencia explícita se respeta reducir movimiento y el menú móvil cabe');
 assert.deepEqual(errors,[]);record('sin errores JavaScript');
}finally{await writeFile('docs/PRUEBAS_AVIONETAS.json',JSON.stringify({fecha:new Date().toISOString(),checks,errors,metodo:'Navegador aislado: galería, vuelo en ambos capítulos, preferencias, pausa, recarga y móvil horizontal emulado.'},null,2)+'\n');await browser.close();}
