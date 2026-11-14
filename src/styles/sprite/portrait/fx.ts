import { ellipse, or, type Pix, rect, type Shape } from '../../../core/portrait/canvas.js';
import { tag } from '../../../core/portrait/motion.js';
import { Role, type RoleGrid } from '../../../core/types.js';
import { capsule } from './extras.js';
import { type Fit, point } from './trace.js';

/** A planet's ring: the avatar's long row of accent cells, as one band reaching out past the planet's sides. */
export function ringRow(g: RoleGrid): { r: number; c0: number; c1: number } | undefined {
  for (const [r, row] of g.entries()) {
    const cols = row.flatMap((v, c) => (v === Role.Accent ? [c] : []));
    if (cols.length >= 7) return { r, c0: Math.min(...cols), c1: Math.max(...cols) };
  }
  return undefined;
}

/** Draws a planet's ring across it, rounded at the tips, so it's outlined like the planet. */
export function ring(p: Pix, g: RoleGrid, f: Fit): void {
  const at = ringRow(g);
  if (!at) return;
  p.fill(capsule(point(f, at.c0 - 0.3, at.r), point(f, at.c1 + 0.3, at.r), 1.6), 'accent');
}

/**
 * A crystal's two faces, split down the middle of each row: the light face
 * keeps its highlight and shine, the dark face takes the light face's
 * darkest tone with a deeper band at its edge, and the outline runs all round.
 */
export function faces(p: Pix, body: Shape, f: Fit): void {
  const shine: [number, number][] = [];
  for (let y = 0; y < p.h; y++) {
    const xs = [...Array(p.w).keys()].filter((x) => body(x, y));
    if (xs.length === 0) continue;
    const [x0, x1] = [xs[0] as number, xs[xs.length - 1] as number];
    const mid = Math.round((x0 + x1) / 2);
    for (let x = mid + 1; x <= x1; x++) {
      if (p.get(x, y) !== 'body') continue;
      p.set(x, y, x > x1 - 5 ? 'facet' : 'body', -1);
    }
    if (p.get(mid, y) === 'body') p.set(mid, y, 'shade');
    if (y > f.oy + 3 * f.s && y < f.oy + 7.5 * f.s) shine.push([x0 + Math.round((mid - x0) * 0.35), y]);
  }
  for (const [x, y] of shine) for (const dx of [0, 1]) if (p.get(x + dx, y) === 'body') p.set(x + dx, y, 'shine');
}

/** Extra sparkles around a still crystal, so it doesn't look static, in two sets that twinkle on their own clocks. */
export function sparkles(p: Pix, body: Shape): void {
  const spots: [number, number, number, string][] = [
    [9, 12, 1.4, 'sparkles'],
    [55, 16, 1, 'sparkles'],
    [7, 34, 1, 'sparkles2'],
    [57, 38, 1.4, 'sparkles2'],
    [13, 54, 1, 'sparkles'],
    [51, 56, 1, 'sparkles2'],
  ];
  for (const [x, y, k, part] of spots) {
    if (body(x, y)) continue;
    tag(p, part, () =>
      p.fill(
        or(
          rect(x, y - 2 * k, x, y + 2 * k),
          rect(x - 2 * k, y, x + 2 * k, y),
          ellipse(x + 0.5, y + 0.5, 1.2 * k, 1.2 * k),
        ),
        'mote',
      ),
    );
  }
}

/** Little rocks floating round a boulder's top, as the avatar's grit does, drawn to be outlined. */
export function rocks(p: Pix, f: Fit): void {
  for (const [r, c, rx, ry] of [
    [4.4, 2.6, 2.2, 1.7],
    [6.6, 1, 1.6, 1.3],
    [4, 12.2, 2, 1.6],
    [6.4, 13.4, 1.4, 1.1],
  ] as const) {
    const [x, y] = point(f, c, r);
    tag(p, 'rocks', () => p.fill(ellipse(x, y, rx, ry), 'pebble'));
  }
}

/** Embers rising off a fire Sprite's top and away, in three sets on their own clocks, each set split into two halves. */
export function embers(p: Pix, body: Shape): void {
  let top = p.h;
  let x0 = p.w;
  let x1 = 0;
  for (let y = 0; y < p.h; y++)
    for (let x = 0; x < p.w; x++)
      if (body(x, y)) {
        top = Math.min(top, y);
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
      }
  const surface = (x: number): number => {
    for (let y = 0; y < p.h; y++) if (body(x, y)) return y;
    return top;
  };
  for (let k = 0; k < 8; k++) {
    const x = Math.round(x0 + ((k + 0.5) / 8) * (x1 - x0));
    const y = surface(x) - 1 - (k % 2) * 3;
    const size = k % 3 === 0 ? 3 : 2;
    tag(p, `ember${k % 3}`, () => p.fill(rect(x, y, x + size - 1, y + size - 1), 'mote'));
  }
}
