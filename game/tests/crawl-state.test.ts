import test from 'node:test';
import assert from 'node:assert/strict';
import { CrawlPosture, hasHeadroom } from '../src/crawl-state.ts';
import { PatthaClock } from '../src/pattha-state.ts';

test('bajar y levantarse son transiciones reversibles de 180 ms activos',()=>{
 const posture=new CrawlPosture();
 const down=posture.step(90,{held:true,grounded:true,headroom:true});
 assert.deepEqual(down,{phase:'lower',amount:.5,blocked:false});
 assert.deepEqual(posture.step(9000,{held:false,grounded:true,headroom:true,suspended:true}),down);
 assert.equal(posture.step(45,{held:false,grounded:true,headroom:true}).phase,'rise');
 assert.equal(posture.step(135,{held:true,grounded:true,headroom:true}).phase,'low');
 assert.equal(posture.step(180,{held:false,grounded:true,headroom:true}).phase,'stand');
});
test('soltar bajo un techo conserva la postura baja, incluso en un borde',()=>{
 const posture=new CrawlPosture();posture.step(180,{held:true,grounded:true,headroom:true});
 assert.deepEqual(posture.step(500,{held:false,grounded:true,headroom:false}),{phase:'low',amount:1,blocked:true});
 assert.equal(posture.step(50,{held:false,grounded:false,headroom:false}).phase,'low');
 assert.equal(posture.step(180,{held:false,grounded:true,headroom:true}).phase,'stand');
 posture.reset();assert.equal(posture.step(180,{held:true,grounded:false,headroom:true}).phase,'stand');
});
test('el volumen de pie detecta techo y pared; el contacto con suelo no lo bloquea',()=>{
 const stand={left:100,right:146,top:437,bottom:540};
 assert.equal(hasHeadroom(stand,[{left:0,right:400,top:540,bottom:750}]),true);
 assert.equal(hasHeadroom(stand,[{left:99,right:200,top:420,bottom:442}]),false);
 assert.equal(hasHeadroom(stand,[{left:146,right:200,top:420,bottom:442}]),true);
 assert.equal(hasHeadroom(stand,[{left:0,right:400,top:410,bottom:435}]),true);
});
test('gateo usa ocho poses distintas, frenado y descanso, en ambas direcciones',()=>{
 const clock=new PatthaClock(),posture={phase:'low' as const,amount:1,blocked:false},seen=new Set<number>();
 for(let i=0;i<40;i++){const f=clock.step(36,{speed:i<20?125:-125,grounded:true,posture});assert.equal(f.pose,'crawl');assert.equal(f.sheet,'gateo');assert.ok(f.index>=4&&f.index<=11);seen.add(f.index);}
 assert.equal(seen.size,8);
 assert.equal(clock.step(16,{speed:0,grounded:true,posture}).pose,'crawlStop');
 assert.equal(clock.step(160,{speed:0,grounded:true,posture}).pose,'duckIdle');
 const paused=clock.snapshot();assert.deepEqual(clock.step(9000,{speed:125,grounded:true,posture,suspended:true}),paused);
});
test('bajada y subida usan las mismas cuatro poses sin girar la orientación',()=>{
 const clock=new PatthaClock();
 for(const phase of ['lower','rise'] as const){const amounts=phase==='lower'?[.1,.35,.6,.9]:[.9,.6,.35,.1];
  assert.deepEqual(amounts.map(amount=>clock.step(16,{speed:0,grounded:true,posture:{phase,amount,blocked:false}}).index),phase==='lower'?[0,1,2,3]:[3,2,1,0]);
 }
 assert.equal(clock.step(16,{speed:0,grounded:true,posture:{phase:'low',amount:1,blocked:true},hurt:true,helping:true}).pose,'duckBlocked');
});
test('el descanso bajo parpadea sin volver a una pose de pie',()=>{
 const clock=new PatthaClock(),input={speed:0,grounded:true,posture:{phase:'low' as const,amount:1,blocked:false}};
 clock.step(2200,input);const blink=clock.step(80,input);
 assert.equal(blink.pose,'duckBlink');assert.equal(blink.index,13);assert.equal(blink.sheet,'gateo');
 assert.equal(clock.step(300,input).pose,'duckIdle');
});
