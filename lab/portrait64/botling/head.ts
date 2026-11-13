import type { Traits } from '../../../src/styles/botling/types.js';
import { and, ellipse, or, type Pix, rect, rounded, type Shape } from '../canvas.js';

/** Where a robot's head and face sit on the 64x64 canvas. */
export interface Bot {
  cx: number;
  cy: number;
  hx: number;
  /** How far out the side pieces sit: past the plates on a TV head. */
  side: number;
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
  // Bucket and wedge narrow the way the avatar's rows do, in avatar cells scaled up:
  // a bucket loses a cell every three rows down from the top, a wedge every two rows
  // up from the bottom, never below two cells narrower.
  const hw = t.halfWidth;
  const rowH = (2 * hy) / (t.bottomRow - t.topRow + 1);
  const scale = hx / (hw + 0.5);
  const taper = (y: number, from: 'top' | 'bottom'): number => {
    const rows = from === 'top' ? (y + 0.5 - top) / rowH : (top + 2 * hy - (y + 0.5)) / rowH;
    return (Math.max(hw - 2, hw - rows / (from === 'top' ? 3 : 2)) + 0.5) * scale;
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
    bucket: and(rounded(cx, cy, hx, hy, 2), (x, y) => Math.abs(x + 0.5 - cx) <= taper(y, 'top')),
    wedge: and(rounded(cx, cy, hx, hy, 2), (x, y) => Math.abs(x + 0.5 - cx) <= taper(y, 'bottom')),
  };
  return {
    cx,
    cy,
    hx: t.head === 'tv' ? hx + 2 : hx,
    side: t.head === 'tv' ? hx + 5 : hx,
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
 * The head: the body colour edged on both sides in the shade colour, as the
 * avatar is; then markings and the screen.
 */
export function drawHead(p: Pix, t: Traits, b: Bot): void {
  // A TV head has plates on its sides, as the avatar's is a cell wider in its middle rows.
  if (t.head === 'tv')
    p.fill(
      or(rounded(b.cx - b.hx - 1.5, b.cy, 2.6, b.hy * 0.5, 1), rounded(b.cx + b.hx + 1.5, b.cy, 2.6, b.hy * 0.5, 1)),
      'shade',
    );
  p.fill(b.head, 'shade');
  // Like the avatar, the shade colour edges the head on both sides, so two-tone palettes stay symmetrical.
  p.fill((x, y) => b.head(x, y) && b.head(x + 2, y) && b.head(x - 2, y), 'body');
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
  const box = rounded(b.cx, (sy0 + sy1) / 2, sx, (sy1 - sy0) / 2, 3);
  // Kept inside the head, so where a tapered head is narrower than the screen it runs to the rim, as on the avatar.
  const sc: Shape = (x, y) => box(x, y) && b.head(x - 1, y) && b.head(x + 1, y);
  p.fill(sc, 'screen');
  // A glare across the screen's upper left.
  p.over(
    (x, y) => sc(x, y) && x + y - (b.cx - sx + sy0) >= 3 && x + y - (b.cx - sx + sy0) <= 4,
    'screen',
    ['screen'],
    1,
  );
}
