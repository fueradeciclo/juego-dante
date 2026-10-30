import test from 'node:test';
import assert from 'node:assert/strict';
import { CALM_KEY, SOUND_KEY, readFlag, saveFlag } from '../src/preferences.ts';
import { CUES } from '../src/sfx.ts';

test('sonidos y modo tranqui se recuerdan por separado del guardado de la aventura',()=>{
 const values=new Map<string,string>(),storage=()=>({getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);}});
 assert.equal(readFlag(CALM_KEY,storage),undefined);
 saveFlag(CALM_KEY,true,storage);saveFlag(SOUND_KEY,false,storage);
 assert.equal(readFlag(CALM_KEY,storage),true);assert.equal(readFlag(SOUND_KEY,storage),false);
 assert.ok(![...values.keys()].includes('pattha-aventura-v1'));
 const blocked=()=>{throw new Error('blocked');};assert.equal(readFlag(CALM_KEY,blocked),undefined);assert.doesNotThrow(()=>saveFlag(CALM_KEY,true,blocked));
});
test('los efectos son tonos cortos y suaves, sin archivos externos',()=>{
 for(const [cue,tones]of Object.entries(CUES)){
  assert.ok(tones.length>0,cue);
  for(const [from,to,start,length,,gain]of tones){assert.ok(from>=100&&to<=2000,cue);assert.ok(start+length<=1.2,cue);assert.ok(gain>0&&gain<=.3,cue);}
 }
});
