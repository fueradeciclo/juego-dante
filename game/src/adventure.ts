import Phaser from 'phaser';
import { canJump, canStomp, collectCoin, createProgress, scoreLevel, type Progress } from './rules.ts';
import { CHECKPOINT_REACH, validateLevelLayout } from './level-layout.ts';
import type { Controls } from './input.ts';
import type { DemoUI } from './ui.ts';
import { CharacterRig } from './character-rig.ts';
import type { CharacterKind } from './character-art.ts';
import { PatthaAnimator } from './pattha-animator.ts';
import { patthaAtlas } from './pattha-art.ts';
import { JumpPreparation } from './pattha-state.ts';
import { JumpDust } from './jump-dust.ts';
import { AllyFollower, allyTarget, FriendConversation, RivalPatrol } from './companion-state.ts';
import { AmbientSky } from './ambient-sky.ts';
import { CrawlPosture, hasHeadroom } from './crawl-state.ts';
import { CampaignStore, captureProgress, restoreProgress, campaignScore, SAVE_KEY, type Chapter, type ChapterId, type CampaignDefinition } from './campaign.ts';
import { RunnerState } from './runner-state.ts';
import { createMechanic, type ChapterMechanic, type MechanicHost } from './chapter-mechanics.ts';
import { Celebration } from './celebration.ts';
import campaign from '../../data/campana.json';
import { WorldArt, loadWorldArt } from './world-art.ts';

type Enemy = Phaser.Physics.Arcade.Sprite;
const ALLY_SIZE = { width: 61, height: 82 };
const LABEL_LIFT = 100;
const OBJECTIVE_ICONS: Record<string, string> = { gear: '⚙', otto: '🐭', rural: '★', bridge: '★', switch: '🐭', antenna: '📡', exit: '⚑' };

export class Adventure extends Phaser.Scene implements MechanicHost {
 progress: Progress = createProgress();
 player!: Phaser.Physics.Arcade.Sprite;
 level!: Chapter;
 art!: WorldArt;
 private store!: CampaignStore;
 private mechanic!: ChapterMechanic;
 private saveSignature = '';
 private storageWarned = false;
 private readonly chapterIds = (campaign as CampaignDefinition).capitulos.map(c => c.id as ChapterId);
 private solids!: Phaser.Physics.Arcade.StaticGroup;
 private rivals!: Phaser.Physics.Arcade.Group;
 private allies: Phaser.GameObjects.Image[] = [];
 private followers: AllyFollower[] = [];
 private followDirection = 1;
 private allyLabels: Phaser.GameObjects.Text[] = [];
 private friendConversation = new FriendConversation();
 private friendBubble!: Phaser.GameObjects.Text;
 private friendPanel!: Phaser.GameObjects.Graphics;
 private ambient!: AmbientSky;
 private celebration!: Celebration;
 private trail: { x: number; y: number; time: number }[] = [];
 private checkpoint = { x: 130, y: 540 };
 private lastSafeX = 130;
 private flags: { x: number; view: Phaser.GameObjects.Image; active: boolean }[] = [];
 private health = 3;
 private groundedAt = -Infinity;
 private jumpUntil = -Infinity;
 private hurtUntil = 0;
 private lastSample = 0;
 private ended = false;
 private visuals: CharacterRig[] = [];
 private pattha!: PatthaAnimator;
 private dust!: JumpDust;
 private preparation = new JumpPreparation();
 private posture = new CrawlPosture();
 private standingHeight = 132 * .78;
 private takeoffMs = 0;
 private reboundMs = 0;
 private helpMs = 0;
 private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
 private originalLoadFailed = false;
 private artChapter: ChapterId = 'sendero';

 constructor(readonly ui: DemoUI, private controls: Controls) { super('adventure'); }

 init(data: { chapter?: ChapterId } = {}) {
  this.artChapter = data.chapter ?? this.store?.state.chapter ?? this.chapterIds[0];
  if (data.chapter || this.store) return;
  // Before the store exists, peek at the save so the right chapter art is preloaded.
  try {
   const saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null');
   if (this.chapterIds.includes(saved?.chapter)) this.artChapter = saved.chapter;
  } catch { /* A blocked or damaged save falls back to the first chapter. */ }
 }

 preload() {
  loadWorldArt(this, this.artChapter);
  if (this.cache.json.exists(this.chapterIds[0])) return;
  for (const c of (campaign as CampaignDefinition).capitulos) this.load.json(c.id, './' + c.ruta);
  const paths = { pattha: 'personajes/transparentes/pattha_concepto_B_transparente.png', otto: 'personajes/derivados/otto-v1.png', rural: 'personajes/derivados/rural-v1.png', gato: 'enemigos/gato-v1.png', perro: 'enemigos/perro-v1.png' };
  for (const [key, path] of Object.entries(paths)) this.load.image(key, './assets/' + path);
  for (const [key, sheet] of Object.entries(patthaAtlas.sheets)) this.load.image('pattha-' + key, './' + sheet.path);
  this.load.on('progress', (p: number) => this.ui.loading(p));
  this.load.on('loaderror', () => { this.originalLoadFailed = true; this.ui.loadError(); });
 }

 create(data: { autostart?: boolean; resume?: boolean; chapter?: ChapterId } = {}) {
  if (this.originalLoadFailed) return;
  const chapters = this.chapterIds.map(id => this.cache.json.get(id) as Chapter);
  if (!this.store) this.store = new CampaignStore(chapters);
  this.level = chapters.find(c => c.id === (data.chapter ?? this.store.state.chapter))!;
  const textures = ['pattha', 'otto', 'rural', 'gato', 'perro', ...Object.keys(patthaAtlas.sheets).map(s => 'pattha-' + s)];
  if (!this.level || textures.some(k => !this.textures.exists(k))) { this.ui.loadError(); return; }
  const layoutErrors = validateLevelLayout(this.level);
  if (layoutErrors.length) { console.error('Distribución del nivel inválida:', layoutErrors); this.ui.loadError(); return; }
  const saved = this.store.state.chapters[this.level.id];
  this.resetState(saved?.checkpoint ?? this.level.aparicion);
  this.progress = restoreProgress(saved);
  this.ui.configureLevel(this.level.monedas.length, this.level.puntaje);

  this.physics.world.setBounds(0, -100, this.level.mundo.ancho, 1000);
  this.art = new WorldArt(this, this.level.escenario);
  this.art.background();
  this.ambient = new AmbientSky(this);
  this.paintTerrain();
  this.mechanic = createMechanic(this, this);
  this.paintProps();
  this.makeTokens();
  this.makePlayer();
  this.makeAllies();
  this.makeEnemies();
  this.celebration = new Celebration(this);
  this.friendPanel = this.add.graphics().setDepth(8);
  this.friendBubble = this.add.text(0, 0, '', { fontFamily: 'system-ui', fontSize: '17px', color: '#355548', padding: { x: 9, y: 7 }, wordWrap: { width: 250 } }).setOrigin(.5, 1).setDepth(9).setVisible(false);

  this.events.once('shutdown', () => {
   this.ui.stopVoice(); this.controls.reset(); this.ui.bind(undefined);
   if (import.meta.env.DEV) delete (window as unknown as { __PATTHA_TEST__?: unknown }).__PATTHA_TEST__;
  });
  this.cameras.main.setBounds(0, 0, this.level.mundo.ancho, 720);
  this.cameras.main.startFollow(this.player, true, .1, 1, 0, 0);
  this.bindActions();
  this.ui.ready(this.store.hasProgress(), this.store.status);
  this.ui.setChapter(this.level.titulo);
  this.ui.setMode(data.autostart ? 'playing' : 'menu');
  if (data.autostart) {
   this.persist();
   if (saved?.completed) this.showSummary();
   else if (!data.resume) this.ui.dialogue(this.level.dialogos.intro);
  }
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('test')) this.exposeTestApi();
 }

 private resetState(checkpointX: number) {
  this.saveSignature = ''; this.health = 3; this.ended = false;
  this.flags = []; this.allies = []; this.allyLabels = []; this.followers = []; this.trail = []; this.visuals = [];
  this.hurtUntil = 0; this.groundedAt = -Infinity; this.jumpUntil = -Infinity; this.lastSample = 0;
  this.checkpoint = { x: checkpointX, y: this.level.mundo.piso }; this.lastSafeX = checkpointX;
  this.preparation.cancel(); this.posture.reset();
  this.takeoffMs = 0; this.reboundMs = 0; this.helpMs = 0; this.followDirection = 1;
  this.friendConversation = new FriendConversation();
 }

 private bindActions() {
  this.ui.bind({
   restart: autostart => {
    if (autostart) {
     if (this.store.hasProgress() && !window.confirm('¿Empezar una nueva aventura? Se reemplaza el avance guardado.')) return;
     this.store.reset();
    }
    this.ui.setMode('menu'); this.ui.hint('');
    this.scene.restart({ autostart, chapter: autostart ? this.chapterIds[0] : this.store.state.chapter });
   },
   continue: () => { this.ui.setMode('menu'); this.scene.restart({ autostart: true, resume: true }); },
   next: () => {
    const next = this.level.siguiente; if (!next) return;
    this.store.state.chapter = next;
    this.store.state.chapters[next] ??= captureProgress(createProgress(), this.cache.json.get(next).aparicion, false);
    this.store.write();
    this.ui.setMode('menu'); this.scene.restart({ autostart: true, chapter: next });
   },
   setPaused: paused => { if (paused) this.physics.world.pause(); else this.physics.world.resume(); },
   resetInput: () => this.controls.reset(),
  });
 }

 // ── MechanicHost ──────────────────────────────────────────────
 addSolid(x: number, top: number, width: number, height: number) { this.platform(x, top, width, height); }
 ally(index: number) { return { image: this.allies[index], follower: this.followers[index] }; }
 persist() {
  this.store.state.chapters[this.level.id] = captureProgress(this.progress, this.checkpoint.x, this.ended || Boolean(this.store.state.chapters[this.level.id]?.completed));
  const signature = JSON.stringify(this.store.state);
  if (signature === this.saveSignature) return;
  this.saveSignature = signature; this.store.write();
  if (this.store.status === 'unavailable' && !this.storageWarned) { this.storageWarned = true; this.ui.toast('Este navegador no permite guardar. Tu avance queda en esta sesión.'); }
 }

 // ── World building ────────────────────────────────────────────
 private paintTerrain() {
  const floor = this.level.mundo.piso;
  this.solids = this.physics.add.staticGroup();
  const ground = [...this.level.suelo].sort((a, b) => a[0] - b[0]);
  for (const [left, right] of ground) this.platform((left + right) / 2, floor, right - left, 210);
  for (let i = 1; i < ground.length; i++) if (ground[i][0] > ground[i - 1][1]) this.art.pit(ground[i - 1][1], ground[i][0], floor);
  for (const [x, top, width] of this.level.plataformas) this.platform(x, top, width, 26);
  for (const [x, top, width, height] of this.level.pasajes_bajos ?? []) this.lowPassage(x, top, width, height);
 }
 private platform(x: number, top: number, width: number, height: number) {
  this.solids.add(this.add.rectangle(x, top + height / 2, width, height, 0x000000, 0));
  if (height >= 64) this.art.ground(x, top, width, height); else this.art.strip(x, top, width, height);
 }
 private lowPassage(x: number, top: number, width: number, height: number) {
  this.solids.add(this.add.rectangle(x, top + height / 2, width, height, 0, 0));
  this.art.strip(x, top, width, height, 'roof');
  this.add.text(x, top - 14, '↓ / S · Gateá', { fontFamily: 'system-ui', fontSize: '16px', color: '#42644e', backgroundColor: '#edf5dc', padding: { x: 9, y: 5 } }).setOrigin(.5, 1).setDepth(3);
 }
 private paintProps() {
  const floor = this.level.mundo.piso;
  for (const [i, c] of this.level.carteles.entries()) {
   this.art.piece('common.sign', c.x, floor, 170, 122, 1);
   this.add.text(c.x, floor - 82, c.texto, { fontFamily: 'system-ui', fontSize: '15px', fontStyle: 'bold', color: '#fff4d4', backgroundColor: '#142c49', padding: { x: 10, y: 7 }, wordWrap: { width: 150 }, align: 'center' }).setOrigin(.5).setDepth(3);
   const bx = c.x + 110;
   if (!this.level.plataformas.some(([x, , w]) => Math.abs(x - bx) < w / 2 + 75)) this.art.piece(this.level.escenario + '.' + (i % 2 ? 'lamp' : 'bush'), bx, floor, 85, 86, -1);
  }
  this.mechanic.paint();
  this.mechanic.refresh();
  for (const x of this.level.puestos_control) {
   const active = x <= this.checkpoint.x;
   this.flags.push({ x, view: this.art.piece(active ? 'common.checkpoint-on' : 'common.checkpoint-off', x, floor, 60, 90, 2), active });
  }
  this.art.piece('common.sign', this.level.salida + 55, floor, 145, 145, 1);
  this.add.text(this.level.salida + 55, floor - 105, this.level.siguiente ? 'SEGUIR →' : 'SEÑAL ★', { fontFamily: 'system-ui', fontSize: '16px', color: '#fff0c3', backgroundColor: '#123253', padding: { x: 10, y: 6 } }).setOrigin(.5).setDepth(3);
 }
 private makeTokens() {
  if (!this.textures.exists('coin')) {
   const g = this.make.graphics({ x: 0, y: 0 });
   g.fillStyle(0xffda79).fillCircle(20, 20, 15); g.lineStyle(3, 0xb18138).strokeCircle(20, 20, 15);
   g.fillStyle(0xfff6bd).fillTriangle(20, 8, 24, 21, 16, 21).fillTriangle(20, 31, 24, 18, 16, 18);
   g.generateTexture('coin', 40, 40); g.destroy();
   const gear = this.make.graphics({ x: 0, y: 0 });
   gear.fillStyle(0xc68b45).fillCircle(30, 30, 21); gear.lineStyle(5, 0x6b4e2e).strokeCircle(30, 30, 21); gear.fillStyle(0xe4f2dc).fillCircle(30, 30, 10);
   for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; gear.fillStyle(0xc68b45).fillRoundedRect(26 + Math.cos(a) * 24, 26 + Math.sin(a) * 24, 8, 8, 2); }
   gear.generateTexture('gear', 60, 60); gear.destroy();
  }
  const coins = this.physics.add.staticGroup();
  for (const [id, [x, y]] of this.level.monedas.entries()) {
   if (this.progress.coins.has(id)) continue;
   const coin = coins.create(x, y, 'coin') as Phaser.Physics.Arcade.Image; coin.setData('id', id).setDepth(3);
   this.tweens.add({ targets: coin, y: y - 5, duration: 900, repeat: -1, yoyo: true, delay: id * 45 });
  }
  // Overlaps are installed after the player exists, in the next scene tick.
  this.time.delayedCall(0, () => {
   this.physics.add.overlap(this.player, coins, (_p, c) => {
    const coin = c as Phaser.Physics.Arcade.Image;
    if (!collectCoin(this.progress, coin.getData('id'))) return;
    coin.disableBody(true, true); this.ui.sfx.play('coin'); this.persist();
    if (this.progress.coins.size === this.level.monedas.length) this.ui.toast('¡Juntaste todas las esferas! El bonus te espera en la llegada.');
   });
   if (!this.level.tuerca || this.progress.gear) return;
   const gear = this.physics.add.staticImage(this.level.tuerca.x, this.level.tuerca.y, 'gear').setDepth(3);
   this.physics.add.overlap(this.player, gear, () => {
    if (this.progress.gear) return;
    this.progress.gear = true; gear.disableBody(true, true); this.mechanic.refresh(); this.persist();
    this.ui.sfx.play('gear'); this.ui.toast('¡Encontraste la tuerca! Llevásela a Otto.');
   });
  });
 }
 private makePlayer() {
  this.player = this.physics.add.sprite(this.checkpoint.x, this.level.mundo.piso, 'pattha').setOrigin(.5, 1).setDepth(5);
  this.player.setDisplaySize(104, 132);
  const raw = this.textures.get('pattha').getSourceImage() as HTMLImageElement;
  this.player.body!.setSize(raw.width * .44, raw.height * .78);
  this.player.body!.setOffset(raw.width * .28, raw.height * .22);
  this.player.setMaxVelocity(340, 950).setCollideWorldBounds(false);
  this.physics.add.collider(this.player, this.solids);
  this.pattha = new PatthaAnimator(this, this.player); this.dust = new JumpDust(this);
 }
 private makeAllies() {
  for (const [i, key] of ['otto', 'rural'].entries()) {
   const start = allyTarget(this.player, 1, i, this.level.mundo.ancho);
   const ally = this.add.image(start.x, start.y, key).setOrigin(.5, 1).setDisplaySize(ALLY_SIZE.width, ALLY_SIZE.height).setDepth(4);
   this.allies.push(ally);
   this.followers.push(new AllyFollower(start.x, start.y));
   this.visuals.push(new CharacterRig(this, ally, key as CharacterKind, i + 1));
   this.allyLabels.push(this.add.text(ally.x, ally.y - LABEL_LIFT, key === 'otto' ? 'Otto' : 'Rural', { fontFamily: 'system-ui', fontSize: '15px', fontStyle: 'bold', color: '#28513d', backgroundColor: '#f0f8df', padding: { x: 8, y: 4 } }).setOrigin(.5).setDepth(7));
  }
 }
 private makeEnemies() {
  for (const [key, box] of Object.entries({ gato: [25, 159, 985, 1218], perro: [30, 187, 981, 1190] })) {
   const t = this.textures.get(key); if (!t.has('recorte')) t.add('recorte', 0, ...box as [number, number, number, number]);
  }
  this.rivals = this.physics.add.group();
  for (const [id, info] of this.level.enemigos.entries()) {
   if (this.progress.enemyIds.has(id)) continue;
   const enemy = this.rivals.create(info.x, this.level.mundo.piso, info.tipo, 'recorte') as Enemy;
   enemy.setOrigin(.5, 1).setScale(110 / enemy.frame.height).setDepth(4).setData('patrol', { ...info, dir: -1 });
   enemy.setData('enemyId', id).setData('behavior', info.comportamiento === 'corredor' ? new RunnerState() : new RivalPatrol());
   const raw = enemy.frame;
   enemy.body!.setSize(raw.width * .52, raw.height * .87); enemy.body!.setOffset(raw.width * .24, raw.height * .13);
   this.visuals.push(new CharacterRig(this, enemy, info.tipo as CharacterKind, this.visuals.length));
  }
  this.physics.add.collider(this.rivals, this.solids);
  this.physics.add.overlap(this.player, this.rivals, (_p, e) => this.meetEnemy(e as Enemy));
 }

 // ── Player body ───────────────────────────────────────────────
 private canStand() {
  const b = this.player.body as Phaser.Physics.Arcade.Body;
  const standing = { left: b.center.x - 42, right: b.center.x + 42, top: b.bottom - this.standingHeight, bottom: b.bottom };
  const solids = this.solids.getChildren().map(s => s.body as Phaser.Physics.Arcade.StaticBody).filter(b => b.enable);
  return hasHeadroom(standing, solids);
 }
 private setLowBody(low: boolean) {
  const b = this.player.body as Phaser.Physics.Arcade.Body, height = low ? 80 : this.standingHeight;
  if (Math.abs(b.height - height) < .01) return;
  const raw = this.textures.get('pattha').getSourceImage() as HTMLImageElement, shift = b.height - height;
  b.setSize(raw.width * .44, height / this.player.scaleY, false); b.setOffset(raw.width * .28, raw.height - height / this.player.scaleY);
  // Resizing moves the top, never the feet or the physics displacement accumulated this frame.
  b.position.y += shift; b.prev.y += shift; b.prevFrame.y += shift; b.updateCenter();
 }

 // ── Rivals, falls and the ending ──────────────────────────────
 private meetEnemy(enemy: Enemy) {
  if (!enemy.active || this.ended || this.ui.mode !== 'playing') return;
  const pb = this.player.body as Phaser.Physics.Arcade.Body, eb = enemy.body as Phaser.Physics.Arcade.Body;
  if (canStomp(pb.velocity.y, pb.bottom, eb.top)) {
   enemy.disableBody(true, false); enemy.setData('defeated', true);
   this.progress.defeated++; this.progress.enemyIds.add(enemy.getData('enemyId')); this.persist();
   this.player.setVelocityY(-420); this.preparation.cancel(); this.reboundMs = 120; this.takeoffMs = 0;
   this.ui.sfx.play('stomp');
   if (this.progress.defeated === 1) this.ui.toast('¡Buen salto! También podés pasar por arriba.');
   return;
  }
  if (this.time.now <= this.hurtUntil) return;
  this.hurtUntil = this.time.now + 1800; this.preparation.cancel(); this.takeoffMs = 0;
  this.player.setVelocity(this.player.x < enemy.x ? -200 : 200, -290);
  this.ui.sfx.play('bump');
  if (this.ui.calm) { this.ui.toast('¡Uy, un empujoncito! En modo tranqui no pasa nada.'); return; }
  this.health--;
  if (this.health <= 0) this.respawn(); else this.ui.toast('Un choque. Tenés un ratito para alejarte.');
 }
 private respawn(fromFall = false) {
  this.posture.reset(); this.setLowBody(false);
  // Calm mode puts Pattha back on the edge they fell from instead of the last flag.
  const safe = fromFall && this.ui.calm ? this.safeGroundNear(this.lastSafeX) : this.checkpoint.x;
  this.health = 3; this.hurtUntil = this.time.now + 2000;
  this.player.body!.reset(safe, this.checkpoint.y); this.player.setVelocity(0, 0); this.controls.reset();
  this.trail = []; this.groundedAt = -Infinity; this.jumpUntil = -Infinity;
  this.preparation.cancel(); this.takeoffMs = 0; this.reboundMs = 0;
  this.regroupAllies(true); this.ui.sfx.play('retry');
  this.ui.toast(safe === this.checkpoint.x ? 'Volvés al banderín. ¡Probá de nuevo!' : 'Volvés al borde. ¡Probá de nuevo!');
 }
 private safeGroundNear(x: number) {
  const segment = this.level.suelo.find(([left, right]) => x >= left && x <= right);
  return segment ? Phaser.Math.Clamp(x, segment[0] + 60, segment[1] - 60) : this.checkpoint.x;
 }
 private regroupAllies(fade = false) {
  this.trail = []; this.followDirection = this.player.flipX ? 1 : -1;
  this.followers.forEach((follower, i) => {
   const point = allyTarget(this.player, this.followDirection, i, this.level.mundo.ancho);
   follower.reset(point, fade);
   this.allies[i].setPosition(point.x, point.y).setDisplaySize(ALLY_SIZE.width, ALLY_SIZE.height).setAlpha(fade ? 0 : 1).setData('animationX', point.x);
  });
 }
 private finishChapter() {
  this.ended = true; this.player.setVelocity(0, 0); this.persist();
  this.ui.sfx.play('celebrate');
  this.celebration.burst(this.player.x, this.level.mundo.piso - 160, this.reducedMotion.matches);
  // Everyone hops once; the summary waits until the confetti has had a moment.
  this.allies.forEach((ally, i) => this.tweens.add({ targets: ally, y: ally.y - 34, duration: 230, yoyo: true, repeat: 1, delay: i * 120, ease: 'Sine.easeOut' }));
  this.ui.dialogue(this.level.dialogos.final, () => this.time.delayedCall(900, () => this.showSummary()));
 }
 private showSummary() {
  this.ended = true; this.player.setVelocity(0, 0);
  const next = this.level.siguiente;
  this.ui.win(scoreLevel(this.progress.coins, this.level.monedas.length, this.level.puntaje), {
   next: next ? this.level.victoria.boton_siguiente ?? 'Seguir →' : undefined,
   title: this.level.victoria.titulo,
   description: this.level.victoria.descripcion,
   total: campaignScore(this.store.state, this.chapterIds.map(id => this.cache.json.get(id))),
  });
 }

 // ── Frame loop ────────────────────────────────────────────────
 update(now: number, delta: number) {
  if (!this.player) return;
  if (this.ui.mode === 'playing' && !this.ui.portrait && !this.ended) this.updateGameplay(now, Math.min(delta, 50));
  this.updateVisuals(delta);
 }
 private updateVisuals(delta: number) {
  const suspended = this.ui.mode === 'paused' || this.ui.portrait || document.hidden;
  const dt = Math.min(delta, 50), body = this.player.body as Phaser.Physics.Arcade.Body, playing = this.ui.mode === 'playing';
  const oldPose = this.pattha.clock.snapshot().pose;
  if (!suspended) this.helpMs = Math.max(0, this.helpMs - dt);
  this.pattha.update(dt, { speed: playing ? body.velocity.x : 0, vy: body.velocity.y, grounded: !playing || (body.blocked.down && Math.abs(body.velocity.y) < 30), crouching: playing && this.preparation.crouching, posture: this.posture.snapshot(), takingOff: this.takeoffMs > 0, rebounding: this.reboundMs > 0, helping: this.helpMs > 0, celebrating: this.ended, hurt: playing && this.time.now < this.hurtUntil - 1550, suspended, reducedMotion: this.reducedMotion.matches });
  if (!suspended && oldPose !== 'land' && this.pattha.clock.snapshot().pose === 'land' && !this.reducedMotion.matches) this.dust.emit(this.player.x, body.bottom, true);
  this.dust.update(dt, suspended, this.reducedMotion.matches);
  this.celebration.update(dt, suspended);
  this.ambient.update(dt, suspended || !playing || this.ended, !this.ui.airplanesEnabled);
  const line = this.updateFriendChat(dt, suspended, playing);
  this.updateRigs(delta, dt, suspended, line);
 }
 private updateFriendChat(dt: number, suspended: boolean, playing: boolean) {
  const chatting = playing && !this.ended && !this.ui.portrait;
  const context = this.progress.bridge ? 'cruzado' : this.level.interacciones.some(i => this.player.x > i.min - 100 && this.player.x < i.max) ? 'puente' : 'camino';
  const line = this.friendConversation.step(dt, context, this.level.charlas_amigos, suspended || !chatting);
  this.friendBubble.setVisible(Boolean(line) && chatting);
  this.friendBubble.setAlpha(this.friendConversation.opacity()); this.friendPanel.clear();
  if (!line || !chatting) return undefined;
  const speakerIndex = line.quien === 'otto' ? 0 : 1;
  const speaker = this.allies[speakerIndex], listener = this.allies[1 - speakerIndex];
  const speakerMotion = this.followers[speakerIndex].snapshot(), listenerMotion = this.followers[1 - speakerIndex].snapshot();
  if (Math.abs(speakerMotion.vx) < 20 && Math.abs(listenerMotion.vx) < 20 && Math.abs(speaker.x - listener.x) > 12) { speaker.setFlipX(listener.x > speaker.x); listener.setFlipX(speaker.x > listener.x); }
  const visual = this.visuals.find(v => v.host === speaker);
  this.friendBubble.setText((line.quien === 'otto' ? 'Otto' : 'Rural') + ': ' + line.texto);
  const camera = this.cameras.main, half = this.friendBubble.width / 2 + 12;
  this.friendBubble.setPosition(Phaser.Math.Clamp(speaker.x, camera.scrollX + half, camera.scrollX + 1280 - half), Math.max(110, (visual?.root.y ?? speaker.y) - this.player.displayHeight - 20));
  const { x, y, width, height } = this.friendBubble, alpha = this.friendBubble.alpha;
  this.friendPanel.fillStyle(0xf7fff0, .72 * alpha).fillRoundedRect(x - width / 2, y - height, width, height, 10);
  this.friendPanel.lineStyle(1, 0x789487, .22 * alpha).strokeRoundedRect(x - width / 2, y - height, width, height, 10);
  return line;
 }
 private updateRigs(delta: number, dt: number, suspended: boolean, line: { quien: string } | undefined) {
  const dialogueSpeaker = this.ui.mode === 'dialogue' ? document.getElementById('portrait')?.dataset.character : null;
  for (const visual of this.visuals) {
   if (!visual.root.active) continue;
   const host = visual.host;
   const lastX = host.getData('animationX') ?? host.x;
   const body = 'body' in host ? host.body as Phaser.Physics.Arcade.Body | null : null;
   const playing = this.ui.mode === 'playing' && host.active;
   const follower = this.followers[this.allies.indexOf(host as Phaser.GameObjects.Image)];
   const speed = playing ? (body ? body.velocity.x : follower ? follower.snapshot().vx : (host.x - lastX) / Math.max(delta, 1) * 1000) : 0;
   const airborne = playing ? (body ? (!body.blocked.down || Math.abs(body.velocity.y) > 35) : host.y < this.level.mundo.piso - 8) : false;
   const defeated = Boolean(host.getData('defeated'));
   const talking = line?.quien === visual.kind || dialogueSpeaker === visual.kind;
   const alert = (host.getData('behavior') as RivalPatrol | undefined)?.snapshot().mode === 'warn';
   visual.update(dt, { speed, airborne, suspended, reducedMotion: this.reducedMotion.matches, talking, alert, defeated });
   host.setData('animationX', host.x);
   if (defeated && visual.clock.snapshot().gesture >= 1) host.destroy();
  }
 }
 private updateGameplay(now: number, delta: number) {
  const body = this.player.body as Phaser.Physics.Arcade.Body;
  if (this.controls.consumeInteract()) {
   const point = this.level.interacciones.find(i => this.player.x > i.min && this.player.x < i.max);
   if (point) { this.helpMs = 550; this.mechanic.interact(point); }
   if (this.ui.mode !== 'playing') return;
  }
  this.updatePlayer(now, delta, body);
  this.updateRivals(delta);
  if (this.player.y > 810) { this.respawn(true); return; }
  this.updateAllies(now, delta);
  this.updateCheckpoints(body);
  if (this.mechanic.update(delta, this.player.x) || this.ui.mode !== 'playing') return;
  this.updateHud();
  if (this.player.x > this.level.salida && this.mechanic.done()) this.finishChapter();
 }
 private updatePlayer(now: number, delta: number, body: Phaser.Physics.Arcade.Body) {
  this.takeoffMs = Math.max(0, this.takeoffMs - delta); this.reboundMs = Math.max(0, this.reboundMs - delta);
  const posture = this.posture.step(delta, { held: this.controls.crouchHeld, grounded: body.blocked.down, headroom: this.canStand() });
  this.setLowBody(posture.phase !== 'stand');
  if (posture.phase !== 'stand') this.preparation.cancel();
  if (body.blocked.down && !this.preparation.crouching) this.groundedAt = now;
  if (body.blocked.down && Math.abs(body.bottom - this.level.mundo.piso) < 3) this.lastSafeX = this.player.x;
  if (this.controls.consumeJump() && !this.controls.crouchHeld && !posture.blocked) this.jumpUntil = now + (posture.phase === 'stand' ? 140 : 320);
  if (this.controls.crouchHeld || posture.blocked) this.jumpUntil = -Infinity;
  if (posture.phase === 'stand' && !this.preparation.crouching && canJump(now, this.groundedAt, this.jumpUntil)) { this.preparation.begin(body.blocked.down); this.jumpUntil = -Infinity; this.groundedAt = -Infinity; }
  if (this.preparation.step(delta)) {
   this.player.setVelocityY(-620); this.takeoffMs = 70; this.groundedAt = -Infinity; this.ui.sfx.play('jump');
   if (!this.reducedMotion.matches) this.dust.emit(this.player.x, body.bottom);
  }
  if (!this.controls.jumpHeld && body.velocity.y < -280) this.player.setVelocityY(-280);
  const speed = posture.phase === 'lower' || posture.phase === 'rise' ? 0 : posture.phase === 'low' ? 125 : 285;
  if (now > this.hurtUntil - 1500) this.player.setVelocityX(this.controls.axis * speed);
  if (this.controls.axis) this.player.setFlipX(this.controls.axis > 0);
  this.player.setAlpha(now < this.hurtUntil ? .55 + Math.abs(Math.sin(now / 85)) * .45 : 1);
  this.player.x = Phaser.Math.Clamp(this.player.x, 35, this.level.mundo.ancho - 35);
 }
 private updateRivals(delta: number) {
  for (const child of this.rivals.getChildren()) {
   const enemy = child as Enemy; if (!enemy.active) continue;
   const patrol = enemy.getData('patrol');
   const behavior = (enemy.getData('behavior') as RivalPatrol).step(delta, { x: enemy.x, playerX: this.player.x, playerY: this.player.y, floor: this.level.mundo.piso, min: patrol.min, max: patrol.max, speed: patrol.velocidad });
   enemy.setVelocityX(behavior.velocity); enemy.setFlipX(behavior.direction > 0);
  }
 }
 private updateAllies(now: number, delta: number) {
  const body = this.player.body as Phaser.Physics.Arcade.Body;
  if (now - this.lastSample > 35) { this.trail.push({ x: this.player.x, y: this.player.y, time: now }); this.trail = this.trail.filter(point => now - point.time < 450); this.lastSample = now; }
  if (Math.abs(body.velocity.x) > 70) { const direction = body.velocity.x > 0 ? 1 : -1; this.followDirection += (direction - this.followDirection) * (1 - Math.exp(-delta / 130)); }
  const atMeeting = this.level.interacciones.some(i => this.player.x > i.min - 70 && this.player.x < i.max);
  for (let i = 0; i < this.allies.length; i++) {
   const ally = this.allies[i];
   if (!this.mechanic.drivesAlly(i)) {
    let point = this.trail[0] ?? this.player;
    for (let j = this.trail.length - 1; j >= 0; j--) if (this.trail[j].time <= now - (i + 1) * 80) { point = this.trail[j]; break; }
    const follow = this.followers[i].step(delta, allyTarget({ x: this.player.x, y: point.y }, this.followDirection, i, this.level.mundo.ancho));
    ally.setPosition(follow.x, follow.y).setAlpha(follow.alpha);
    if (Math.abs(follow.vx) > 35) ally.setFlipX(follow.facing > 0);
   }
   this.allyLabels[i].setPosition(ally.x, ally.y - LABEL_LIFT).setAlpha(ally.alpha);
   // Names hide while a mouse runs past Pattha, so they never cover the robot.
   this.allyLabels[i].setVisible((atMeeting || this.player.x < 420) && Math.abs(ally.x - this.player.x) > 60);
  }
 }
 private updateCheckpoints(body: Phaser.Physics.Arcade.Body) {
  const grounded = body.blocked.down && Math.abs(body.bottom - this.level.mundo.piso) < 3;
  for (const flag of this.flags) {
   if (flag.active || !grounded || Math.abs(this.player.x - flag.x) >= CHECKPOINT_REACH) continue;
   flag.active = true; this.checkpoint = { x: flag.x, y: this.level.mundo.piso };
   this.art.state(flag.view, 'common.checkpoint-on'); this.persist();
   this.ui.sfx.play('checkpoint'); this.ui.toast('Banderín activado. Tus avances quedan a salvo.');
  }
 }
 private updateHud() {
  const x = this.player.x;
  let hint = '';
  if ((this.level.pasajes_bajos ?? []).some(([center, , width]) => x > center - width / 2 - 75 && x < center + width / 2 + 75)) hint = 'Mantené ↓ / S o Gatear y avanzá. Soltá al salir.';
  const meeting = this.level.interacciones.find(i => x > i.min && x < i.max);
  if (meeting) hint = 'E / Ayudar: hablar con ' + (meeting.kind === 'otto' ? 'Otto' : 'Rural');
  this.ui.hint(this.mechanic.hint() || hint);
  const zone = this.level.zonas.find(z => x < z.hasta)?.nombre ?? this.level.titulo;
  const goal = this.level.objetivos.find(o => o.requisito === 'exit' || !this.progress[o.requisito])!;
  this.ui.hud(zone, (OBJECTIVE_ICONS[goal.requisito] ?? '➜') + ' ' + goal.texto, this.progress.coins.size, this.health);
 }

 private exposeTestApi() {
  const body = () => this.player.body as Phaser.Physics.Arcade.Body;
  (window as unknown as { __PATTHA_TEST__: unknown }).__PATTHA_TEST__ = {
   snapshot: () => ({
    chapter: this.level.id, switch: this.progress.switch, antenna: this.progress.antenna, storage: this.store.status, ottoHelping: 0, ...this.mechanic.snapshot(),
    x: this.player.x, y: this.player.y, vy: body().velocity.y, grounded: body().blocked.down, health: this.health, calm: this.ui.calm,
    coins: this.progress.coins.size, collected: [...this.progress.coins], gear: this.progress.gear, otto: this.progress.otto, rural: this.progress.rural, bridge: this.progress.bridge, defeated: this.progress.defeated,
    enemies: this.rivals.getChildren().filter(e => e.active).map(e => { const r = e as Enemy; return { x: r.x, y: r.y, top: (r.body as Phaser.Physics.Arcade.Body).top, kind: r.getData('patrol').tipo, min: r.getData('patrol').min, max: r.getData('patrol').max, ...(r.getData('behavior') as RivalPatrol).snapshot() }; }),
    followers: this.followers.map(f => f.snapshot()), allies: this.allies.map(a => ({ x: a.x, y: a.y, alpha: a.alpha })), ambient: this.ambient.snapshot(), conversation: this.friendConversation.snapshot(),
    friendBubble: this.friendBubble.visible, friendBubbleAlpha: this.friendBubble.alpha,
    animations: [this.pattha.snapshot(), ...this.visuals.filter(v => v.root.active).map(v => v.snapshot())], dust: this.dust.snapshot(), celebrating: this.celebration.active,
    checkpoint: this.checkpoint.x, mode: this.ui.mode, portrait: this.ui.portrait,
   }),
   position: (x: number, y: number) => {
    this.posture.reset(); this.setLowBody(false); this.player.body!.reset(x, y); this.player.setVelocity(0, 0); this.controls.reset();
    this.preparation.cancel(); this.takeoffMs = 0; this.reboundMs = 0; this.cameras.main.centerOn(x, 360); this.regroupAllies();
   },
   crawl: () => ({ posture: this.posture.snapshot(), headroom: this.canStand(), body: { left: body().left, top: body().top, bottom: body().bottom, height: body().height }, passages: this.level.pasajes_bajos }),
  };
 }
}
