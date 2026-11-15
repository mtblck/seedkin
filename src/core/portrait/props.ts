import type { Rng } from '../random.js';
import { and, ellipse, or, type Pix, rect, type Shape, tri } from './canvas.js';

/** Where props go: the edges of a 64-wide scene, and the middle too of a 128-wide one. */
export const spots = (w: number): number[] => (w > 64 ? [7, 64, 121] : [7, 57]);

/** A heart of radius `r`, its dip at (`cx`, `cy`). */
export const heart =
  (cx: number, cy: number, r: number): Shape =>
  (x, y) => {
    const u = (x + 0.5 - cx) / r;
    const v = -(y + 0.5 - cy) / r;
    return (u * u + v * v - 1) ** 3 - u * u * v ** 3 <= 0;
  };

/** A firework: a bright centre and a ring of sparks on spokes. */
export function burst(p: Pix, cx: number, cy: number, r: number, m: string, rng: Rng): void {
  const n = 10 + Math.floor(rng() * 4);
  const turn = rng();
  for (let i = 0; i < n; i++) {
    const a = ((i + turn) / n) * Math.PI * 2;
    for (const k of [0.45, 0.7, 1])
      p.set(Math.round(cx + Math.cos(a) * r * k), Math.round(cy + Math.sin(a) * r * k), m, k === 1 ? 1 : 0);
  }
  p.fill(ellipse(cx, cy, 1.2, 1.2), m, 1);
}

/** A night sky, banded and dithered toward the horizon. */
export function sky(p: Pix, top: string, bottom: string): void {
  p.fill(() => true, top);
  p.fill((x, y) => y > 30 || (y > 18 && (x + y) % 2 === 0), bottom);
}

/** Scattered stars over the upper sky, some bright, some dim. */
export function stars(p: Pix, rng: Rng, w: number, m = 'silver'): void {
  for (let i = 0; i < w / 5; i++) p.set(Math.floor(rng() * w), Math.floor(rng() * 34), m, rng() < 0.3 ? 1 : -1);
}

/** A ribbed pumpkin with a stalk, sitting on `base`. */
export function pumpkin(p: Pix, cx: number, base: number): void {
  const body = or(ellipse(cx - 3, base - 4, 4, 4), ellipse(cx + 3, base - 4, 4, 4), ellipse(cx, base - 4.5, 4.5, 4.5));
  p.fill(body, 'orange');
  p.fill(
    and(body, (x, y) => Math.abs(x + 0.5 - cx) % 3 < 0.6 && y > base - 8 && y < base - 1),
    'orange',
    -1,
  );
  p.fill(rect(cx - 1, base - 11, cx, base - 9), 'stem');
  p.fill(
    or(
      tri(cx - 4, base - 4, cx - 1, base - 4, cx - 2.5, base - 7),
      tri(cx + 1, base - 4, cx + 4, base - 4, cx + 2.5, base - 7),
    ),
    'gold',
  );
}

/** A small bat, wings spread. */
export function bat(p: Pix, cx: number, cy: number): void {
  p.fill(
    or(
      ellipse(cx, cy, 1.4, 1.6),
      tri(cx - 6, cy - 2, cx - 1, cy - 1, cx - 2, cy + 2),
      tri(cx + 6, cy - 2, cx + 1, cy - 1, cx + 2, cy + 2),
    ),
    'bat',
  );
}

/** A decorated Christmas tree on a trunk, standing on `base`. */
export function tree(p: Pix, cx: number, base: number): void {
  p.fill(rect(cx - 1, base - 4, cx + 1, base), 'bark');
  for (const [y, half] of [
    [base - 4, 7],
    [base - 11, 6],
    [base - 18, 4.5],
  ] as const)
    p.fill(tri(cx - half, y, cx + half, y, cx, y - 10), 'pine');
  p.fill(
    (x, y) =>
      (x * 3 + y * 5) % 11 === 0 &&
      y > base - 26 &&
      y < base - 4 &&
      tri(cx - 6, base - 5, cx + 6, base - 5, cx, base - 27)(x, y),
    'red',
  );
  p.fill(
    (x, y) =>
      (x * 5 + y * 3) % 13 === 0 &&
      y > base - 26 &&
      y < base - 4 &&
      tri(cx - 6, base - 5, cx + 6, base - 5, cx, base - 27)(x, y),
    'gold',
  );
  p.fill(
    or(
      tri(cx - 2, base - 28, cx + 2, base - 28, cx, base - 32),
      tri(cx - 2, base - 30, cx + 2, base - 30, cx, base - 26),
    ),
    'gold',
    1,
  );
}

/** A three-leaf clover on a stem. */
export function clover(p: Pix, cx: number, cy: number): void {
  p.fill(
    or(ellipse(cx - 1.4, cy, 1.4, 1.4), ellipse(cx + 1.4, cy, 1.4, 1.4), ellipse(cx, cy - 1.6, 1.4, 1.4)),
    'grass',
    1,
  );
  p.set(Math.round(cx), Math.round(cy + 2), 'grass', -1);
}

/** Pennants on a sagging string across the top, red, white and blue in turn. */
export function bunting(p: Pix, w: number, colours: string[]): void {
  const sag = (x: number): number => 4 + 4 * Math.sin((x / w) * Math.PI * (w > 64 ? 2 : 1));
  p.fill((x, y) => y === Math.round(sag(x)), 'white', -1);
  for (let x = 2, i = 0; x < w - 4; x += 7, i++) {
    const y = sag(x + 2.5);
    p.fill(tri(x, y, x + 5, y, x + 2.5, y + 5), colours[i % colours.length] as string);
  }
}
