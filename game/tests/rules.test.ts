import test from 'node:test';
import assert from 'node:assert/strict';
import { canJump, canStomp, chooseSymbol, collectCoin, createProgress, helpOtto, scoreLevel } from '../src/rules.ts';

test('permite el salto justo después del borde y consume ventanas vencidas',()=>{
 assert.equal(canJump(1000,910,1080),true);
 assert.equal(canJump(1040,910,1080),false);
 assert.equal(canJump(1100,1090,1080),false);
 assert.equal(canJump(1000,-Infinity,1080),false);
});
test('pisar desde arriba y caer supera al rival; choque lateral o subida no',()=>{
 assert.equal(canStomp(140,120,100),true);
 assert.equal(canStomp(-140,120,100),false);
 assert.equal(canStomp(140,160,100),false);
});
test('el puente requiere tuerca, aporte de Otto y señal de Rural',()=>{
 const p=createProgress();
 assert.equal(helpOtto(p),false);
 assert.equal(chooseSymbol(p,0),'retry');
 assert.equal(p.bridge,false);
 p.gear=true;assert.equal(helpOtto(p),true);
 assert.equal(p.bridge,false);
 assert.equal(chooseSymbol(p,0),'correct');
 assert.equal(chooseSymbol(p,1),'correct');
 assert.equal(chooseSymbol(p,2),'complete');
 assert.equal(p.otto&&p.rural&&p.bridge,true);
});
test('un error permite reintentar y conserva la ayuda de Otto',()=>{
 const p=createProgress();p.gear=true;helpOtto(p);
 chooseSymbol(p,0);assert.equal(chooseSymbol(p,2),'retry');assert.deepEqual(p.symbols,[]);assert.equal(p.otto,true);
 [0,1,2].forEach(s=>chooseSymbol(p,s as 0|1|2));assert.equal(p.bridge,true);
});
test('señal resuelta es idempotente',()=>{
 const p=createProgress();p.gear=true;helpOtto(p);
 [0,1,2].forEach(s=>chooseSymbol(p,s as 0|1|2));
 assert.equal(chooseSymbol(p,1),'complete');assert.equal(p.symbols.length,3);
});
test('destellos no se cuentan dos veces',()=>{
 const p=createProgress();assert.equal(collectCoin(p,7),true);assert.equal(collectCoin(p,7),false);assert.equal(p.coins.size,1);
});

const points={puntos_por_esfera:100,bonus_todas:1000};
test('un recorrido parcial suma puntos sin otorgar el bonus',()=>{
 assert.deepEqual(scoreLevel(new Set([0,1]),3,points),{collected:2,available:3,base:200,bonus:0,total:200,complete:false});
});
test('el bonus exige todas las esferas reales del nivel y se calcula una sola vez',()=>{
 const p=createProgress();[0,1,2].forEach(id=>collectCoin(p,id));
 const finished=scoreLevel(p.coins,3,points);
 assert.equal(finished.total,1300);assert.equal(finished.bonus,1000);
 collectCoin(p,1);assert.deepEqual(scoreLevel(p.coins,3,points),finished);
 assert.equal(scoreLevel(new Set([0,1,9]),3,points).bonus,0);
 assert.equal(scoreLevel(p.coins,4,points).bonus,0);
});
test('reiniciar limpia el puntaje y un nivel sin esferas no gana un bonus vacío',()=>{
 assert.equal(scoreLevel(createProgress().coins,30,points).total,0);
 assert.equal(scoreLevel(new Set(),0,points).complete,false);
 assert.equal(scoreLevel(new Set(),0,points).bonus,0);
});
