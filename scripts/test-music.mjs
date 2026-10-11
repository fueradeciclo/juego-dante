import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{const Original=window.Audio;window.__music=[];window.Audio=class extends Original{constructor(...args){super(...args);window.__music.push(this);}};});
const base=process.env.MUSIC_TEST_URL||'http://localhost:5188/pattha_game/';
await page.goto(base);await page.locator('#play').click();
const state=()=>page.evaluate(()=>{const a=window.__music.find(a=>a.src.includes('pattha-main-theme'));return {src:a?.src,paused:a?.paused,time:a?.currentTime,volume:a?.volume,muted:a?.muted,ready:a?.readyState,count:window.__music.filter(a=>a.src.includes('pattha-main-theme')).length};});
await page.waitForTimeout(1200);let s=await state();assert(s.src.includes('pattha-main-theme-v1.mp3'));assert(s.ready>=2);assert(!s.paused);assert.equal(s.count,1);
await page.keyboard.press('Escape');s=await state();assert(s.paused);const time=s.time;await page.waitForTimeout(300);assert.equal((await state()).time,time);
await page.locator('#resume').click();await page.waitForTimeout(300);assert((await state()).time>time);
await page.locator('#music-toggle').click();assert((await state()).muted);await page.locator('#music-toggle').click();assert(!(await state()).muted);
await page.locator('#music-volume').evaluate(el=>{el.value='50';el.dispatchEvent(new Event('input',{bubbles:true}));});s=await state();assert(Math.abs(s.volume-.15)<.001); // introduction dialogue ducks
while(await page.locator('#continue').isVisible())await page.locator('#continue').click();assert.equal((await state()).volume,.5);
await page.keyboard.press('Escape');await page.locator('#restart').click();assert((await state()).time<1);
await page.setViewportSize({width:844,height:390});await page.waitForTimeout(200);assert.equal((await state()).count,1);assert.deepEqual(errors,[]);
console.log('PASS: official audio loaded and playing; pause/resume, mute, volume, dialogue ducking, restart, mobile width, single instance; no page errors.');
await browser.close();
