import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BossState,GateState,MovingPlatformState,JumpingCatState,DuoState,overlaps} from '../src/mechanism-state.ts';
const advance=(boss:BossState,ms:number,x=550)=>{for(let t=0;t<ms;t+=10)boss.step(Math.min(10,ms-t),x);return boss.snapshot();};
test('moving platform roundtrip and exact rider displacement; pause freezes it',()=>{
 const p=new MovingPlatformState({x:100,y:540,toX:400,toY:340,duration:2000,width:180,height:26},false);
 assert.equal(p.step(1000).x,100);p.activate();let riderX=100,riderY=540;
 for(let i=0;i<20;i++){const s=p.step(100);riderX+=s.dx;riderY+=s.dy;}
 assert.equal(riderX,400);assert.equal(riderY,340);const paused=p.snapshot();p.step(1000,true);assert.deepEqual(p.snapshot(),paused);
 p.step(2000);assert.equal(p.snapshot().x,100);assert.equal(p.snapshot().y,540);
});
test('gate never closes on player, including entry during closing',()=>{
 const g=new GateState({x:300,y:300,width:64,height:240});g.requestClosed();g.step(1000);g.step(100);assert.equal(g.snapshot().mode,'closing');
 g.step(10,[{x:320,y:420,width:42,height:100}]);assert.equal(g.snapshot().mode,'warning');assert.equal(g.snapshot().amount,0);
 for(let i=0;i<30;i++)g.step(100,[{x:320,y:420,width:42,height:100}]);assert.equal(g.snapshot().solid,false);
 g.step(1000);g.step(400);assert.equal(g.snapshot().solid,true);const s=g.snapshot();g.step(1000,[],true);assert.deepEqual(g.snapshot(),s);g.requestOpen();g.step(400);assert.equal(g.snapshot().mode,'open');
});
test('boss jump fixes landing before flight and has standing underpass at apex',()=>{
 const b=new BossState();advance(b,500);const target=b.snapshot().target;advance(b,500,1100);assert.equal(b.snapshot().mode,'jump');
 advance(b,700,1150);const s=b.snapshot();assert.equal(s.target,target);assert.equal(s.y,190);
 const standing={x:s.x-42,y:410,width:84,height:130};assert.equal(overlaps(standing,s.body),false);
 advance(b,700,1150);assert.equal(b.snapshot().x,target);assert.equal(b.snapshot().y,540);assert.equal(b.snapshot().mode,'recover');
});
test('boss requires Otto then correct Rural symbol; impact counts once',()=>{
 const b=new BossState();assert.equal(b.solveRural(1),false);b.helpOtto();assert.equal(b.solveRural(0),false);assert.equal(b.solveRural(1),true);
 advance(b,1400);assert.equal(b.stomp(300,b.snapshot().body.y),false);advance(b,1000);assert.equal(b.snapshot().vulnerable,true);
 assert.equal(b.stomp(0,b.snapshot().body.y),false);assert.equal(b.stomp(300,540),false);assert.equal(b.stomp(300,b.snapshot().body.y),true);assert.equal(b.stomp(300,b.snapshot().body.y),false);
 advance(b,650);assert.equal(b.save().phases,1);assert.equal(b.save().otto,false);
});
test('all three phases survive retries/reload and safe transient state',()=>{
 let b=new BossState();for(let i=0;i<3;i++){
  b.helpOtto();b.solveRural(1);b.retry();assert.equal(b.snapshot().rural,true);assert.equal(b.snapshot().mode,'ready');advance(b,2400);
  assert.ok(b.stomp(250,b.snapshot().body.y));advance(b,650);assert.equal(b.save().phases,i+1);b=new BossState(undefined,b.save());
 }
 assert.equal(b.snapshot().mode,'defeated');assert.equal(b.stomp(400,365),false);assert.throws(()=>new BossState(undefined,{phases:4,otto:true,rural:true}));assert.throws(()=>new BossState(undefined,{phases:1,otto:false,rural:true}));
});
test('boss pauses exactly and alternates warned rush after jump recovery',()=>{
 const b=new BossState();advance(b,1800);const s=b.snapshot();b.step(1000,900,true);assert.deepEqual(b.snapshot(),s);advance(b,3100);b.step(10,550);assert.equal(b.snapshot().mode,'warnRush');advance(b,1000);assert.equal(b.snapshot().mode,'rush');advance(b,1200);assert.equal(b.snapshot().mode,'recover');
});
test('cat announces fixed target, pauses, lands and rests',()=>{
 const c=new JumpingCatState(100,350,540);c.step(10,200);assert.equal(c.snapshot().mode,'warn');const target=c.snapshot().target;c.step(1000,100);assert.equal(c.snapshot().mode,'jump');c.step(500,100);assert.equal(c.snapshot().y,360);assert.equal(c.snapshot().target,target);const s=c.snapshot();c.step(100,100,true);assert.deepEqual(c.snapshot(),s);c.step(500,100);assert.equal(c.snapshot().mode,'recover');assert.equal(c.snapshot().x,350);
});
test('duo has announced separate turns and pass windows, frozen on pause',()=>{
 const d=new DuoState();for(let i=0;i<60;i++){const s=d.step(100);assert.ok(!(s.cat==='rush'&&s.dog==='rush'));}d.step(2200);assert.ok(d.snapshot().safe);const s=d.snapshot();d.step(5000,true);assert.deepEqual(d.snapshot(),s);
});
