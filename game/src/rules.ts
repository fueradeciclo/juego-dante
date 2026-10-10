export type SymbolId = 0 | 1 | 2;
export type Progress = { gear: boolean; otto: boolean; rural: boolean; bridge: boolean; symbols: SymbolId[]; coins: Set<number>; defeated: number };
export const createProgress = (): Progress => ({ gear: false, otto: false, rural: false, bridge: false, symbols: [], coins: new Set(), defeated: 0 });
export function helpOtto(p: Progress): boolean {
 if (!p.gear) return false;
 p.otto = true;
 return true;
}
export function chooseSymbol(p: Progress, symbol: SymbolId): 'retry' | 'correct' | 'complete' {
 if (!p.otto || p.rural) return p.rural ? 'complete' : 'retry';
 const expected: SymbolId[] = [0, 1, 2];
 if (symbol !== expected[p.symbols.length]) { p.symbols = []; return 'retry'; }
 p.symbols.push(symbol);
 if (p.symbols.length === expected.length) { p.rural = true; p.bridge = p.otto; return 'complete'; }
 return 'correct';
}
export function collectCoin(p: Progress, id: number): boolean {
 if (p.coins.has(id)) return false;
 p.coins.add(id); return true;
}
export function canStomp(velocityY: number, playerBottom: number, enemyTop: number): boolean {
 return velocityY > 45 && playerBottom <= enemyTop + 34;
}
export function canJump(now: number, lastGrounded: number, bufferedUntil: number): boolean {
 return now <= bufferedUntil && now - lastGrounded <= 120;
}

export type ScoreRules = { puntos_por_esfera: number; bonus_todas: number };
export type LevelScore = { collected: number; available: number; base: number; bonus: number; total: number; complete: boolean };
/** Derived from unique, valid collectible IDs: reattempts and repeated endings cannot add points. */
export function scoreLevel(coins: ReadonlySet<number>, available: number, rules: ScoreRules): LevelScore {
 const collected = [...coins].filter(id => Number.isInteger(id) && id >= 0 && id < available).length;
 const complete = available > 0 && collected === available;
 const base = collected * rules.puntos_por_esfera;
 const bonus = complete ? rules.bonus_todas : 0;
 return { collected, available, base, bonus, total: base + bonus, complete };
}
