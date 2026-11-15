import type { Rng } from '../random.js';
import { ellipse, type Pix, rect, tri } from './canvas.js';

/** Scenes outdoors, under the mood's sky. */
export type Outdoor = 'forest' | 'pines' | 'meadow' | 'town' | 'houses' | 'space';
/** Every outdoor scene. */
export const OUTDOORS: readonly Outdoor[] = ['forest', 'pines', 'meadow', 'town', 'houses', 'space'];

/** Colours the outdoor scenes add to the mood's: leaves, bark, petals, walls and roofs. */
export const OUTDOOR_COLOURS: Record<string, string> = {
  leaf: '#4a8a4a',
  leafFar: '#6e9e74',
  pine: '#2e5e4a',
  pineFar: '#5a8a7a',
  bark: '#6a4a3a',
  grass: '#78a858',
  petal0: '#f4e8f0',
  petal1: '#f4c84a',
  petal2: '#e8708a',
  petal3: '#a888e0',
  brick: '#b0685a',
  stone: '#9aa0b4',
  plaster: '#e8dcc4',
  roof: '#8a4a4a',
  roof2: '#4a5a7a',
  window: '#f6dc8c',
  door: '#5a3a3a',
  space0: '#0c0a24',
  space1: '#161441',
  space2: '#24195a',
  space3: '#3a2170',
  star: '#fff6dc',
  starDim: '#9aa4e0',
};

/**
 * Draws an outdoor scene over a sky already filled in: two kinds of
 * forest, a meadow of flowers, a town of tall buildings, a street of
 * houses, or deep space. Things sit mostly at the sides and the back, so the character in
 * front stays clear.
 *
 * @param p - The scene's canvas, its sky drawn
 * @param kind - Which scene
 * @param rng - The portrait's own generator
 * @param w - Width in cells
 */
export function outdoor(p: Pix, kind: Outdoor, rng: Rng, w: number): void {
  if (kind === 'space') {
    space(p, rng, w);
    return;
  }
  const phase = rng() * 6;
  const ground = (y0: number, m: string): void => p.fill((x, y) => y >= y0 + Math.round(Math.sin(x / 9 + phase)), m);
  if (kind === 'forest') {
    // A far row of round treetops, then nearer trees at the sides.
    for (let x = -4; x < w + 8; x += 7 + Math.floor(rng() * 4)) {
      p.fill(ellipse(x, 30 + rng() * 4, 6 + rng() * 2, 7), 'leafFar');
    }
    p.fill((_x, y) => y >= 34, 'leafFar', -1);
    ground(46, 'grass');
    for (let x = 2 + Math.floor(rng() * 4); x < w; x += 14 + Math.floor(rng() * 8)) {
      const top = 6 + Math.floor(rng() * 10);
      const r = 7 + rng() * 3;
      p.fill(rect(x - 1, top + r, x + 1, 50), 'bark');
      p.fill(rect(x + 1, top + r, x + 1, 50), 'bark', -1);
      p.fill(ellipse(x + r * 0.5, top + r * 0.9, r * 0.75, r * 0.6), 'leaf', -1);
      p.fill(ellipse(x - r * 0.5, top + r * 0.8, r * 0.75, r * 0.6), 'leaf', -1);
      p.fill(ellipse(x, top + r * 0.55, r * 0.9, r * 0.65), 'leaf');
      p.fill(ellipse(x - r * 0.3, top + r * 0.3, r * 0.4, r * 0.3), 'leaf', 1);
    }
    p.fill((x, y) => y >= 47 && (x * 5 + y * 3) % 11 === 0, 'grass', -1);
    return;
  }
  if (kind === 'pines') {
    // Two rows of pointed pines, paler behind.
    const pine = (cx: number, top: number, h: number, m: string): void => {
      for (let i = 0; i < 3; i++) {
        const y0 = top + i * h * 0.28;
        const half = h * (0.2 + i * 0.1);
        p.fill(tri(cx, y0, cx - half, y0 + h * 0.42, cx + half, y0 + h * 0.42), m);
      }
    };
    for (let x = -2; x < w + 6; x += 6 + Math.floor(rng() * 3)) pine(x, 16 + rng() * 6, 24, 'pineFar');
    p.fill((_x, y) => y >= 36, 'pineFar');
    ground(44, 'grass');
    for (let x = 3 + Math.floor(rng() * 3); x < w; x += 13 + Math.floor(rng() * 8)) {
      const top = 6 + Math.floor(rng() * 10);
      p.fill(rect(x - 1, top + 30, x, 50), 'bark');
      pine(x, top, 34, 'pine');
    }
    p.fill((x, y) => y >= 45 && (x * 7 + y * 5) % 13 === 0, 'grass', -1);
    return;
  }
  if (kind === 'meadow') {
    // Soft hills, then grass full of flowers, thicker toward the front.
    p.fill((x, y) => y >= 34 + 3 * Math.sin(x / 11 + phase), 'leafFar');
    ground(40, 'grass');
    for (let i = 0; i < w * 1.1; i++) {
      const x = Math.floor(rng() * w);
      const y = 42 + Math.floor(rng() ** 0.7 * 22);
      const m = `petal${Math.floor(rng() * 4)}`;
      if (y < 50) p.set(x, y, m);
      else {
        p.fill(ellipse(x + 0.5, y + 0.5, 1.4, 1.4), m);
        p.set(x, y, 'petal1', 1);
      }
    }
    return;
  }
  if (kind === 'town') {
    // A skyline of tall buildings with lit windows, and a pavement.
    const walls = ['brick', 'stone', 'plaster'];
    for (let x0 = -2 - Math.floor(rng() * 4); x0 < w; ) {
      const bw = 9 + Math.floor(rng() * 7);
      const top = 6 + Math.floor(rng() * 18);
      const m = walls[Math.floor(rng() * walls.length)] as string;
      p.fill(rect(x0, top, x0 + bw - 1, 63), m);
      p.fill(rect(x0, top, x0 + bw - 1, top), m, -1);
      p.fill(rect(x0 + bw - 1, top, x0 + bw - 1, 63), m, -1);
      for (let y = top + 3; y < 50; y += 5)
        for (let x = x0 + 2; x < x0 + bw - 3; x += 4) {
          const lit = rng() < 0.55;
          p.fill(rect(x, y, x + 1, y + 2), lit ? 'window' : m, lit ? 0 : -2);
        }
      x0 += bw + (rng() < 0.3 ? 2 : 0);
    }
    p.fill((_x, y) => y >= 52, 'stone', -1);
    p.fill((_x, y) => y === 52, 'stone', 1);
    return;
  }
  // A street of little houses with pointed roofs, a fence and a lawn.
  p.fill((x, y) => y >= 36 + 2 * Math.sin(x / 10 + phase), 'leafFar');
  for (let x0 = -3 - Math.floor(rng() * 5); x0 < w; ) {
    const hw = 14 + Math.floor(rng() * 5);
    const base = 46;
    const top = 26 + Math.floor(rng() * 6);
    const walls = ['plaster', 'brick', 'stone'][Math.floor(rng() * 3)] as string;
    const roof = rng() < 0.5 ? 'roof' : 'roof2';
    const cx = x0 + hw / 2;
    p.fill(rect(x0, top, x0 + hw - 1, base), walls);
    p.fill(tri(cx, top - 9, x0 - 2, top + 1, x0 + hw + 1, top + 1), roof);
    p.fill(tri(cx, top - 9, cx, top + 1, x0 + hw + 1, top + 1), roof, -1);
    p.fill(rect(Math.round(cx) - 1, base - 6, Math.round(cx) + 1, base), 'door');
    p.fill(rect(x0 + 2, top + 4, x0 + 4, top + 6), 'window');
    p.fill(rect(x0 + hw - 5, top + 4, x0 + hw - 3, top + 6), 'window');
    x0 += hw + 3 + Math.floor(rng() * 4);
  }
  ground(47, 'grass');
  p.fill((x, y) => y >= 43 && y <= 48 && (x % 4 === 0 || y === 44 || y === 47), 'plaster', -1);
  p.fill((x, y) => y >= 49 && (x * 5 + y * 3) % 11 === 0, 'grass', -1);
}

/** Deep space: dark blue fading down to purple, dithered between bands, full of stars. */
function space(p: Pix, rng: Rng, w: number): void {
  for (let y = 0; y < 64; y++)
    for (let x = 0; x < w; x++)
      p.set(x, y, `space${Math.max(0, Math.min(3, Math.floor((y + ((x + y) % 2) * 2) / 16)))}`);
  // Faint far stars, a few bright ones, and some that shine with a cross.
  for (let i = 0; i < w * 0.7; i++) p.set(Math.floor(rng() * w), Math.floor(rng() * 64), 'starDim');
  for (let i = 0; i < w * 0.2; i++) p.set(Math.floor(rng() * w), Math.floor(rng() * 64), 'star');
  for (let i = 0; i < w / 16; i++) {
    const [x, y] = [Math.floor(rng() * w), 2 + Math.floor(rng() * 56)];
    p.fill((cx, cy) => (cx === x && Math.abs(cy - y) <= 2) || (cy === y && Math.abs(cx - x) <= 2), 'starDim');
    p.set(x, y, 'star');
  }
}
