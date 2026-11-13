import type { Hair } from '../../src/styles/noggin/types.js';
import type { Pixels } from './pixels.js';

/** Fills rows from `y0` down, one centred span per entry of `halves`. */
export function stack(p: Pixels, y0: number, halves: readonly number[], m: string, tone = 0): void {
  halves.forEach((h, i) => p.span(y0 + i, h, m, tone));
}

const C = 16;

/**
 * Hair that sits behind the head (and, when long, behind the shoulders).
 *
 * @param p - Portrait layer
 * @param style - The Noggin's hairstyle
 * @param hw - Head half-width in portrait cells
 */
export function backHair(p: Pixels, style: Hair, hw: number): void {
  const cap = (to: number): void => stack(p, 5, [hw - 3, hw - 1, hw, ...new Array(to - 7).fill(hw + 1)], 'hair');
  switch (style) {
    case 'short':
    case 'spiky':
    case 'sidepart':
      cap(14);
      return;
    case 'bun':
      cap(14);
      stack(p, 1, [1, 2, 2, 2, 1], 'hair');
      return;
    case 'mohawk':
      stack(p, 1, [1, 2, 2, 2, 2, 2], 'hair');
      return;
    case 'bob':
      stack(p, 5, [hw - 2, hw, hw + 1, ...new Array(13).fill(hw + 2), hw + 1], 'hair');
      return;
    case 'long':
      stack(p, 5, [hw - 2, hw, hw + 1, ...new Array(12).fill(hw + 2), ...new Array(10).fill(hw + 3)], 'hair');
      return;
    case 'curly':
      stack(p, 3, [hw - 2, hw, hw + 1, ...new Array(10).fill(hw + 2), hw + 1, hw], 'hair');
      for (let y = 5; y <= 15; y += 2) p.mirror(C - hw - 3, y, 'hair');
      for (let x = C - hw; x < C; x += 3) p.mirror(x, 2, 'hair');
      return;
    case 'afro': {
      const r = hw + 5;
      for (let y = 0; y < 21; y++) {
        for (let x = 0; x < 32; x++) {
          const d = Math.hypot(x + 0.5 - C, y + 0.5 - 10);
          if (d <= r && !(d > r - 0.9 && (x + y) % 2 === 0)) p.set(x, y, 'hair');
        }
      }
      return;
    }
    case 'locs':
      cap(10);
      for (let y = 9; y <= 27; y++) {
        p.mirror(C - hw - 2, y, 'hair', y % 3 === 0 ? -1 : 0);
        p.mirror(C - hw - 1, y, 'hair', y % 3 === 1 ? -1 : 0);
      }
      return;
    default:
      return;
  }
}

/**
 * Hair drawn over the head: fringes, partings, and strands that fall in
 * front of the shoulders.
 *
 * @param p - Portrait layer
 * @param style - The Noggin's hairstyle
 * @param hw - Head half-width in portrait cells
 */
export function frontHair(p: Pixels, style: Hair, hw: number): void {
  const fringe = (): void => {
    stack(p, 7, [hw - 3, hw - 1], 'hair');
    for (const x of [C - hw, C - hw + 1]) p.mirror(x, 9, 'hair');
  };
  switch (style) {
    case 'buzz':
      stack(p, 7, [hw - 3, hw - 1, hw], 'buzz');
      p.mirror(C - hw, 10, 'buzz');
      return;
    case 'short':
    case 'bun':
      fringe();
      p.set(C - 3, 9, 'hair');
      p.set(C - 2, 9, 'hair');
      return;
    case 'spiky':
      fringe();
      for (const x of [C - 5, C - 1, C + 3]) {
        p.set(x, 9, 'hair');
        p.set(x + 1, 9, 'hair');
      }
      for (const sx of [C - hw + 1, C - 3, C + 1, C + hw - 3]) {
        p.set(sx, 3, 'hair');
        p.set(sx, 4, 'hair');
        p.set(sx + 1, 4, 'hair');
      }
      return;
    case 'sidepart':
      fringe();
      for (let x = C - hw; x < C + 2; x++) p.set(x, 9, 'hair');
      for (let x = C - hw; x < C - 2; x++) p.set(x, 10, 'hair');
      for (let x = C - hw; x < C - 4; x++) p.set(x, 11, 'hair');
      return;
    case 'mohawk':
      stack(p, 7, [2, 2, 1], 'hair');
      for (let y = 9; y <= 13; y++) p.mirror(C - hw, y, 'buzz');
      return;
    case 'bob':
      stack(p, 7, [hw - 3, hw - 1, hw, hw], 'hair');
      for (let y = 11; y <= 20; y++) p.mirror(C - hw, y, 'hair');
      return;
    case 'long':
      stack(p, 7, [hw - 3, hw - 1], 'hair');
      for (let x = C - hw; x < C - 1; x++) p.mirror(x, 9, 'hair');
      for (let y = 10; y <= 20; y++) p.mirror(C - hw, y, 'hair');
      for (let y = 22; y <= 27; y++) for (const x of [C - hw - 1, C - hw]) p.mirror(x, y, 'hair', y === 27 ? -1 : 0);
      return;
    case 'curly':
      stack(p, 7, [hw - 3, hw - 1, hw], 'hair');
      for (let x = C - hw; x < C; x += 2) p.mirror(x, 10, 'hair');
      return;
    case 'afro':
      stack(p, 7, [hw - 3, hw - 1], 'hair');
      p.mirror(C - hw, 9, 'hair');
      return;
    case 'locs':
      stack(p, 7, [hw - 3, hw - 1], 'hair');
      for (let x = C - hw; x < C; x += 2) for (let y = 9; y <= 11; y++) p.mirror(x, y, 'hair', y === 11 ? -1 : 0);
      for (let y = 22; y <= 28; y++) p.mirror(C - hw - 1, y, 'hair', y % 3 === 0 ? -1 : 0);
      return;
    default:
      return;
  }
}
