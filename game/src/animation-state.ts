export type AnimationState = 'idle' | 'walk' | 'air' | 'think' | 'bored';
export type AnimationInput = { speed: number; airborne?: boolean; suspended?: boolean; reducedMotion?: boolean };
export type AnimationFrame = {
  state: AnimationState; elapsed: number; idleMs: number; phase: number;
  blink: number; gesture: number; motion: number;
};

/** Uses active time only. Pauses and background tabs never accumulate an idle gesture. */
export class AnimationClock {
  private elapsed = 0;
  private idleMs = 0;
  private phase = 0;
  private blinkStarted = -Infinity;
  private nextBlink: number;
  private blinkCount = 0;
  private seed:number;
  private frame: AnimationFrame = { state:'idle', elapsed:0, idleMs:0, phase:0, blink:0, gesture:0, motion:1 };
  constructor(seed = 0) { this.seed=seed; this.nextBlink = 2200 + (seed % 7) * 310; }

  step(delta: number, input: AnimationInput): AnimationFrame {
    if (input.suspended) return this.frame;
    const dt = Math.max(0, Number.isFinite(delta) ? delta : 0);
    this.elapsed += dt;
    const moving = Math.abs(input.speed) > 9;
    if (moving || input.airborne) this.idleMs = 0;
    else this.idleMs += dt;
    if (moving) this.phase += dt / 1000 * (6 + Math.min(Math.abs(input.speed), 300) / 28);
    if (this.elapsed >= this.nextBlink) {
      this.blinkStarted = this.elapsed;
      this.blinkCount++;
      this.nextBlink = this.elapsed + 2700 + ((this.seed * 593 + this.blinkCount * 887) % 2000);
    }
    const blinkAge = this.elapsed - this.blinkStarted;
    const blink = blinkAge < 180 ? Math.sin(Math.PI * blinkAge / 180) : 0;
    let state: AnimationState = input.airborne ? 'air' : moving ? 'walk' : 'idle';
    let gesture = 0;
    if (state === 'idle' && !input.reducedMotion) {
      const age = this.idleMs - 8000 - (this.seed % 3) * 350;
      if (age >= 0) {
        const cycle = age % 12000;
        if (cycle < 2400) { state = 'think'; gesture = Math.sin(Math.PI * cycle / 2400); }
        else if (cycle >= 6000 && cycle < 8700) { state = 'bored'; gesture = Math.sin(Math.PI * (cycle - 6000) / 2700); }
      }
    }
    this.frame = { state, elapsed:this.elapsed, idleMs:this.idleMs, phase:this.phase, blink, gesture, motion:input.reducedMotion ? 0.15 : 1 };
    return this.frame;
  }
  snapshot(): AnimationFrame { return this.frame; }
}
