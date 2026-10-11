import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CampaignStore, freshCampaign, captureProgress, restoreProgress, decodeSave, campaignScore, type Chapter } from '../src/campaign.ts';
import { createProgress } from '../src/rules.ts';
import { RunnerState } from '../src/runner-state.ts';
import { validateLevelLayout } from '../src/level-layout.ts';
const levels=['sendero','bosque'].map(id=>JSON.parse(readFileSync(`data/capitulo_${id}.json`,'utf8')) as Chapter);
test('ambos capítulos tienen banderines y esferas seguros',()=>{for(const l of levels)assert.deepEqual(validateLevelLayout(l),[]);assert.equal(levels[1].monedas.length,20);assert.equal(levels[1].enemigos.length,4);});
test('guardado restaura objetos, mecanismos, esferas y rivales sin mezclar capítulos',()=>{
 const s=freshCampaign(),p=createProgress();p.gear=true;p.otto=true;p.coins.add(2);p.enemyIds.add(1);
 s.chapters.sendero=captureProgress(p,1440,false);const result=decodeSave(JSON.stringify(s),levels);const restored=restoreProgress(result.chapters.sendero);
 assert.equal(restored.gear,true);assert.equal(restored.switch,false);assert.deepEqual([...restored.coins],[2]);assert.equal(restored.defeated,1);assert.equal(restoreProgress().gear,false);
});
test('rechaza versión, checkpoint, colecciones y progreso imposible',()=>{
 const s=freshCampaign();s.chapters.sendero=captureProgress(createProgress(),130,false);
 for(const change of [{version:2},{chapter:'otro'},{chapter:'bosque'}])assert.throws(()=>decodeSave(JSON.stringify({...s,...change}),levels));
 for(const change of [{checkpoint:999},{coins:[1,1]},{coins:[99]},{bridge:true},{switch:true},{completed:true},{symbols:[0,4]}])assert.throws(()=>decodeSave(JSON.stringify({...s,chapters:{sendero:{...s.chapters.sendero,...change}}}),levels));
 assert.throws(()=>decodeSave('{',levels));
});
test('puntaje de aventura se deriva por capítulo sin duplicar bonus',()=>{
 const s=freshCampaign(),p=createProgress();p.gear=p.otto=p.rural=p.bridge=true;levels[0].monedas.forEach((_,i)=>p.coins.add(i));s.chapters.sendero=captureProgress(p,1440,true);
 assert.equal(campaignScore(s,levels),4000);assert.equal(campaignScore(s,levels),4000);
 const b=createProgress();b.switch=b.antenna=true;b.coins.add(1);s.chapter='bosque';s.chapters.bosque=captureProgress(b,480,true);
 assert.equal(campaignScore(decodeSave(JSON.stringify(s),levels),levels),4100);
});
test('almacenamiento bloqueado conserva la sesión y guardado dañado permite reiniciar',()=>{
 const blocked=new CampaignStore(levels,()=>{throw new Error('SecurityError');});blocked.state.chapters.sendero=captureProgress(createProgress(),130,false);blocked.write();assert.equal(blocked.status,'unavailable');assert.equal(blocked.hasProgress(),true);
 let raw='{';const storage={getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}};
 const invalid=new CampaignStore(levels,()=>storage);assert.equal(invalid.status,'invalid');invalid.reset();assert.equal(invalid.status,'ok');assert.equal(invalid.hasProgress(),false);
});
test('corredor avisa, no gira durante carrera, descansa y congela su reloj',()=>{
 const r=new RunnerState(),i={x:1500,playerX:1600,playerY:540,floor:540,min:1400,max:1770,speed:90};
 assert.equal(r.step(16,i).mode,'warn');const paused=r.snapshot();assert.deepEqual(r.step(1000,{...i,suspended:true}),paused);
 assert.equal(r.step(900,i).mode,'rush');assert.equal(r.step(16,{...i,playerX:1400}).direction,1);
 const end=r.step(16,{...i,x:1770});assert.equal(end.mode,'recover');assert.equal(end.velocity,0);assert.equal(r.step(1500,i).mode,'recover');assert.equal(r.step(800,{...i,playerX:2000}).mode,'patrol');
});
