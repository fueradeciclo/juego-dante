import test from 'node:test';
import assert from 'node:assert/strict';
import { AnimationClock } from '../src/animation-state.ts';

test('caminar usa velocidad real, saltar tiene prioridad y ambos reinician la espera',()=>{
  const clock=new AnimationClock();clock.step(9000,{speed:0});
  const walking=clock.step(100,{speed:150});assert.equal(walking.state,'walk');assert.equal(walking.idleMs,0);assert.ok(walking.phase>0);
  const airborne=clock.step(100,{speed:150,airborne:true});assert.equal(airborne.state,'air');assert.equal(airborne.idleMs,0);
  assert.equal(clock.step(50,{speed:0}).state,'idle');
});
test('pensar y aburrirse ocurren después de esperar; moverse los cancela',()=>{
  const clock=new AnimationClock();assert.equal(clock.step(7990,{speed:0}).state,'idle');
  const thought=clock.step(1210,{speed:0});assert.equal(thought.state,'think');assert.ok(thought.gesture>.99);
  assert.equal(clock.step(2100,{speed:0}).state,'idle');
  assert.equal(clock.step(4000,{speed:0}).state,'bored');
  assert.equal(clock.step(16,{speed:80}).state,'walk');assert.equal(clock.snapshot().idleMs,0);
});
test('la pausa congela poses, parpadeo y tiempo de espera, sin saltar al volver',()=>{
  const clock=new AnimationClock();clock.step(2200,{speed:0});
  const before=clock.step(70,{speed:0});assert.ok(before.blink>.8);
  assert.deepEqual(clock.step(60000,{speed:0,suspended:true}),before);
  const after=clock.step(16,{speed:0});assert.equal(after.elapsed,before.elapsed+16);assert.equal(after.idleMs,before.idleMs+16);
});
test('los parpadeos son breves y no empiezan todos a la vez',()=>{
  const a=new AnimationClock(0),b=new AnimationClock(4);
  a.step(2200,{speed:0});b.step(2200,{speed:0});
  assert.ok(a.step(80,{speed:0}).blink>.9);assert.equal(b.step(80,{speed:0}).blink,0);
  assert.equal(a.step(110,{speed:0}).blink,0);
});
test('reducir movimiento mantiene el parpadeo y evita gestos largos',()=>{
  const clock=new AnimationClock();const reduced=clock.step(9200,{speed:0,reducedMotion:true});
  assert.equal(reduced.state,'idle');assert.equal(reduced.motion,.15);
  assert.ok(clock.step(80,{speed:0,reducedMotion:true}).blink>.9);
});
