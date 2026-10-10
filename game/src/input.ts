export type Action = 'left' | 'right' | 'jump' | 'interact';
export class Controls {
 private held = new Set<string>();
 private pointers = new Map<number, Action>();
 private jumpPending = false;
 private interactPending = false;
 private readonly mapping: Record<string, Action> = { ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump',KeyE:'interact',Enter:'interact' };
 constructor(canPlay: () => boolean, shortcut: (event: KeyboardEvent) => boolean) {
  document.addEventListener('keydown', e => {
   if (shortcut(e) || !canPlay()) return;
   const action = this.mapping[e.code];
   if (!action) return;
   e.preventDefault();
   if (!e.repeat) this.press(action);
   this.held.add(e.code);
  });
  document.addEventListener('keyup', e => this.held.delete(e.code));
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-action]')) {
   button.addEventListener('pointerdown', e => {
    if (!canPlay()) return;
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    const action = button.dataset.action as Action;
    this.pointers.set(e.pointerId, action); this.press(action); button.classList.add('pressed');
   });
   const release = (e: PointerEvent) => { this.pointers.delete(e.pointerId); button.classList.remove('pressed'); };
   button.addEventListener('pointerup', release);
   button.addEventListener('pointercancel', release);
   button.addEventListener('lostpointercapture', release);
  }
  window.addEventListener('blur', () => this.reset());
  document.addEventListener('visibilitychange', () => this.reset());
 }
 private press(action: Action) { if (action === 'jump') this.jumpPending = true; if (action === 'interact') this.interactPending = true; }
 private has(action: Action) { return [...this.held].some(k => this.mapping[k] === action) || [...this.pointers.values()].includes(action); }
 get axis() { return Number(this.has('right')) - Number(this.has('left')); }
 get jumpHeld() { return this.has('jump'); }
 consumeJump() { const pending=this.jumpPending; this.jumpPending=false; return pending; }
 consumeInteract() { const pending=this.interactPending; this.interactPending=false; return pending; }
 reset() { this.held.clear(); this.pointers.clear(); this.jumpPending=false; this.interactPending=false; document.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed')); }
}
