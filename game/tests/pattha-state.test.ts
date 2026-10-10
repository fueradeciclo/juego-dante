import test from 'node:test';
import assert from 'node:assert/strict';
import { PatthaClock, JumpPreparation } from '../src/pattha-state.ts';

test('la carrera recorre ocho cuadros con ambas direcciones; frenar asienta las piernas',()=>{
 const clock=new PatthaClock(),seen=new Set<number>();
 for(let i=0;i<24;i++){const f=clock.step(74,{speed:285,grounded:true});assert.equal(f.pose,'run');seen.add(f.index);}
 assert.equal(seen.size,8);assert.equal(clock.step(74,{speed:-285,grounded:true}).pose,'run');
 assert.equal(clock.step(16,{speed:0,grounded:true}).pose,'stop');assert.equal(clock.step(110,{speed:0,grounded:true}).pose,'idle');
});
test('el salto cambia con la velocidad: preparación, impulso, subida, ápice, caída y aterrizaje',()=>{
 const clock=new PatthaClock();
 const inputs=[{grounded:true,crouching:true},{grounded:false,takingOff:true,vy:-620},{grounded:false,vy:-350},{grounded:false,vy:0},{grounded:false,vy:250},{grounded:true,vy:0}];
 const frames=inputs.map(input=>clock.step(16,{speed:0,...input}));
 assert.deepEqual(frames.map(f=>f.pose),['crouch','takeoff','rise','apex','fall','land']);
 assert.equal(new Set(frames.map(f=>f.index)).size,6);
 assert.equal(clock.step(110,{speed:0,grounded:true}).pose,'recover');assert.equal(clock.step(80,{speed:0,grounded:true}).pose,'idle');
});
test('la pausa congela zancada y compresión del aterrizaje',()=>{
 const clock=new PatthaClock();clock.step(40,{speed:285,grounded:true});const run=clock.snapshot();
 assert.deepEqual(clock.step(9000,{speed:0,grounded:false,suspended:true}),run);
 clock.step(30,{speed:0,grounded:false,vy:300});const land=clock.step(16,{speed:0,grounded:true});
 assert.deepEqual(clock.step(9000,{speed:0,grounded:true,suspended:true}),land);
 assert.equal(clock.step(16,{speed:0,grounded:true}).pose,'land');
});
test('Pattha conserva parpadeos y gestos de espera; correr los cancela',()=>{
 const blink=new PatthaClock();blink.step(2200,{speed:0,grounded:true});assert.equal(blink.step(80,{speed:0,grounded:true}).index,1);
 const clock=new PatthaClock();assert.equal(clock.step(9200,{speed:0,grounded:true}).pose,'think');
 assert.equal(clock.step(6200,{speed:0,grounded:true}).pose,'bored');
 assert.equal(clock.step(16,{speed:285,grounded:true}).pose,'run');assert.equal(clock.snapshot().idleMs,0);
 const reduced=new PatthaClock();assert.equal(reduced.step(9200,{speed:0,grounded:true,reducedMotion:true}).pose,'idle');
});
test('rebotar, ayudar, celebrar y recuperarse de un choque tienen poses propias',()=>{
 const clock=new PatthaClock();
 assert.equal(clock.step(16,{speed:0,grounded:false,vy:-420,rebounding:true}).pose,'rebound');
 assert.equal(clock.step(16,{speed:0,grounded:false,vy:-250,hurt:true}).pose,'hurt');
 assert.equal(clock.step(16,{speed:0,grounded:true,helping:true}).pose,'help');
 assert.equal(clock.step(16,{speed:0,grounded:true,celebrating:true}).pose,'celebrate');
});
test('agacharse dura 64 ms activos, acepta toque corto, pausa y salto desde un borde',()=>{
 const prep=new JumpPreparation();prep.begin(true);assert.equal(prep.crouching,true);
 assert.equal(prep.step(32),false);assert.equal(prep.step(5000,true),false);assert.equal(prep.crouching,true);
 assert.equal(prep.step(32),true);assert.equal(prep.crouching,false);assert.equal(prep.step(16),false);
 prep.begin(false);assert.equal(prep.step(0),true);
 prep.begin(true);prep.cancel();assert.equal(prep.step(100),false);
});
