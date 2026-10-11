import test from 'node:test';
import assert from 'node:assert/strict';
import { readAirplaneChoice, saveAirplaneChoice } from '../src/ambient-preference.ts';

test('la elección de avionetas es independiente del guardado de la aventura',()=>{
 const values=new Map<string,string>(),storage=()=>({getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}});
 assert.equal(readAirplaneChoice(storage),undefined);
 saveAirplaneChoice(true,storage);assert.equal(readAirplaneChoice(storage),true);
 saveAirplaneChoice(false,storage);assert.equal(readAirplaneChoice(storage),false);
 assert.deepEqual([...values.keys()],['pattha-airplanes']);
 values.set('pattha-airplanes','valor inválido');assert.equal(readAirplaneChoice(storage),undefined);
});
test('un navegador con almacenamiento bloqueado puede usar la opción durante la sesión',()=>{
 const blocked=()=>{throw new Error('blocked');};
 assert.equal(readAirplaneChoice(blocked),undefined);assert.doesNotThrow(()=>saveAirplaneChoice(true,blocked));
});
