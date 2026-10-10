import test from 'node:test';
import assert from 'node:assert/strict';
import { canJump, canStomp, chooseSymbol, collectCoin, createProgress, helpOtto } from '../src/rules.ts';

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
