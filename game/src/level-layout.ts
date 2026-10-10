export type LevelLayout = {
 mundo: { ancho: number; piso: number };
 suelo: readonly (readonly number[])[];
 plataformas: readonly (readonly number[])[];
 monedas: readonly (readonly number[])[];
 puestos_control: readonly number[];
};

// Use the full texture radius, including its transparent border, for comfortable clearance.
export const SPHERE_RADIUS = 20;
export const SPHERE_PLATFORM_GAP = 16;
export const CHECKPOINT_WIDTH = 45;
export const CHECKPOINT_PLATFORM_GAP = 24;
export const CHECKPOINT_REACH = 55;

/** No spheres or flags in the vertical footprint of an elevated jump platform. */
export function validateLevelLayout(level: LevelLayout): string[] {
 const errors: string[] = [];
 for (const [id, [x, y]] of level.monedas.entries()) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < SPHERE_RADIUS || x > level.mundo.ancho - SPHERE_RADIUS || y < SPHERE_RADIUS || y > level.mundo.piso - SPHERE_RADIUS) errors.push(`Esfera ${id + 1}: fuera del espacio jugable.`);
  for (const [platform, [px, , width]] of level.plataformas.entries()) {
   if (Math.abs(x - px) < width / 2 + SPHERE_RADIUS + SPHERE_PLATFORM_GAP) errors.push(`Esfera ${id + 1}: encima o debajo de la plataforma ${platform + 1}.`);
  }
 }
 for (const [id, x] of level.puestos_control.entries()) {
  if (!level.suelo.some(([left, right]) => x - CHECKPOINT_REACH >= left && x + CHECKPOINT_REACH <= right)) errors.push(`Banderín ${id + 1}: necesita suelo firme alrededor.`);
  for (const [platform, [px, , width]] of level.plataformas.entries()) {
   if (x + CHECKPOINT_WIDTH + CHECKPOINT_PLATFORM_GAP > px - width / 2 && x - CHECKPOINT_PLATFORM_GAP < px + width / 2) errors.push(`Banderín ${id + 1}: demasiado cerca de la plataforma ${platform + 1}.`);
  }
 }
 return errors;
}
