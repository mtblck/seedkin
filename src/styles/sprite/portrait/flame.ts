import { or, type Pix, type Shape } from '../../../core/portrait/canvas.js';
import { Role, type RoleGrid } from '../../../core/types.js';
import { type Fit, point, trace } from './trace.js';

/** A streak from (x0, y0) along the unit (dx, dy), `l` long, narrowing to a point as it leaves the core. */
const ray =
  (x0: number, y0: number, dx: number, dy: number, l: number): Shape =>
  (x, y) => {
    const [vx, vy] = [x + 0.5 - x0, y + 0.5 - y0];
    const d = vx * dx + vy * dy;
    return d >= -1 && d <= l && Math.abs(vx * dy - vy * dx) <= 1.5 * (1 - d / (l + 2));
  };

/**
 * A flame's core, as the avatar draws it from its still frame `g`, held
 * still (`glow`), and the streaks off its top and side points (`streaks`),
 * which carry all the motion, growing and falling back through the four frames.
 */
export function core(g: RoleGrid, n: number, f: Fit): { glow: Shape; streaks: Shape } {
  const cells = g.flatMap((row, r) => row.flatMap((v, c) => (v === Role.Screen ? [[r, c] as const] : [])));
  const top = Math.min(...cells.map(([r]) => r));
  const wide = cells.filter(([r]) => r === top + 2).map(([, c]) => c);
  const [tx, ty] = point(f, cells.find(([r]) => r === top)?.[1] ?? 7, top - 0.5);
  const [lx, ly] = point(f, Math.min(...wide) - 0.5, top + 2);
  const [rx] = point(f, Math.max(...wide) + 0.5, top + 2);
  const len = [0, 1, 3, 1][n] as number;
  return {
    glow: trace(g, (r, c) => g[r]?.[c] === Role.Screen, f, 0.45),
    streaks: or(ray(tx, ty, 0, -1, len), ray(lx, ly, -1, 0, len), ray(rx, ly, 1, 0, len)),
  };
}

/**
 * Paints the streaks on, before the ink so they're outlined like the core,
 * only where they run unbroken from it and stay two pixels clear of the face and the edge.
 */
export function streak(p: Pix, s: Shape): void {
  const near = (x: number, y: number): boolean => {
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) {
        const m = p.get(x + dx, y + dy);
        if (m === 'face' || (m === '' && Math.abs(dx) + Math.abs(dy) <= 2)) return true;
      }
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
