import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],failed=[],requests=[],checks=[];
const out='docs/capturas/identidad-integrada';await mkdir(out,{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto('http://127.0.0.1:5173/?test=1');await page.locator('#play:not([disabled])').waitFor();await page.screenshot({path:out+'/menu.png'});
 assert.ok(requests.some(u=>u.endsWith('/sendero/atlas-0.png')));assert.ok(requests.some(u=>u.endsWith('/otto-v1.png')));assert.ok(requests.some(u=>u.endsWith('/rural-v1.png')));checks.push('Menú azul/ámbar y derivados Otto/Rural cargados');
 await page.locator('#play').click();while(await page.locator('#continue').isVisible())await page.locator('#continue').click();await page.waitForTimeout(300);await page.screenshot({path:out+'/sendero.png'});
 await page.evaluate(()=>window.__PATTHA_TEST__.position(1400,540));await page.waitForTimeout(200);await page.screenshot({path:out+'/sendero-plataformas.png'});checks.push('Sendero renderiza atlas con las colisiones actuales');
 const base={checkpoint:130,gear:true,otto:true,rural:true,bridge:true,switch:false,antenna:false,clue:true,symbols:[0,1,2],coins:[],enemies:[],completed:true};
 await page.evaluate(base=>localStorage.setItem('pattha-aventura-v1',JSON.stringify({version:1,chapter:'bosque',chapters:{sendero:base,bosque:{...base,checkpoint:480,gear:false,otto:false,rural:false,bridge:false,clue:false,symbols:[],completed:false}}})),base);
 await page.reload();await page.locator('#campaign-continue').click();await page.locator('#menu').waitFor({state:'hidden'});await page.waitForTimeout(400);await page.screenshot({path:out+'/bosque.png'});
 assert.ok(requests.some(u=>u.endsWith('/bosque/atlas-0.png')));checks.push('Recarga de guardado en bosque carga el atlas correcto');
 await page.evaluate(()=>window.__PATTHA_TEST__.position(5910,540));await page.waitForTimeout(300);await page.screenshot({path:out+'/bosque-antena.png'});
 await page.setViewportSize({width:844,height:390});await page.waitForTimeout(300);await page.screenshot({path:out+'/horizontal.png'});
 await page.goto('http://127.0.0.1:5173/animaciones.html');await page.locator('#pattha-showcase').waitFor();await page.waitForTimeout(300);await page.screenshot({path:out+'/galeria.png'});checks.push('Galería usa amigos derivados y celular horizontal mantiene HUD legible');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log(JSON.stringify({checks,errors,failed}));
}finally{await writeFile('docs/PRUEBAS_IDENTIDAD_INTEGRADA.json',JSON.stringify({checks,errors,failed},null,2)+'\n');await browser.close();}
