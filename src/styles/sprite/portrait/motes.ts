import { ellipse, or, type Pix, rect, type Shape } from '../../../core/portrait/canvas.js';
import { Role, type RoleGrid } from '../../../core/types.js';
import { clumps, type Fit, isolated, point } from './trace.js';

/**
 * The avatar's loose accent cells (embers, sparkles, drops), and a planet's
 * loose screen sparkles, as four-point twinkles, unoutlined; or, around a
 * drop or a bubble (`bubbles`), as little floating bubbles: a pale ring
 * with a see-through middle and a white glint. `skip` holds cells drawn as
 * something else, such as a boulder's sprout.
 */
export function motes(p: Pix, g: RoleGrid, f: Fit, skip: ReadonlySet<string>, bubbles = false): void {
  const loose = (r: number, c: number): boolean => {
    if (skip.has(`${r},${c}`)) return false;
    const v = g[r]?.[c];
    // Screen cells only as a sparkle of their own, such as a planet's, not a tree's roots.
    if (v === Role.Screen) return isolated(g, r, c);
    if (v !== Role.Accent) return false;
    return ![
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ].some(([rr, cc]) => {
      const v = g[rr as number]?.[cc as number];
      return v === Role.Body || v === Role.Shade || v === Role.Screen;
    });
  };
  for (const clump of clumps(g, loose)) {
    const [x, y] = point(
      f,
      clump.reduce((a, [, c]) => a + c, 0) / clump.length,
      clump.reduce((a, [r]) => a + r, 0) / clump.length,
    );
    const k = clump.length > 1 ? 1.4 : 1;
    if (bubbles) {
      // A bubble with a smaller one beside it, out in the air (judged from the still frame, so every
      // frame draws the same), and a third, tiny one when there's room.
      const air = (bx: number, by: number): boolean => {
        const [c, r] = [Math.floor((bx - f.ox) / f.s), Math.floor((by - f.oy) / f.s)];
        const inside = bx > 3 && by > 3 && bx < p.w - 3 && by < p.h - 3;
        return (
          inside &&
          [-1, 0, 1].every((dr) =>
            [-1, 0, 1].every((dc) => !g[r + dr]?.[c + dc] || g[r + dr]?.[c + dc] === Role.Accent),
          )
        );
      };
      bubble(p, x, y, 3);
      const spots = SIDES.map(([dx, dy]) => [x + dx * k, y + dy * k] as const);
      const [bx, by] = spots.find(([sx, sy]) => air(sx, sy)) ?? (spots[0] as readonly [number, number]);
      bubble(p, bx, by, 2);
      const [tx, ty] = [bx + (bx - x) * 0.6, by + (by - y) * 0.6];
      if (air(tx, ty)) bubble(p, tx, ty, 1);
      continue;
    }
    const star: Shape = or(
      rect(Math.round(x), Math.round(y - 2 * k), Math.round(x), Math.round(y + 2 * k)),
      rect(Math.round(x - 2 * k), Math.round(y), Math.round(x + 2 * k), Math.round(y)),
      ellipse(x, y, 1.2 * k, 1.2 * k),
    );
    // A sparkle takes its cell's colour in the avatar: a planet's are its bright screen colour.
    p.fill(star, clump.some(([r, c]) => g[r]?.[c] === Role.Screen) ? 'spark' : 'mote');
  }
}

/** Where a bubble's smaller companion may go, in order: below and to the side first, as if it trailed. */
const SIDES = [
  [5, 6.5],
  [-5, 6.5],
  [6, -5],
  [-6, -5],
  [7, 0],
  [-7, 0],
] as const;

/** Floating bubbles, drawn by hand: `o` the pale ring, `-` the see-through middle, `*` the glint. */
const BUBBLES: Record<number, string[]> = {
  3: ['..ooo..', '.o---o.', 'o-*---o', 'o-----o', 'o-----o', '.o---o.', '..ooo..'],
  2: ['.ooo.', 'o---o', 'o---o', 'o---o', '.ooo.'],
  1: ['oo', 'oo'],
};

/** One floating bubble of size 1 to 3, centred near (x, y). */
function bubble(p: Pix, x: number, y: number, size: number): void {
  const rows = BUBBLES[size] as string[];
  const [x0, y0] = [Math.round(x - rows.length / 2), Math.round(y - rows.length / 2)];
  const mats: Record<string, string> = { o: 'bubble', '-': 'bubblein', '*': 'shine' };
  rows.forEach((row, dy) => {
    [...row].forEach((ch, dx) => {
      if (mats[ch]) p.set(x0 + dx, y0 + dy, mats[ch] as string);
    });
  });
}
