import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';
import { validateLevelLayout } from '../game/src/level-layout.ts';
import { scoreLevel } from '../game/src/rules.ts';

const level=JSON.parse(await readFile('data/demo_plataformas.json','utf8'));
const checks=[],errors=[],external=[],collectedTrace=[];
const record=name=>{checks.push(name);console.log('✓ '+name);};
const snapshot=page=>page.evaluate(()=>window.__PATTHA_TEST__.snapshot());
const position=(page,x,y)=>page.evaluate(([x,y])=>window.__PATTHA_TEST__.position(x,y),[x,y]);
const waitMode=(page,mode)=>page.waitForFunction(mode=>window.__PATTHA_TEST__?.snapshot().mode===mode,mode);
const waitGround=page=>page.waitForFunction(()=>window.__PATTHA_TEST__.snapshot().grounded);
const options={headless:true};
if(process.env.PATTHA_CHROMIUM_PATH)options.executablePath=process.env.PATTHA_CHROMIUM_PATH;
else if(!existsSync(chromium.executablePath()))options.channel='chrome';
const browser=await chromium.launch(options);
await mkdir('docs/capturas',{recursive:true});
const monitor=page=>{
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.url().startsWith('http')&&!/^(localhost|127\.0\.0\.1)$/.test(new URL(r.url()).hostname))external.push(r.url());});
};
async function start(page) {
 await page.goto('http://localhost:5173/?test=1');
 await page.locator('#play:not([disabled])').waitFor();await page.locator('#play').click();
 await waitMode(page,'dialogue');for(let i=0;i<3;i++)await page.locator('#continue').click();
 await waitMode(page,'playing');await waitGround(page);
}
async function jump(page,rightMs=0) {
 await page.keyboard.down('Space');if(rightMs)await page.keyboard.down('ArrowRight');
 await page.waitForTimeout(rightMs||480);
 if(rightMs)await page.keyboard.up('ArrowRight');await page.keyboard.up('Space');await waitGround(page);
}
async function openBridge(page) {
 await position(page,2470,540);await waitGround(page);await jump(page,300);
 await page.waitForTimeout(100);await jump(page,650);assert.equal((await snapshot(page)).gear,true);
 await position(page,2870,540);await waitGround(page);await page.keyboard.press('KeyE');await waitMode(page,'dialogue');await page.locator('#continue').click();
 await position(page,3020,540);await waitGround(page);await page.keyboard.press('KeyE');await waitMode(page,'puzzle');
 for(const symbol of [0,1,2])await page.locator(`[data-symbol="${symbol}"]`).click();
 await waitMode(page,'dialogue');await page.locator('#continue').click();assert.equal((await snapshot(page)).bridge,true);
}
async function finish(page) {
 await position(page,7150,540);await waitMode(page,'dialogue');
 for(let i=0;i<2;i++)await page.locator('#continue').click();await waitMode(page,'won');
}
function number(text) {return Number(text.replace(/[^\d]/g,''));}
try {
 const page=await browser.newPage({viewport:{width:1280,height:800}});monitor(page);await start(page);
 assert.deepEqual(validateLevelLayout(level),[]);
 await position(page,680,540);await waitGround(page);
 await page.screenshot({path:'docs/capturas/29-esferas-espacios-libres.png'});
 record('30 esferas sin alineación vertical con plataformas ni con el puente');

 // A flag cannot be activated from the air; each respawn lies on firm ground.
 await position(page,level.puestos_control[0],400);await page.waitForTimeout(100);
 assert.equal((await snapshot(page)).checkpoint,130);
 for(const x of level.puestos_control) {
  await position(page,x,540);await waitGround(page);
  await page.waitForFunction(x=>window.__PATTHA_TEST__.snapshot().checkpoint===x,x);
 }
 await page.screenshot({path:'docs/capturas/30-checkpoint-separado.png'});
 await position(page,4800,850);await page.waitForTimeout(200);
 const safe=await snapshot(page);assert.equal(safe.checkpoint,level.puestos_control.at(-1));assert.ok(Math.abs(safe.y-540)<2);
 record('cinco checkpoints separados, activación al pisar suelo y reaparición segura');

 // Restart, then clear the patrols by real stomp collisions to isolate collectible reach.
 await page.keyboard.press('Escape');await page.locator('#restart').click();await waitMode(page,'dialogue');
 for(let i=0;i<3;i++)await page.locator('#continue').click();await waitGround(page);
 for(let i=0;i<level.enemigos.length;i++) {
  const rival=(await snapshot(page)).enemies[0];assert.ok(rival);
  const before=(await snapshot(page)).defeated;
  await position(page,rival.x,rival.top-12);
  await page.waitForFunction(before=>window.__PATTHA_TEST__.snapshot().defeated>before,before);
  await page.waitForTimeout(1000); // Wait for the defeated host to finish fading and leave the group.
 }

 // Only starting positions are adapted. All collection uses physics and real jumps.
 for(const [id,[x,y]] of level.monedas.entries()) {
  const ground=level.suelo.find(([left,right])=>x>=left&&x<=right);
  if(ground) {
   await position(page,x,level.mundo.piso);await waitGround(page);
   if(!(await snapshot(page)).collected.includes(id))await jump(page);
  } else {
   const leftGround=level.suelo.filter(([,right])=>right<x).at(-1);
   const rightGround=level.suelo.find(([left])=>left>x);
   assert.ok(leftGround&&rightGround,'La esfera en un pozo necesita suelo a ambos lados.');
   await position(page,leftGround[1]-10,level.mundo.piso);await waitGround(page);
   await page.keyboard.down('Space');await page.keyboard.down('ArrowRight');
   await page.waitForFunction(target=>window.__PATTHA_TEST__.snapshot().x>=target,rightGround[0]+10);
   await page.keyboard.up('ArrowRight');await page.keyboard.up('Space');await waitGround(page);
  }
  const state=await snapshot(page);
  assert.ok(state.collected.includes(id),`La esfera ${id+1} (${x},${y}) tiene que ser alcanzable.`);
  collectedTrace.push({esfera:id+1,x,y,recogida:true,salto:!ground||y<430});
 }
 assert.equal((await snapshot(page)).coins,level.monedas.length);
 await position(page,...level.monedas[0]);await page.waitForTimeout(50);assert.equal((await snapshot(page)).coins,level.monedas.length);
 await position(page,4800,850);await page.waitForTimeout(200);assert.equal((await snapshot(page)).coins,level.monedas.length);
 await page.waitForTimeout(550); // Let the brief respawn recovery release horizontal movement.
 record('todas las esferas alcanzables con caminata o salto; duplicados y caídas conservan el conteo');

 await openBridge(page);await finish(page);
 const full=scoreLevel(new Set((await snapshot(page)).collected),level.monedas.length,level.puntaje);
 assert.equal(number(await page.locator('#win-base').innerText()),full.base);
 assert.equal(number(await page.locator('#win-score').innerText()),full.total);
 assert.ok(await page.locator('#win-bonus').isVisible());assert.match(await page.locator('#win-bonus').innerText(),/Todas las esferas/);
 assert.equal(full.total,4000);await page.screenshot({path:'docs/capturas/31-final-bonus-todas.png'});
 record('30 de 30: 3.000 puntos de esferas + 1.000 de bonus = 4.000 al finalizar');
 await page.setViewportSize({width:844,height:390});
 const layout=await page.locator('.win-card').evaluate(card=>({scroll:card.scrollHeight,height:card.clientHeight,rect:card.getBoundingClientRect().toJSON(),stage:document.querySelector('#stage').getBoundingClientRect().toJSON()}));
 assert.ok(layout.scroll<=layout.height+1,'El resumen completo debe caber en horizontal.');
 assert.ok(layout.rect.bottom<=layout.stage.bottom+1);
 await page.screenshot({path:'docs/capturas/32-final-bonus-horizontal.png'});
 record('puntaje, bonus y replay visibles en pantalla horizontal 844×390');
 await page.locator('#replay').click();await waitMode(page,'dialogue');
 assert.equal((await snapshot(page)).coins,0);assert.equal((await snapshot(page)).checkpoint,130);
 assert.ok(await page.locator('#win-bonus').isHidden());
 record('otra aventura limpia las esferas, checkpoints y bonus anterior');

 const context=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
 const mobile=await context.newPage();monitor(mobile);await start(mobile);
 await position(mobile,200,540);await waitGround(mobile);await openBridge(mobile);await finish(mobile);
 const partial=scoreLevel(new Set((await snapshot(mobile)).collected),level.monedas.length,level.puntaje);
 assert.ok(partial.collected>0&&partial.collected<level.monedas.length);
 assert.equal(number(await mobile.locator('#win-score').innerText()),partial.base);
 assert.ok(await mobile.locator('#win-bonus').isHidden());assert.ok(await mobile.locator('#win-tip').isVisible());
 await mobile.screenshot({path:'docs/capturas/33-final-parcial-horizontal.png'});
 record('final parcial en mobile: solo puntos recogidos, sin bonus y con pista para otra partida');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);record('sin errores JavaScript ni solicitudes externas');
 await writeFile('docs/PRUEBAS_ESCENARIOS_04.json',JSON.stringify({fecha:new Date().toISOString(),entorno:'Chromium aislado; escritorio 1280×800 y horizontal 844×390; emulación táctil para final parcial',metodo:'Se adapta la posición inicial para aislar cada escenario. Las esferas se recogen por física con caminata/saltos de teclado; se superan rivales por colisión desde arriba y el puente se abre jugando. No se modifican esferas, puntos ni progreso. No equivale a una partida familiar continua.',checks,esferas:collectedTrace,puntaje_completo:full,puntaje_parcial:partial,errors,external},null,2)+'\n');
} finally {await browser.close();}
