import { Role, type RoleGrid } from '../../../core/types.js';
import { clumps, isolated } from './trace.js';

/** Forms whose bright cells are a fire's core, never a shine. */
const CORES = ['flame', 'wisp'];

/** The four cells around (r, c). */
const around = (r: number, c: number): [number, number][] => [
  [r - 1, c],
  [r + 1, c],
  [r, c - 1],
  [r, c + 1],
];

/**
 * Whether a frame's cell is part of the body rather than a loose bit drawn
 * apart: a planet's sparkles, a boulder's grit, a jellyfish's tentacles.
 *
 * @param g - The frame's avatar grid
 * @param form - The Sprite's form
 * @param below - For a jellyfish, whether a row is below its bell
 * @returns The test, by row and column
 */
export function solidIn(g: RoleGrid, form: string, below?: (r: number) => boolean): (r: number, c: number) => boolean {
  const role = (r: number, c: number): number => g[r]?.[c] ?? Role.Empty;
  const has = (r: number, c: number, roles: number[]): boolean =>
    around(r, c).some(([rr, cc]) => roles.includes(role(rr, cc)));
  const loose = (r: number, c: number): boolean =>
    (role(r, c) === Role.Screen && !has(r, c, [Role.Body, Role.Shade]) && isolated(g, r, c)) ||
    (form === 'boulder' && !has(r, c, [Role.Body, Role.Shade, Role.Screen])) ||
    (below?.(r) ?? false);
  return (r, c) => [Role.Body, Role.Shade, Role.Screen].includes(role(r, c) as 1) && !loose(r, c);
}

/**
 * Small bright spots on a frame's body, drawn as shines, flat white; a
 * fire's core isn't one.
 *
 * @param g - The frame's avatar grid
 * @param form - The Sprite's form
 * @param solid - Whether a cell is part of the body, from {@link solidIn}
 * @returns The shine cells, as `row,col` keys
 */
export function shines(g: RoleGrid, form: string, solid: (r: number, c: number) => boolean): Set<string> {
  if (CORES.includes(form)) return new Set();
  return new Set(
    clumps(g, (r, c) => g[r]?.[c] === Role.Screen && solid(r, c))
      .filter((k) => k.length <= 4)
      .flatMap((k) => k.map(([r, c]) => `${r},${c}`)),
  );
}
