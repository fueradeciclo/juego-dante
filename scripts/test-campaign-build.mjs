import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { readFile,writeFile } from 'node:fs/promises';
const options={headless:true};if(process.env.PATTHA_CHROMIUM_PATH)options.executablePath=process.env.PATTHA_CHROMIUM_PATH;else if(!existsSync(chromium.executablePath()))options.channel='chrome';
const browser=await chromium.launch(options),errors=[],failed=[],external=[],checks=[];
try{
 const page=await browser.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});page.on('request',r=>{if(r.url().startsWith('http')&&new URL(r.url()).hostname!=='127.0.0.1')external.push(r.url());});
 const url='http://127.0.0.1:4174/pattha_game/?test=1';await page.goto(url);await page.locator('#play:not([disabled])').waitFor();assert.equal(await page.evaluate(()=>typeof window.__PATTHA_TEST__),'undefined');await page.screenshot({path:'docs/capturas/aventura-build-menu.png'});checks.push('build bajo /pattha_game/ carga sin adaptador de pruebas');
 await page.evaluate(()=>{
  const state=(forest)=>({checkpoint:forest?5000:6410,gear:!forest,otto:!forest,rural:!forest,bridge:!forest,switch:forest,antenna:false,clue:!forest,symbols:forest?[]:[0,1,2],coins:Array.from({length:forest?20:30},(_,i)=>i),enemies:Array.from({length:forest?4:8},(_,i)=>i),completed:!forest});
  localStorage.setItem('pattha-aventura-v1',JSON.stringify({version:1,chapter:'bosque',chapters:{sendero:state(false),bosque:state(true)}}));
 });await page.reload();await page.locator('#campaign-continue').click();await page.locator('#menu').waitFor({state:'hidden'});await page.waitForTimeout(150);await page.keyboard.down('ArrowRight');
 for(let i=0;i<9;i++){await page.keyboard.down('Space');await page.waitForTimeout(430);await page.keyboard.up('Space');await page.waitForTimeout(250);}
 await page.keyboard.up('ArrowRight');await page.keyboard.down('ArrowLeft');await page.waitForTimeout(550);await page.keyboard.up('ArrowLeft');await page.waitForTimeout(500);await page.screenshot({path:'docs/capturas/aventura-build-antes-antena.png'});await page.keyboard.press('KeyE');await page.locator('#puzzle:not([hidden])').waitFor();await page.screenshot({path:'docs/capturas/aventura-mobile-antena.png'});
 const sizes=await page.locator('.symbol-buttons').evaluate(el=>[...el.querySelectorAll('button')].map(b=>({scroll:b.scrollWidth,width:b.clientWidth,height:b.clientHeight,scrollHeight:b.scrollHeight})));for(const b of sizes){assert.ok(b.scroll<=b.width+1);assert.ok(b.scrollHeight<=b.height+1);}checks.push('antena alcanzable por controles reales; símbolos caben dentro de botones móviles');
 await page.locator('[data-symbol="1"]').click();await page.locator('#continue').click();await page.keyboard.down('ArrowRight');await page.waitForTimeout(1100);await page.keyboard.up('ArrowRight');await page.locator('#dialogue:not([hidden])').waitFor();assert.equal(await page.locator('#speaker').innerText(),'Don Candado');await page.screenshot({path:'docs/capturas/aventura-mobile-candado.png'});
 for(let i=0;i<4;i++)await page.locator('#continue').click();await page.locator('#won:not([hidden])').waitFor();assert.equal(await page.locator('#campaign-total').innerText(),'Total de la aventura: 7.000 puntos');await page.screenshot({path:'docs/capturas/aventura-mobile-final.png'});checks.push('final completo y narrativo del bosque en build con 7.000 puntos');
 await page.goto('http://127.0.0.1:4174/pattha_game/animaciones.html');await page.locator('#pattha-showcase').waitFor();await page.waitForTimeout(700);checks.push('galería disponible desde subcarpeta');
 const concept=await browser.newPage({viewport:{width:1440,height:900}});await concept.setContent(await readFile('assets/escenarios/conceptos/bosque-antenas-v1.svg','utf8'));await concept.screenshot({path:'docs/capturas/aventura-conceptos.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);checks.push('sin errores JS, recursos faltantes o solicitudes externas');
 for(const name of checks)console.log('✓ '+name);
}finally{await writeFile('docs/PRUEBAS_BUILD_AVENTURA_05.json',JSON.stringify({checks,errors,failed,external},null,2)+'\n');await browser.close();}
