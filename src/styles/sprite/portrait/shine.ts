import { Role, type RoleGrid } from '../../../core/types.js';
import { clumps, isolated } from './trace.js';

/** Forms whose bright cells are a fire's core, never a shine. */
const CORES = ['flame', 'wisp'];

/**
 * Small bright spots on a frame's body, drawn as shines, flat white; a
 * fire's core isn't one. A screen cell counts when `solid` says it's part of
 * the body, by default when it touches the body or isn't a lone sparkle.
 *
 * @param g - The frame's avatar grid
 * @param form - The Sprite's form
 * @param solid - Whether a cell is part of the body rather than a loose bit
 * @returns The shine cells, as `row,col` keys
 */
export function shines(g: RoleGrid, form: string, solid?: (r: number, c: number) => boolean): Set<string> {
  if (CORES.includes(form)) return new Set();
  const near = (r: number, c: number): boolean =>
    [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ].some(([rr, cc]) => [Role.Body, Role.Shade].includes(g[rr as number]?.[cc as number] as 1));
  const body = solid ?? ((r: number, c: number): boolean => near(r, c) || !isolated(g, r, c));
  return new Set(
    clumps(g, (r, c) => g[r]?.[c] === Role.Screen && body(r, c))
      .filter((k) => k.length <= 4)
      .flatMap((k) => k.map(([r, c]) => `${r},${c}`)),
  );
}
