import type { BeastieTraits } from '../../../src/styles/beastie/types.js';
import { and, ellipse, or, type Pix, rounded, type Shape, tri } from '../canvas.js';

/**
 * Where a Beastie sits on the 64x64 canvas. A Beastie is all head: its body
 * is one shape, as on the avatar, with the face on its upper half.
 */
export interface Beast {
  cx: number;
  cy: number;
  hx: number;
  hy: number;
  top: number;
  bottom: number;
  shape: Shape;
  /** One avatar cell, in portrait cells. */
  s: number;
}

/** A rounded rectangle-ish blob: superellipse with exponent `e`. */
const superellipse =
  (cx: number, cy: number, hx: number, hy: number, e: number): Shape =>
  (x, y) =>
    Math.abs((x + 0.5 - cx) / hx) ** e + Math.abs((y + 0.5 - cy) / hy) ** e <= 1;

/**
 * Sizes the body from the avatar's body kind and half-width, one avatar cell
 * to `s` portrait cells; feet stand on row 60.
 */
export function layout(t: BeastieTraits): Beast {
  const s = 3.4;
  const w = t.halfWidth + 0.5;
  const cx = 32;
  const [hx, rows, e] = {
    blob: [w * s, 9, 2.3],
    tall: [(w - 1) * s, 10, 2.8],
    wide: [(w + 1) * s, 7, 2.6],
    ghost: [w * s, 9, 2],
    box: [w * s, 8, 4.5],
  }[t.body] as [number, number, number];
  const hy = (rows * s) / 2;
  const bottom = t.body === 'ghost' ? 58 : 56;
  const cy = bottom - hy;
  let shape: Shape;
  if (t.body === 'ghost') {
    // A dome over straight sides, the hem cut into scallops.
    const dome = superellipse(cx, cy, hx, hy, 2);
    const scallop = (x: number): number => bottom - 2 + Math.cos(((x + 0.5 - cx) / (hx / 2.5)) * Math.PI) * 2;
    shape = or(
      and(dome, (_x, y) => y < cy),
      (x, y) => y >= cy && Math.abs(x + 0.5 - cx) <= hx && y <= scallop(x),
    );
  } else shape = superellipse(cx, cy, hx, hy, e);
  return { cx, cy, hx, hy, top: cy - hy, bottom, shape, s };
}

/** Feet: two shade nubs under the body, as on the avatar (a ghost floats). */
export function feet(p: Pix, t: BeastieTraits, b: Beast): void {
  if (t.body === 'ghost') return;
  const dx = Math.max(1.5, t.halfWidth - 2.5 + (t.body === 'wide' ? 1 : 0)) * b.s;
  for (const sd of [-1, 1]) p.fill(rounded(b.cx + sd * dx, b.bottom + 3, 4.6, 3.4, 2), 'shade');
}

/** The body with a shade rim on both sides, as the avatar's rows end in shade. */
export function drawBody(p: Pix, b: Beast): void {
  p.fill(b.shape, 'shade');
  p.fill(
    and(b.shape, (x, y) => b.shape(x - 2, y) && b.shape(x + 2, y)),
    'body',
  );
}

/** Spots in the accent colour, where the avatar puts its three, plus a few smaller ones. */
export function spots(p: Pix, b: Beast): void {
  const at = (dx: number, dy: number, r: number): Shape => ellipse(b.cx + dx * b.s, b.top + dy * b.s, r, r * 0.85);
  const w = b.hx / b.s;
  p.over(
    or(at(-w + 1.6, 4.4, 2.6), at(w - 1.8, 2.4, 2.2), at(-0.8, 6.6, 2.4), at(w - 2.4, 6, 1.4), at(-w + 2.6, 2.2, 1.2)),
    'accent',
    ['body'],
  );
}

/** Horns, antennae, spikes or a tuft on top, drawn behind the body. */
export function topPiece(p: Pix, t: BeastieTraits, b: Beast): void {
  const top = b.top;
  const edge = (f: number): number => b.hx * f;
  switch (t.top) {
    case 'horns':
      for (const sd of [-1, 1]) {
        const x = b.cx + sd * edge(0.62);
        // A horn curving up and out, its tip in the accent colour.
        const horn: Shape = (cx, cy) => {
          const k = (top + 4 - cy) / 11;
          return k >= 0 && k <= 1 && Math.abs(cx + 0.5 - (x + sd * k * k * 6)) <= 3.4 * (1 - k) + 0.6;
        };
        p.fill(horn, 'shade');
        p.fill(
          and(horn, (_x, cy) => cy < top - 4),
          'accent',
        );
      }
      return;
    case 'antennae':
      for (const sd of [-1, 1]) {
        const x = b.cx + sd * 1.2 * b.s;
        p.fill(
          (cx, cy) => cy >= top - 9 && cy <= top + 2 && Math.abs(cx + 0.5 - (x + sd * (top + 2 - cy) * 0.35)) < 1,
          'shade',
        );
        p.fill(ellipse(x + sd * 4, top - 10, 2.6, 2.6), 'accent');
      }
      return;
    case 'spikes': {
      const n = Math.max(3, Math.round((b.hx * 1.4) / 7));
      for (let i = 0; i < n; i++) {
        const x = b.cx + (i - (n - 1) / 2) * 7;
        const base = top + 3 + Math.abs(x - b.cx) ** 2 / (b.hx * 1.6);
        p.fill(tri(x - 3.2, base + 2, x + 3.2, base + 2, x, base - 6), 'shade');
      }
      return;
    }
    case 'tuft':
      p.fill(
        or(
          tri(b.cx - 5, top + 3, b.cx + 1, top + 3, b.cx - 4, top - 6),
          tri(b.cx - 2, top + 3, b.cx + 4, top + 3, b.cx + 1, top - 8),
          tri(b.cx + 1, top + 3, b.cx + 6, top + 3, b.cx + 5, top - 4),
        ),
        'shade',
      );
      return;
    default:
      return;
  }
}

/**
 * Arms on every portrait: raised and waving for avatars with arms, hanging
 * at the sides otherwise. Wings spread behind, in the accent colour, when
 * the avatar has them.
 */
export function limbs(p: Pix, t: BeastieTraits, b: Beast, front: boolean): void {
  if (!front && t.sides === 'wings') {
    for (const sd of [-1, 1]) {
      const x = b.cx + sd * (b.hx - 2);
      const y = b.top + b.hy * 0.55;
      const wing: Shape = (cx, cy) => {
        const dx = (cx + 0.5 - x) * sd;
        const dy = y - (cy + 0.5);
        return (
          dx >= 0 &&
          dx <= 14 &&
          dy >= -6 + dx * 0.15 &&
          dy <= 4 + dx * 0.9 &&
          !(dx > 5 && (dy + 40) % 5 < 1.2 && dy < dx * 0.9 - 2)
        );
      };
      p.fill(wing, 'accent');
    }
  }
  if (front) return;
  for (const sd of [-1, 1]) {
    const x = b.cx + sd * (b.hx - 1);
    const y = b.top + b.hy * (t.body === 'wide' ? 1.15 : 1.05);
    if (t.sides === 'arms') {
      // Raised, as the avatar's arms reach up and out.
      p.fill((cx, cy) => {
        const dx = (cx + 0.5 - x) * sd;
        return dx >= -2 && dx <= 8 && Math.abs(cy + 0.5 - (y - dx * 0.9)) <= 2;
      }, 'shade');
      p.fill(ellipse(x + sd * 8.5, y - 8, 2.8, 2.8), 'shade');
    } else {
      // Hanging at its sides, angled a little out, with a round hand.
      p.fill((cx, cy) => {
        const dy = cy + 0.5 - y;
        return dy >= -2 && dy <= 8 && Math.abs((cx + 0.5 - x) * sd - (1 + dy * 0.3)) <= 2.1;
      }, 'shade');
      p.fill(ellipse(x + sd * 3.6, y + 9, 2.7, 2.5), 'shade');
    }
  }
}
