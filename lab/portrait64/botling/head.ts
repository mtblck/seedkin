import type { Traits } from '../../../src/styles/botling/types.js';
import { and, ellipse, or, type Pix, rect, rounded, type Shape } from '../canvas.js';

/** Where a robot's head and face sit on the 64x64 canvas. */
export interface Bot {
  cx: number;
  cy: number;
  hx: number;
  hy: number;
  top: number;
  bottom: number;
  eyeY: number;
  mouthY: number;
  /** Eye centre's distance from the centre line. */
  ex: number;
  head: Shape;
}

/**
 * Sizes the head from the avatar's own width, height and eye gap, and
 * shapes it from its head trait.
 */
export function layout(t: Traits): Bot {
  const cx = 32;
  const cy = 25;
  const hx = 5 + t.halfWidth * 2;
  const hy = 9 + (t.bottomRow - t.topRow) * 0.65;
  const top = cy - hy;
  const taper = (y: number, wide: 'top' | 'bottom'): number => {
    const k = (y + 0.5 - top) / (2 * hy);
    return hx - 4 * (wide === 'top' ? k : 1 - k);
  };
  const shapes: Record<Traits['head'], Shape> = {
    box: rounded(cx, cy, hx, hy, 2.5),
    rounded: rounded(cx, cy, hx, hy, 6),
    capsule: rounded(cx, cy, hx, hy, Math.min(hx, hy) - 1),
    tv: rounded(cx, cy, hx + 2, hy - 1, 4),
    dome: or(
      and(ellipse(cx, cy + 1, hx, hy + 1), (_x, y) => y < cy + 1),
      and(rounded(cx, cy, hx, hy, 2.5), (_x, y) => y >= cy),
    ),
    bucket: and(rounded(cx, cy, hx, hy, 2), (x, y) => Math.abs(x + 0.5 - cx) <= taper(y, 'bottom')),
    wedge: and(rounded(cx, cy, hx, hy, 2), (x, y) => Math.abs(x + 0.5 - cx) <= taper(y, 'top')),
  };
  return {
    cx,
    cy,
    hx: t.head === 'tv' ? hx + 2 : hx,
    hy,
    top: t.head === 'tv' ? top + 1 : top,
    bottom: cy + hy,
    eyeY: cy - 2,
    mouthY: cy + 6,
    ex: 4 + t.eyeGap * 1.5,
    head: shapes[t.head],
  };
}

/**
 * The head: a shade-coloured shell with the body colour inset from its
 * lower right, so it reads as a bevelled plate; then markings and the screen.
 */
export function drawHead(p: Pix, t: Traits, b: Bot): void {
  p.fill(b.head, 'shade');
  p.fill((x, y) => b.head(x, y) && b.head(x + 2, y + 2), 'body');
  if (t.pattern === 'stripe') p.over(rect(0, Math.round(b.top) + 3, 63, Math.round(b.top) + 4), 'shade', ['body']);
  if (t.pattern === 'chin') p.over((_x, y) => y >= b.bottom - 6, 'shade', ['body']);
  if (t.pattern === 'rivets') {
    const ys = [b.top + 3, b.bottom - 4];
    const xs = [b.cx - b.hx + 3, b.cx + b.hx - 4];
    for (const y of ys)
      for (const x of xs)
        p.over(rect(Math.round(x), Math.round(y), Math.round(x), Math.round(y)), 'rivet', ['body', 'shade']);
  }
  if (!t.hasScreen) return;
  const sy0 = b.eyeY - 5;
  const sy1 = b.mouthY + 4;
  const sx = b.hx - (t.head === 'tv' ? 3 : 3.5);
  const sc = rounded(b.cx, (sy0 + sy1) / 2, sx, (sy1 - sy0) / 2, 3);
  p.fill(sc, 'screen');
  // A glare across the screen's upper left.
  p.over(
    (x, y) => sc(x, y) && x + y - (b.cx - sx + sy0) >= 3 && x + y - (b.cx - sx + sy0) <= 4,
    'screen',
    ['screen'],
    1,
  );
}
