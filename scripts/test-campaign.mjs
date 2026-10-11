import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const options={headless:true};
if(process.env.PATTHA_CHROMIUM_PATH)options.executablePath=process.env.PATTHA_CHROMIUM_PATH;
else if(!existsSync(chromium.executablePath()))options.channel='chrome';
const browser=await chromium.launch(options);
const results=[],errors=[],external=[];
const record=name=>{results.push(name);console.log('✓ '+name);};
const shot=async(page,name)=>page.screenshot({path:`docs/capturas/aventura-${name}.png`});
const snap=async page=>{await page.waitForFunction(()=>Boolean(window.__PATTHA_TEST__));return page.evaluate(()=>window.__PATTHA_TEST__.snapshot());};
const pos=(page,x,y=540)=>page.evaluate(([x,y])=>window.__PATTHA_TEST__.position(x,y),[x,y]);
const mode=(page,m)=>page.waitForFunction(m=>window.__PATTHA_TEST__?.snapshot().mode===m,m);
const ground=page=>page.waitForFunction(()=>window.__PATTHA_TEST__?.snapshot().grounded);
const lines=async page=>{for(let i=0;i<10;i++){if((await snap(page)).mode!=='dialogue')return;await page.locator('#continue').click();}throw Error('Diálogo demasiado largo');};
const monitor=page=>{page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().startsWith('http')&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});page.on('dialog',d=>d.accept());};
async function start(page){await page.goto('http://127.0.0.1:5173/?test=1');await page.locator('#play:not([disabled])').waitFor();await page.locator('#play').click();await mode(page,'dialogue');await lines(page);await ground(page);}
async function bridge(page){
 await pos(page,2470);await ground(page);
 for(const duration of [300,650]){await page.keyboard.down('Space');await page.keyboard.down('ArrowRight');await page.waitForTimeout(duration);await page.keyboard.up('ArrowRight');await page.keyboard.up('Space');await ground(page);await page.waitForTimeout(100);}
 assert.equal((await snap(page)).gear,true);
 await pos(page,2870);await ground(page);await page.keyboard.press('KeyE');await mode(page,'dialogue');await lines(page);
 await pos(page,3020);await ground(page);await page.keyboard.press('KeyE');await mode(page,'puzzle');
 await page.locator('[data-symbol="2"]').click();assert.match(await page.locator('#puzzle-feedback').innerText(),/probá otra vez/);
 for(const symbol of [0,1,2])await page.locator(`[data-symbol="${symbol}"]`).click();await lines(page);assert.equal((await snap(page)).bridge,true);
}
await mkdir('docs/capturas',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}});monitor(page);await start(page);
 const before=await snap(page);await page.keyboard.down('ArrowRight');await page.waitForTimeout(200);await page.keyboard.up('ArrowRight');assert.ok((await snap(page)).x>before.x+30);
 await page.keyboard.press('Escape');await mode(page,'paused');const pause=await snap(page);await page.waitForTimeout(200);assert.equal((await snap(page)).x,pause.x);await page.locator('#resume').click();
 record('movimiento y pausa conservados');
 await bridge(page);await pos(page,3650);await mode(page,'dialogue');assert.match(await page.locator('#line').innerText(),/candado/);await lines(page);await ground(page);await page.waitForTimeout(100);
 assert.equal((await snap(page)).checkpoint,3640);await page.reload();await page.locator('#campaign-continue').waitFor();await page.locator('#campaign-continue').click();await mode(page,'playing');assert.equal((await snap(page)).bridge,true);assert.equal((await snap(page)).checkpoint,3640);
 record('puente, marca narrativa y recarga en banderín');
 await pos(page,7150);await mode(page,'dialogue');await lines(page);await mode(page,'won');assert.ok(await page.locator('#next-chapter').isVisible());await shot(page,'sendero-completo');
 await page.locator('#next-chapter').click();await mode(page,'dialogue');await lines(page);await ground(page);assert.equal((await snap(page)).chapter,'bosque');assert.equal((await snap(page)).gear,false);assert.equal((await snap(page)).bridge,false);await shot(page,'bosque-inicio');
 record('transición de capítulo sin heredar mecanismos del sendero');
 await pos(page,1450);await ground(page);await page.waitForTimeout(80);assert.equal((await snap(page)).enemies[0].mode,'warn');await page.keyboard.press('Escape');const runner=(await snap(page)).enemies[0];await page.waitForTimeout(250);assert.equal((await snap(page)).enemies[0].remaining,runner.remaining);await page.locator('#resume').click();await page.waitForTimeout(930);assert.equal((await snap(page)).enemies[0].mode,'rush');
 await pos(page,1250);await page.waitForTimeout(1500);assert.equal((await snap(page)).enemies[0].mode,'recover');
 record('corredor avisa, corre y descansa; pausa congela su ciclo');
 const forest=JSON.parse(await readFile('data/capitulo_bosque.json','utf8'));
 for(let i=0;i<4;i++){const rival=(await snap(page)).enemies[0];const count=(await snap(page)).defeated;await pos(page,rival.x,rival.top-12);await page.waitForFunction(count=>window.__PATTHA_TEST__.snapshot().defeated>count,count);await page.waitForTimeout(950);}
 for(const [id,[x,y]] of forest.monedas.entries()){
  const floor=forest.suelo.find(([left,right])=>x>=left&&x<=right);
  if(floor){await pos(page,x);await ground(page);if(!(await snap(page)).collected.includes(id)){await page.keyboard.down('Space');await page.waitForTimeout(480);await page.keyboard.up('Space');await ground(page);}}
  else{const left=forest.suelo.filter(([,r])=>r<x).at(-1),right=forest.suelo.find(([l])=>l>x);await pos(page,left[1]-10);await ground(page);await page.keyboard.down('Space');await page.keyboard.down('ArrowRight');await page.waitForFunction(x=>window.__PATTHA_TEST__.snapshot().x>=x,right[0]+10);await page.keyboard.up('ArrowRight');await page.keyboard.up('Space');await ground(page);}
  assert.ok((await snap(page)).collected.includes(id),`Esfera del bosque ${id+1} (${x},${y}) inaccesible`);
 }
 assert.equal((await snap(page)).coins,20);await pos(page,3650,850);await page.waitForTimeout(250);assert.equal((await snap(page)).coins,20);assert.equal((await snap(page)).defeated,4);
 record('cuatro rivales superables y veinte esferas alcanzables con física y saltos; caída conserva avances');

 await pos(page,6010);await ground(page);await page.keyboard.press('KeyE');await mode(page,'dialogue');assert.match(await page.locator('#line').innerText(),/Otto/);await lines(page);
 await pos(page,3220);await ground(page);await page.keyboard.press('KeyE');await mode(page,'dialogue');await lines(page);await page.waitForTimeout(500);await page.keyboard.press('Escape');const helping=(await snap(page)).ottoHelping;await page.waitForTimeout(250);assert.equal((await snap(page)).ottoHelping,helping);await page.locator('#resume').click();await mode(page,'dialogue');await lines(page);assert.equal((await snap(page)).switch,true);await shot(page,'otto-interruptor');
 record('Otto actúa automáticamente; su ayuda pausa y habilita el panel');
 await pos(page,3330);await ground(page);await page.waitForTimeout(100);await page.reload();await page.locator('#campaign-continue').click();await mode(page,'playing');assert.equal((await snap(page)).chapter,'bosque');assert.equal((await snap(page)).switch,true);assert.equal((await snap(page)).checkpoint,3330);assert.equal((await snap(page)).coins,20);assert.equal((await snap(page)).enemies.length,0);
 await pos(page,6010);await ground(page);await page.keyboard.press('KeyE');await mode(page,'puzzle');assert.match(await page.locator('#puzzle-clue').innerText(),/estrella/);await page.locator('[data-symbol="0"]').click();assert.equal((await snap(page)).antenna,false);await shot(page,'antena-pista');await page.locator('[data-symbol="1"]').click();await lines(page);assert.equal((await snap(page)).antenna,true);
 record('guardado del bosque y orientación con pista permanente y reintentos');
 await pos(page,6110);await mode(page,'dialogue');assert.equal(await page.locator('#speaker').innerText(),'Don Candado');assert.ok(await page.locator('#candado-icon').isVisible());assert.ok(await page.locator('#portrait').isHidden());await shot(page,'mensaje-candado');await lines(page);await mode(page,'won');assert.equal(await page.locator('#win-score').innerText(),'3.000 puntos');assert.ok(await page.locator('#win-bonus').isVisible());const total=await page.locator('#campaign-total').innerText();await page.reload();await page.locator('#campaign-continue').click();await mode(page,'won');assert.equal(await page.locator('#campaign-total').innerText(),total);await shot(page,'final');
 record('mensaje sin retrato inventado y final recuperable sin duplicar puntaje');
 await page.locator('#replay').click();await lines(page);assert.equal((await snap(page)).chapter,'sendero');assert.equal((await snap(page)).coins,0);assert.equal((await snap(page)).gear,false);
 record('nueva aventura confirma y limpia el progreso');
 const voiceChecks=await page.evaluate(async()=>{
  const Original=window.Audio;const events=[];
  window.Audio=class {constructor(src){this.src=src;events.push(['new',src]);}play(){events.push(['play',this.src]);return Promise.resolve();}pause(){events.push(['pause',this.src]);}removeAttribute(){events.push(['remove']);}load(){} };
  try{const {Narration}=await import('/src/narration.ts');const n=new Narration(()=>{});n.play('assets/audio/narracion/prueba.mp3');n.repeat();n.stop();const before=events.filter(e=>e[0]==='play').length;n.toggle();n.play('assets/audio/narracion/prueba.mp3');const after=events.filter(e=>e[0]==='play').length;return {before,after,pauses:events.filter(e=>e[0]==='pause').length};}finally{window.Audio=Original;}
 });assert.equal(voiceChecks.before,2);assert.equal(voiceChecks.after,2);assert.ok(voiceChecks.pauses>=2);assert.equal(await page.locator('#repeat-voice').isEnabled(),false);
 record('soporte de voz: repetir, detener y silenciar con Audio simulado; sin archivos faltantes');
 const corrupt=await browser.newPage();monitor(corrupt);await corrupt.goto('http://127.0.0.1:5173/?test=1');await corrupt.evaluate(()=>localStorage.setItem('pattha-aventura-v1','{'));await corrupt.reload();await corrupt.locator('#play:not([disabled])').waitFor();assert.match(await corrupt.locator('#loading-status').innerText(),/guardado no es compatible/);await corrupt.locator('#play').click();await mode(corrupt,'dialogue');await lines(corrupt);
 record('guardado dañado permite comenzar nuevamente');
 const blocked=await browser.newPage();monitor(blocked);await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}}));await start(blocked);assert.equal((await snap(blocked)).storage,'unavailable');await blocked.keyboard.down('ArrowRight');await blocked.waitForTimeout(180);await blocked.keyboard.up('ArrowRight');assert.ok((await snap(blocked)).x>150);
 record('almacenamiento bloqueado no impide jugar');
 const ctx=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2});const mobile=await ctx.newPage();monitor(mobile);await start(mobile);const right=await mobile.locator('[data-action="right"]').boundingBox(),jump=await mobile.locator('[data-action="jump"]').boundingBox();const cdp=await ctx.newCDPSession(mobile);const initial=await snap(mobile);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:right.x+right.width/2,y:right.y+right.height/2,id:1},{x:jump.x+jump.width/2,y:jump.y+jump.height/2,id:2}]});await mobile.waitForTimeout(300);const moved=await snap(mobile);assert.ok(moved.x>initial.x+40);assert.ok(moved.y<initial.y-30);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await ground(mobile);await shot(mobile,'mobile-horizontal');await mobile.setViewportSize({width:390,height:844});await mobile.locator('#rotate').waitFor({state:'visible'});assert.ok(await mobile.locator('#rotate').isVisible());
 record('multitáctil y pausa vertical conservados');
 await mobile.setViewportSize({width:844,height:390});await mobile.locator('#rotate').waitFor({state:'hidden'});
 await mobile.evaluate(()=>{
  const chapter=(checkpoint,coins,enemies,forest)=>({checkpoint,gear:!forest,otto:!forest,rural:!forest,bridge:!forest,switch:forest,antenna:false,clue:!forest,symbols:forest?[]:[0,1,2],coins:Array.from({length:coins},(_,i)=>i),enemies:Array.from({length:enemies},(_,i)=>i),completed:!forest});
  localStorage.setItem('pattha-aventura-v1',JSON.stringify({version:1,chapter:'bosque',chapters:{sendero:chapter(6410,30,8,false),bosque:chapter(5000,20,4,true)}}));
 });await mobile.reload();await mobile.locator('#campaign-continue').waitFor();await shot(mobile,'mobile-menu-continuar');await mobile.locator('#campaign-continue').click();await mode(mobile,'playing');await pos(mobile,6010);await ground(mobile);await mobile.locator('[data-action="interact"]').click();await mode(mobile,'puzzle');await shot(mobile,'mobile-antena');
 const bounds=await mobile.locator('.puzzle-card').evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),stage:document.getElementById('stage').getBoundingClientRect().toJSON()}));assert.ok(bounds.rect.bottom<=bounds.stage.bottom+1);
 await mobile.locator('[data-symbol="1"]').click();await lines(mobile);await pos(mobile,6110);await mode(mobile,'dialogue');await shot(mobile,'mobile-candado');await lines(mobile);await mode(mobile,'won');assert.equal(await mobile.locator('#campaign-total').innerText(),'Total de la aventura: 7.000 puntos');await shot(mobile,'mobile-final');
 record('panel, mensaje y resumen de 7.000 puntos legibles en celular horizontal');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);record('sin errores JavaScript ni solicitudes externas');
}finally{
 await writeFile('docs/PRUEBAS_AVENTURA_05.json',JSON.stringify({fecha:new Date().toISOString(),checks:results,errors,external,limitaciones:['Posicionamiento de pruebas para aislar escenarios; no reemplaza recorrido familiar','Voces del adulto todavía no entregadas','Celular emulado; pendiente dispositivo físico']},null,2));await browser.close();
}
