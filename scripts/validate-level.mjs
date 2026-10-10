import { readFile } from 'node:fs/promises';
import { validateLevelLayout } from '../game/src/level-layout.ts';

const level = JSON.parse(await readFile(new URL('../data/demo_plataformas.json', import.meta.url), 'utf8'));
const errors = validateLevelLayout(level);
if (errors.length) throw new Error('Distribución del nivel inválida:\n' + errors.join('\n'));
if (!Number.isInteger(level.puntaje?.puntos_por_esfera) || level.puntaje.puntos_por_esfera < 0 || !Number.isInteger(level.puntaje?.bonus_todas) || level.puntaje.bonus_todas <= 0) throw new Error('El puntaje necesita valores enteros y un bonus positivo.');
console.log(`Nivel validado: ${level.monedas.length} esferas libres de plataformas y ${level.puestos_control.length} checkpoints separados.`);
