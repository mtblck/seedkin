import { ellipse, or, type Pix, type Shape } from '../../../core/portrait/canvas.js';
import { Role, type RoleGrid } from '../../../core/types.js';
import { type Fit, point } from './trace.js';

const N8 = [-1, 0, 1].flatMap((dr) => [-1, 0, 1].map((dc) => [dr, dc] as const)).filter(([a, b]) => a || b);

/** A rounded stroke from `a` to `b`, `r` wide either side. */
export const capsule =
  (a: [number, number], b: [number, number], r: number): Shape =>
  (x, y) => {
    const [qx, qy] = [x + 0.5 - a[0], y + 0.5 - a[1]];
    const [vx, vy] = [b[0] - a[0], b[1] - a[1]];
    const len = vx * vx + vy * vy;
    const k = len === 0 ? 0 : Math.max(0, Math.min(1, (qx * vx + qy * vy) / len));
    return Math.hypot(qx - k * vx, qy - k * vy) <= r;
  };

/** The accent cells of a boulder's sprout: those joined, corners included, to one on top of the body. */
export function sproutCells(g: RoleGrid): Set<string> {
  const body = (r: number, c: number): boolean => [Role.Body, Role.Shade].includes(g[r]?.[c] as 1);
  const out = new Set<string>();
  const todo: [number, number][] = [];
  g.forEach((row, r) => {
    row.forEach((v, c) => {
      if (v === Role.Accent && body(r + 1, c)) todo.push([r, c]);
    });
  });
  while (todo.length > 0) {
    const [r, c] = todo.pop() as [number, number];
    if (out.has(`${r},${c}`)) continue;
    out.add(`${r},${c}`);
    for (const [dr, dc] of N8) if (g[r + dr]?.[c + dc] === Role.Accent && r + dr <= r) todo.push([r + dr, c + dc]);
  }
  return out;
}

/** A leaf: an ellipse `l` long and `w` wide from (x, y), pointing along angle `a`. */
const leaf =
  (x: number, y: number, a: number, l: number, w: number): Shape =>
  (px, py) => {
    const [dx, dy] = [px + 0.5 - x, py + 0.5 - y];
    const u = dx * Math.cos(a) + dy * Math.sin(a) - l / 2;
    const v = -dx * Math.sin(a) + dy * Math.cos(a);
    return (u / (l / 2)) ** 2 + (v / (w / 2)) ** 2 <= 1;
  };

/** A boulder's sprout, as a plant: a stem up from its top, with a leaf out each side at the tip. */
export function sprout(p: Pix, g: RoleGrid, f: Fit): void {
  const cells = [...sproutCells(g)].map((k) => k.split(',').map(Number) as [number, number]);
  if (cells.length === 0) return;
  const base = cells.reduce((a, b) => (b[0] > a[0] ? b : a));
  const top = Math.min(...cells.map(([r]) => r));
  const [bx, by] = point(f, base[1], base[0] + 0.5);
  const tipY = f.oy + (top + 0.6) * f.s;
  const lean = (cells.reduce((a, [, c]) => a + c, 0) / cells.length - base[1]) * 0.6;
  const tip: [number, number] = [bx + lean, tipY];
  p.fill(
    or(
      capsule([bx, by], tip, 0.9),
      leaf(tip[0], tip[1], Math.PI + 0.45, 7, 3.4),
      leaf(tip[0], tip[1] + 2, -0.35, 6, 3),
    ),
    'sprout',
  );
}

/** A jellyfish's tentacles: the avatar's shade cells under its bell, as thin strands. */
export function tentacles(g: RoleGrid, f: Fit): { below: (r: number) => boolean; draw: (p: Pix) => void } {
  const bell = g.reduce((last, row, r) => (row.includes(Role.Body) ? r : last), 0) + 1;
  const below = (r: number): boolean => r > bell;
  const draw = (p: Pix): void => {
    const parts: Shape[] = [];
    for (let r = bell + 1; r < g.length; r++)
      g[r]?.forEach((v, c) => {
        if (v !== Role.Shade) return;
        const up = [-1, 0, 1].filter((dc) => (r - 1 === bell ? g[bell]?.[c + dc] : g[r - 1]?.[c + dc]) === Role.Shade);
        for (const dc of r - 1 === bell ? [0] : up) parts.push(capsule(point(f, c, r), point(f, c + dc, r - 1), 1.1));
        parts.push(ellipse(...point(f, c, r), 1.2, 1.2));
      });
    p.fill(or(...parts), 'tentacle');
  };
  return { below, draw };
}
