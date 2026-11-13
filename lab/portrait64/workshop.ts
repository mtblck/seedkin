import type { Rng } from '../../src/core/random.js';
import { and, ellipse, not, or, type Pix, rect, type Shape } from './canvas.js';

/** A gear of radius `r` with `n` teeth and a hole in the middle. */
function gear(cx: number, cy: number, r: number, n: number): Shape {
  return (x, y) => {
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    const d = Math.hypot(dx, dy);
    const tooth = Math.cos(Math.atan2(dy, dx) * n) > 0.3 ? 1.6 : 0;
    return d <= r + tooth && d > r * 0.35;
  };
}

/** A wrench hanging head-up: a ring with a gap, on a handle. */
function wrench(cx: number, top: number): Shape {
  return or(
    and(ellipse(cx, top + 3, 3.4, 3.4), not(ellipse(cx, top + 2, 1.6, 2.4)), not(rect(cx - 1, top - 1, cx, top + 1))),
    rect(cx - 1, top + 6, cx, top + 20),
  );
}

/** A hammer: a block head on a handle. */
function hammer(cx: number, top: number): Shape {
  return rect(cx - 4, top, cx + 3, top + 3);
}

/**
 * A workshop wall for robots: a pegboard with a few tools on it and a
 * workbench along the bottom. Draws over the scene's planked wall.
 *
 * @param p - Scene canvas
 * @param rng - The portrait's generator
 * @param w - Width in cells
 */
export function workshop(p: Pix, rng: Rng, w: number): void {
  p.fill(rect(2, 8, w - 3, 41), 'trim');
  p.fill(rect(3, 9, w - 4, 40), 'wall', 1);
  p.fill((x, y) => x > 3 && x < w - 4 && y > 9 && y < 40 && x % 4 === 1 && y % 4 === 1, 'trim', -1);
  const slots = Math.max(2, Math.floor((w - 8) / 14));
  for (let i = 0; i < slots; i++) {
    const cx = 6 + i * ((w - 12) / Math.max(1, slots - 1)) + Math.floor(rng() * 3);
    const kind = rng();
    if (kind < 0.35) p.fill(gear(cx, 18 + rng() * 8, 4, 8), 'prop');
    else if (kind < 0.7) p.fill(wrench(cx, 12 + Math.floor(rng() * 4)), 'prop');
    else {
      const top = 13 + Math.floor(rng() * 4);
      p.fill(rect(Math.floor(cx) - 1, top + 3, Math.floor(cx), top + 17), 'hill', 1);
      p.fill(hammer(Math.floor(cx), top), 'prop', -1);
    }
  }
  p.fill(rect(0, 46, w - 1, 48), 'trim', 1);
  p.fill(rect(0, 49, w - 1, 63), 'trim', -1);
}
