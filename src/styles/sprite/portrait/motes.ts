import { ellipse, or, type Pix, rect, type Shape } from '../../../core/portrait/canvas.js';
import { Role, type RoleGrid } from '../../../core/types.js';
import { clumps, type Fit, isolated, point } from './trace.js';

/**
 * The avatar's loose accent cells (embers, sparkles, drops), and a planet's
 * loose screen sparkles, as four-point twinkles, unoutlined. `skip` holds
 * cells drawn as something else, such as a boulder's sprout.
 */
export function motes(p: Pix, g: RoleGrid, f: Fit, skip: ReadonlySet<string>): void {
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
    const star: Shape = or(
      rect(Math.round(x), Math.round(y - 2 * k), Math.round(x), Math.round(y + 2 * k)),
      rect(Math.round(x - 2 * k), Math.round(y), Math.round(x + 2 * k), Math.round(y)),
      ellipse(x, y, 1.2 * k, 1.2 * k),
    );
    p.fill(star, 'mote');
  }
}
