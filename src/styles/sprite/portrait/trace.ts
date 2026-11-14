import type { Shape } from '../../../core/portrait/canvas.js';
import type { RoleGrid } from '../../../core/types.js';

/** How the 15x15 avatar sits on the 64x64 portrait: `s` portrait cells per avatar cell, offset `ox`, `oy`. */
export interface Fit {
  s: number;
  ox: number;
  oy: number;
}

/** The portrait point at the middle of avatar cell (`c`, `r`). */
export const point = (f: Fit, c: number, r: number): [number, number] => [
  f.ox + (c + 0.5) * f.s,
  f.oy + (r + 0.5) * f.s,
];

/**
 * Traces a set of avatar cells as a smooth shape on the portrait: each
 * portrait cell takes a Gaussian-weighted vote of the avatar cells around
 * it and is inside when at least half the weight says so. Single cells come
 * out as round dots, steps as curves, and the avatar's outline is kept.
 *
 * @param g - The avatar's grid
 * @param keep - Which cells are in the set
 * @param f - Where the avatar sits on the portrait
 * @param sigma - The vote's spread, in avatar cells
 */
export function trace(g: RoleGrid, keep: (r: number, c: number) => boolean, f: Fit, sigma = 0.5): Shape {
  const n = g.length;
  const cache = new Map<number, boolean>();
  return (x, y) => {
    const key = y * 1000 + x;
    const hit = cache.get(key);
    if (hit !== undefined) return hit;
    const u = (x + 0.5 - f.ox) / f.s - 0.5;
    const v = (y + 0.5 - f.oy) / f.s - 0.5;
    let yes = 0;
    let all = 0;
    for (let r = Math.floor(v) - 1; r <= Math.ceil(v) + 1; r++) {
      for (let c = Math.floor(u) - 1; c <= Math.ceil(u) + 1; c++) {
        const w = Math.exp(-((c - u) ** 2 + (r - v) ** 2) / (2 * sigma * sigma));
        all += w;
        if (r >= 0 && c >= 0 && r < n && c < n && keep(r, c)) yes += w;
      }
    }
    const inside = yes / all >= (sigma > 0.7 ? 0.42 : 0.5);
    cache.set(key, inside);
    return inside;
  };
}

/** Groups cells of one role into 4-connected clumps. */
export function clumps(g: RoleGrid, keep: (r: number, c: number) => boolean): [number, number][][] {
  const seen = new Set<string>();
  const out: [number, number][][] = [];
  for (let r = 0; r < g.length; r++) {
    for (let c = 0; c < g.length; c++) {
      if (!keep(r, c) || seen.has(`${r},${c}`)) continue;
      const clump: [number, number][] = [];
      const stack: [number, number][] = [[r, c]];
      seen.add(`${r},${c}`);
      while (stack.length > 0) {
        const [cr, cc] = stack.pop() as [number, number];
        clump.push([cr, cc]);
        for (const [nr, nc] of [
          [cr - 1, cc],
          [cr + 1, cc],
          [cr, cc - 1],
          [cr, cc + 1],
        ] as const) {
          if (nr < 0 || nc < 0 || nr >= g.length || nc >= g.length) continue;
          if (keep(nr, nc) && !seen.has(`${nr},${nc}`)) {
            seen.add(`${nr},${nc}`);
            stack.push([nr, nc]);
          }
        }
      }
      out.push(clump);
    }
  }
  return out;
}
