import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateLevelLayout } from '../src/level-layout.ts';

const level=JSON.parse(readFileSync(new URL('../../data/demo_plataformas.json',import.meta.url),'utf8'));
test('el mapa real deja libres todas las esferas y separa sus cinco checkpoints',()=>{
 assert.equal(level.monedas.length,30);
 assert.equal(level.puestos_control.length,5);
 assert.deepEqual(validateLevelLayout(level),[]);
 // The opened bridge is also kept free of spheres, though it functions as ground.
 assert.ok(level.monedas.every(([x]:number[])=>x+20<3150||x-20>3560));
});
test('una esfera sobre o debajo de una plataforma es rechazada aunque no la toque',()=>{
 const [x,top]=level.plataformas[0];
 for(const y of [top-100,top+50]) {
  const changed={...level,monedas:[[x,y]]};
  assert.ok(validateLevelLayout(changed).some(e=>e.includes('Esfera 1: encima o debajo')));
 }
});
test('se consideran los bordes de esferas y banderines, no solo sus centros',()=>{
 const [x,,width]=level.plataformas[0];
 const changed={...level,monedas:[[x+width/2+22,390]],puestos_control:[x-width/2-20]};
 const errors=validateLevelLayout(changed);
 assert.ok(errors.some(e=>e.startsWith('Esfera 1:')));
 assert.ok(errors.some(e=>e.startsWith('Banderín 1: demasiado cerca')));
});
test('un checkpoint al borde de un pozo no ofrece una reaparición segura',()=>{
 assert.ok(validateLevelLayout({...level,puestos_control:[level.suelo[0][1]-10]}).some(e=>e.includes('suelo firme')));
});
