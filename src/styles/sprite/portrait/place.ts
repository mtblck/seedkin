import type { Pix } from '../../../core/portrait/canvas.js';
import { tag } from '../../../core/portrait/motion.js';
import { Role, type RoleGrid } from '../../../core/types.js';
import { type Fit, point } from './trace.js';

/** Rows to move a form down (or up), so the ones that stand sit at one height: two rows clear of the bottom. */
export const LIFT: Record<string, number> = { mushroom: -2, boulder: 1, tree: 2 };

/** Moves everything drawn `dy` rows down (up when negative), leaving blank rows behind. */
export function shift(p: Pix, dy: number): void {
  if (dy === 0) return;
  for (const k of ['m', 'tone', 'z', 'part', 'lid'] as const) {
    const rows = p[k] as unknown[][];
    const blank = (rows[0] as unknown[]).map((v) => (typeof v === 'number' ? 0 : typeof v === 'string' ? '' : null));
    const moved = rows.map((_, y) => [...((rows[y - dy] as unknown[] | undefined) ?? blank)]);
    rows.splice(0, rows.length, ...moved);
  }
}

/** Makes everything drawn above row `y0`, but for parts that move already, one swaying part `name`. */
export function sway(p: Pix, name: string, y0: number): void {
  for (let y = 0; y < y0; y++)
    for (let x = 0; x < p.w; x++) if (p.get(x, y) !== '' && p.part[y]?.[x] === '') (p.part[y] as string[])[x] = name;
}

/** The first avatar row of a tree's trunk. */
export function trunkRow(g: RoleGrid): number {
  const r = g.findIndex((row) => row.includes(Role.Screen));
  return r < 0 ? g.length : r;
}

/** A falling leaf, drawn by hand: `l` the leaf, `v` its darker vein. */
const LEAF = ['..ll', '.lvl', 'lvl.', 'll..'];

/**
 * Two leaves falling from a treetop, one off each side of its lower edge,
 * as the avatar's leaves drop past it.
 */
export function leaves(p: Pix, g: RoleGrid, f: Fit): void {
  const r = trunkRow(g) - 2;
  const row = g[r] ?? [];
  const filled = row.flatMap((v, c) => (v === Role.Empty ? [] : [c]));
  if (filled.length === 0) return;
  tag(p, 'leaves', () => {
    for (const c of [Math.min(...filled) - 0.6, Math.max(...filled) + 0.6]) {
      const [x, y] = point(f, c, r);
      LEAF.forEach((line, dy) => {
        [...line].forEach((ch, dx) => {
          if (ch !== '.') p.set(Math.round(x) - 1 + dx, Math.round(y) - 1 + dy, 'leaf', ch === 'v' ? -1 : 0);
        });
      });
    }
  });
}
