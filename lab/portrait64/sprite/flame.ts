import { Role, type RoleGrid } from '../../../src/core/types.js';
import { or, type Pix, type Shape } from '../canvas.js';
import { type Fit, point, trace } from './trace.js';

/** A shape grown by `k` cells up and to both sides, but not down. */
const swell =
  (s: Shape, k: number): Shape =>
  (x, y) => {
    for (let d = 0; d <= k; d++) if (s(x, y + d) || s(x - d, y) || s(x + d, y)) return true;
    return false;
  };

/** A streak from (x0, y0) along the unit (dx, dy), `l` long, narrowing to a point as it leaves the core. */
const ray =
  (x0: number, y0: number, dx: number, dy: number, l: number): Shape =>
  (x, y) => {
    const [vx, vy] = [x + 0.5 - x0, y + 0.5 - y0];
    const d = vx * dx + vy * dy;
    return d >= -1 && d <= l && Math.abs(vx * dy - vy * dx) <= 1 - d / (l + 1);
  };

/**
 * A flame's core, as the avatar draws it (`g` is its still frame), glowing
 * out a pixel on the beat (`glow`), and the streaks shooting from its top
 * and its two upper faces (`streaks`): they carry most of the motion,
 * growing and falling back through the four frames.
 */
export function core(g: RoleGrid, n: number, f: Fit): { glow: Shape; streaks: Shape } {
  const shape = trace(g, (r, c) => g[r]?.[c] === Role.Screen, f, 0.45);
  const cells = g.flatMap((row, r) => row.flatMap((v, c) => (v === Role.Screen ? [[r, c] as const] : [])));
  const top = Math.min(...cells.map(([r]) => r));
  const wide = cells.filter(([r]) => r === top + 2).map(([, c]) => c);
  const [tx, ty] = point(f, cells.find(([r]) => r === top)?.[1] ?? 7, top - 0.5);
  const [lx, ly] = point(f, Math.min(...wide) - 0.5, top + 2);
  const [rx] = point(f, Math.max(...wide) + 0.5, top + 2);
  const len = [1, 2, 3, 2][n] as number;
  const reach = [2, 4, 6, 4][n] as number;
  const k = Math.SQRT1_2;
  return {
    glow: swell(shape, n % 2),
    streaks: or(
      ray(tx, ty, 0, -1, len),
      ray((tx + lx) / 2, (ty + ly) / 2, -k, -k, reach),
      ray((tx + rx) / 2, (ty + ly) / 2, k, -k, reach),
    ),
  };
}

/**
 * Paints the streaks bright over the inked portrait, only where they run
 * unbroken from the core and stay two pixels clear of the face.
 */
export function streak(p: Pix, s: Shape): void {
  const near = (x: number, y: number): boolean => {
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (p.get(x + dx, y + dy) === 'face') return true;
    return false;
  };
  const open = (x: number, y: number): boolean =>
    s(x, y) && ['body', 'shade', 'screen'].includes(p.get(x, y)) && !near(x, y);
  const seen = new Set<number>();
  const todo: [number, number][] = [];
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++) if (open(x, y) && p.get(x, y) === 'screen') todo.push([x, y]);
  while (todo.length > 0) {
    const [x, y] = todo.pop() as [number, number];
    if (seen.has(y * p.w + x) || !open(x, y)) continue;
    seen.add(y * p.w + x);
    p.set(x, y, 'screen', 0);
    todo.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
  }
}
