import test from 'node:test';
import assert from 'node:assert/strict';
import { AllyFollower, allyTarget, AmbientPass, FriendConversation, RivalPatrol, type FriendChats } from '../src/companion-state.ts';
import { AnimationClock } from '../src/animation-state.ts';

const input={x:150,playerX:200,playerY:540,floor:540,min:100,max:300,speed:70};
test('los rivales avisan antes de avanzar; la pausa congela el aviso',()=>{
  const rival=new RivalPatrol();
  const warning=rival.step(16,input);assert.equal(warning.mode,'warn');assert.equal(warning.velocity,0);
  assert.deepEqual(rival.step(5000,{...input,suspended:true}),warning);
  assert.equal(rival.step(479,input).mode,'warn');
  const rush=rival.step(1,input);assert.equal(rush.mode,'rush');assert.equal(rush.velocity,112);
  assert.equal(rival.step(850,input).mode,'recover');
});
test('el avance no abandona la patrulla ni sigue al jugador fuera de su tramo',()=>{
  const rival=new RivalPatrol();rival.step(16,input);rival.step(480,input);
  const edge=rival.step(50,{...input,x:299});assert.ok(299+edge.velocity*.05<=300);
  const turn=rival.step(16,{...input,x:300});assert.equal(turn.mode,'recover');assert.ok(turn.velocity<0);
  const distant=new RivalPatrol().step(16,{...input,playerX:350});assert.equal(distant.mode,'patrol');
});
test('la charla alterna los dos amigos y da tiempo de leer; no avanza en un diálogo o pausa',()=>{
  const chats:FriendChats={camino:[{quien:'otto',texto:'¡Vamos juntos!'},{quien:'rural',texto:'¡Dale!'}],puente:[{quien:'rural',texto:'¡El puente!'}]};
  const chat=new FriendConversation();assert.equal(chat.step(19999,'camino',chats),null);
  assert.equal(chat.step(1,'camino',chats)?.quien,'otto');
  assert.equal(chat.step(30000,'camino',chats,true)?.quien,'otto');
  assert.equal(chat.step(4400,'camino',chats),null);
  assert.equal(chat.step(400,'camino',chats)?.quien,'rural');
  assert.equal(chat.step(4800,'camino',chats),null);
  assert.equal(chat.step(59999,'camino',chats),null);
  assert.equal(chat.step(1,'camino',chats)?.quien,'otto');
  assert.equal(chat.step(16,'puente',chats),null);
  assert.equal(chat.step(30000,'puente',chats),null);
  assert.equal(chat.step(30000,'puente',chats)?.quien,'rural');
});
test('los aliados alcanzan una carrera sostenida y giran con aceleración limitada',()=>{
  const follower=new AllyFollower(100,540),dt=1000/60;
  let playerX=200,previous=follower.snapshot();
  for(let frame=0;frame<300;frame++){
    playerX+=285*dt/1000;
    const current=follower.step(dt,{x:playerX-72,y:540});
    assert.ok(Math.abs(current.x-previous.x)<=420*dt/1000+.1);
    assert.ok(Math.abs(current.vx-previous.vx)<=2200*dt/1000+2);
    previous=current;
  }
  assert.ok(playerX-previous.x<105);assert.ok(Math.abs(previous.vx-285)<2);
  for(let frame=0;frame<150;frame++){
    playerX-=285*dt/1000;
    const current=follower.step(dt,{x:playerX+72,y:540});
    assert.ok(Math.abs(current.vx-previous.vx)<=2200*dt/1000+2);
    previous=current;
  }
  assert.ok(Math.abs(playerX-previous.x)<105);assert.equal(previous.facing,-1);
});
test('el seguimiento no depende de la frecuencia de cuadros y se congela al pausar',()=>{
  const run=(fps:number)=>{
    const follower=new AllyFollower(100,540);
    for(let i=0;i<fps*2;i++)follower.step(1000/fps,{x:600,y:390});
    const final=follower.snapshot();assert.deepEqual(follower.step(5000,{x:900,y:100},true),final);return final;
  };
  const low=run(30),high=run(120);assert.ok(Math.abs(low.x-high.x)<.1);assert.ok(Math.abs(low.y-high.y)<.1);
});
test('el destino de los ratones no salta al cruzar el antiguo corte o el puente',()=>{
  for(const x of [270,2690,2950,3150])for(const i of [0,1]){
    const before=allyTarget({x:x-.01,y:540},1,i,7400),after=allyTarget({x:x+.01,y:540},1,i,7400);
    assert.ok(Math.abs(after.x-before.x)<.1);
  }
  const follower=new AllyFollower(5000,540);follower.reset({x:250,y:540},true);
  assert.equal(follower.snapshot().x,250);assert.equal(follower.snapshot().alpha,0);
  assert.ok(follower.step(100,{x:250,y:540}).alpha>0);
});
test('las avionetas pasan espaciadas; la pausa y movimiento reducido congelan el vuelo',()=>{
  const flight=new AmbientPass();assert.equal(flight.step(4999).visible,false);
  const start=flight.step(1);assert.equal(start.visible,true);
  const moving=flight.step(1000);assert.ok(moving.x>start.x);
  assert.deepEqual(flight.step(30000,true),moving);
  assert.equal(flight.step(30000,false,true).visible,false);assert.equal(flight.snapshot().elapsed,moving.elapsed);
  assert.equal(flight.step(19000).visible,false);
  const next=flight.step(44000);assert.equal(next.visible,true);assert.equal(next.direction,-1);
});
test('la desaparición dura 900 ms activos y congela su pose al pausar',()=>{
  const clock=new AnimationClock();
  const start=clock.step(180,{speed:0,defeated:true});assert.equal(start.state,'vanish');assert.equal(start.gesture,.2);
  assert.deepEqual(clock.step(10000,{speed:0,defeated:true,suspended:true}),start);
  assert.equal(clock.step(720,{speed:0,defeated:true,reducedMotion:true}).gesture,1);
  assert.equal(clock.snapshot().motion,.15);
});
test('hablar conserva el paso y la pose aérea mientras los amigos siguen a Pattha',()=>{
  const clock=new AnimationClock();
  const talking=clock.step(100,{speed:120,talking:true});assert.equal(talking.state,'talk');assert.equal(talking.travel,'walk');
  const phase=talking.phase;assert.ok(clock.step(100,{speed:120,talking:true}).phase>phase);
  assert.equal(clock.step(16,{speed:120,talking:true,airborne:true}).travel,'air');
});
