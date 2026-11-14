import { ellipse, or, type Pix, rect, type Shape } from '../../../core/portrait/canvas.js';
import { Role, type RoleGrid } from '../../../core/types.js';
import { clumps, type Fit, point } from './trace.js';

/** The avatar's loose accent cells (embers, sparkles, drops) as small four-point twinkles, unoutlined. */
export function motes(p: Pix, g: RoleGrid, f: Fit): void {
  const loose = (r: number, c: number): boolean => {
    if (g[r]?.[c] !== Role.Accent) return false;
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
