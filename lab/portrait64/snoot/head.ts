import type { SnootTraits } from '../../../src/styles/snoot/types.js';
import { and, ellipse, not, or, type Pix, rounded, type Shape, tri } from '../canvas.js';

/** Where a Snoot's head and face sit on the 64x64 canvas. */
export interface Head {
  cx: number;
  cy: number;
  hx: number;
  hy: number;
  top: number;
  eyeY: number;
  /** Eye centre's distance from the centre line. */
  ex: number;
  /** The muzzle's middle row. */
  mY: number;
  shape: Shape;
}

/** Sizes the head from the avatar's width and height; a frog's is wider and flatter. */
export function layout(t: SnootTraits): Head {
  const frog = t.species === 'frog';
  const cx = 32;
  const cy = 27;
  const hx = 3.2 + t.halfWidth * 2.5 + (frog ? 4 : 0);
  // A frog's head is a wide, flat pill, as on the avatar.
  const hy = (t.isTall ? 13 : 11.5) - (frog ? 3.5 : 0);
  const eyeX = Math.min(t.halfWidth - 2, 2 + (t.halfWidth > 4 ? 1 : 0));
  const shape: Shape = (x, y) => {
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    // Rounder than an ellipse, narrowing a little toward the chin like the avatar's last rows.
    const k = dy > 0 && !frog ? 1 - 0.2 * (dy / hy) ** 1.5 : 1;
    return Math.abs(dx / (hx * k)) ** 2.4 + Math.abs(dy / hy) ** 2.4 <= 1;
  };
  const eyeY = frog ? cy - hy : cy - 2;
  return { cx, cy, hx, hy, top: cy - hy, eyeY, ex: eyeX * 2.5 + 1.5, mY: cy + 4.5, shape };
}

/** A pointed ear leaning out from the head's top, with an accent lining. */
function pointed(p: Pix, h: Head, base: number, height: number, at: number, lean: number, lined: boolean): void {
  for (const s of [-1, 1]) {
    const x = h.cx + s * h.hx * at;
    const y = h.top + 3;
    p.fill(tri(x - (base / 2) * s, y, x + (base / 2) * s, y + 1, x + lean * s, y - height), 'shade');
    if (lined)
      p.fill(tri(x - (base / 4) * s, y, x + (base / 4) * s, y, x + lean * s * 0.8, y - height * 0.6), 'accent');
  }
}

/** A round ear at each top corner. */
function round(p: Pix, h: Head, r: number, at: number, dy: number, inner: number): void {
  for (const s of [-1, 1]) {
    p.fill(ellipse(h.cx + s * h.hx * at, h.top + dy, r, r), 'shade');
    if (inner) p.fill(ellipse(h.cx + s * h.hx * at, h.top + dy, inner, inner), 'accent');
  }
}

/** The species' ears, drawn behind the head. Dogs' hang over it and come in {@link dogEars}. */
export function ears(p: Pix, t: SnootTraits, h: Head): void {
  switch (t.species) {
    case 'cat':
      return pointed(p, h, 9, 9, 0.6, 2, true);
    case 'fox':
      return pointed(p, h, 10, 12, 0.6, 2.5, true);
    case 'owl':
      return pointed(p, h, 6, 6, 0.72, 2, false);
    case 'pig':
      return pointed(p, h, 7, 6, 0.62, 3.5, true);
    case 'bear':
      return round(p, h, 4.6, 0.68, 1.5, 2.4);
    case 'panda':
      return round(p, h, 4.6, 0.68, 1.5, 0);
    case 'mouse':
      return round(p, h, 7, 0.86, 1, 4.4);
    case 'bunny':
      for (const s of [-1, 1]) {
        p.fill(ellipse(h.cx + s * h.hx * 0.38, h.top - 7, 3.4, 10.5), 'shade');
        p.fill(ellipse(h.cx + s * h.hx * 0.38, h.top - 6, 1.6, 7.5), 'accent');
      }
      return;
    default:
      return;
  }
}

/** A dog's ears hang down over the sides of its head. */
export function dogEars(p: Pix, h: Head): void {
  p.fill(
    or(rounded(h.cx - h.hx + 1.5, h.cy - 1, 3.6, 9.5, 3.4), rounded(h.cx + h.hx - 1.5, h.cy - 1, 3.6, 9.5, 3.4)),
    'shade',
  );
}

/**
 * The head: fur edged on both sides in the shade colour, as the avatar's is,
 * with a frog's eye bumps on top.
 */
export function drawHead(p: Pix, t: SnootTraits, h: Head): void {
  const bumps =
    t.species === 'frog' ? or(ellipse(h.cx - h.ex, h.eyeY, 6, 6), ellipse(h.cx + h.ex, h.eyeY, 6, 6)) : () => false;
  const all = or(h.shape, bumps);
  p.fill(all, 'shade');
  p.fill(
    and(all, (x, y) => all(x - 2, y) && all(x + 2, y)),
    'body',
  );
}
