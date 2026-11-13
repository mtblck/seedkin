import type { Rng } from '../../src/core/random.js';
import { type Colours, createPix, ellipse, type Pix } from './canvas.js';

export type Scene = 'room' | 'shelf' | 'sky' | 'plain';
const SCENES: readonly Scene[] = ['room', 'shelf', 'sky', 'plain'];

/** Wall, trim, window sky (top to bottom), a prop colour and a hill colour. */
const MOODS = [
  {
    wall: '#8a5a3a',
    trim: '#4e301e',
    sky: ['#38407a', '#6a4e98', '#e0906a', '#5a6898'],
    prop: '#efe6d2',
    hill: '#3e5a46',
  },
  {
    wall: '#4e5c7a',
    trim: '#2a3048',
    sky: ['#18203e', '#28346a', '#46589a', '#e8d088'],
    prop: '#e8c860',
    hill: '#24304a',
  },
  {
    wall: '#6e8468',
    trim: '#3a4838',
    sky: ['#78bce4', '#a4d4ee', '#e8f0e0', '#c4dc9c'],
    prop: '#e46a58',
    hill: '#4a7a4a',
  },
  {
    wall: '#a46c64',
    trim: '#5a3038',
    sky: ['#e89a6c', '#f4c28c', '#f6dcac', '#a4bccc'],
    prop: '#f4e8c8',
    hill: '#6a5a78',
  },
] as const;

/**
 * A seeded backdrop: a planked room with a window, a shelf of clocks and
 * jars, an open sky over hills, or the outfit's plain colour.
 *
 * @param rng - The portrait's own generator
 * @param bg - The outfit background, for the plain scene
 * @param w - Width in cells (64, or 128 for two characters)
 */
export function scene(rng: Rng, bg: string, w = 64): { p: Pix; colours: Colours } {
  const kind = SCENES[Math.floor(rng() * SCENES.length)] as Scene;
  const mood = MOODS[Math.floor(rng() * MOODS.length)] as (typeof MOODS)[number];
  const p = createPix(w, 64);
  const colours: Colours = {
    wall: mood.wall,
    trim: mood.trim,
    prop: mood.prop,
    hill: mood.hill,
    bg,
    glow: '#fff0c8',
    hand: '#2a1a1a',
  };
  mood.sky.forEach((c, i) => {
    colours[`sky${i}`] = c;
  });
  const band = (y: number, y0: number, step: number): string =>
    `sky${Math.max(0, Math.min(3, Math.floor((y - y0) / step)))}`;
  if (kind === 'plain') {
    p.fill(() => true, 'bg');
    p.fill((_x, y) => y >= 52, 'bg', -1);
    return { p, colours };
  }
  if (kind === 'sky') {
    p.fill(() => true, 'sky0');
    for (let y = 0; y < 64; y++) for (let x = 0; x < w; x++) p.set(x, y, band(y + ((x + y) % 2), 0, 11));
    p.fill(ellipse(w * (0.2 + rng() * 0.6), 30, 6, 6), 'glow');
    const phase = rng() * 6;
    for (const [base, amp, tone] of [
      [40, 3, 1],
      [46, 2, 0],
    ] as const) {
      p.fill((x, y) => y >= base + amp * Math.sin(x / 7 + phase + base), 'hill', tone);
    }
    return { p, colours };
  }
  p.fill(() => true, 'wall');
  p.fill((x) => x % 8 === 0, 'wall', -1);
  p.fill((x, y) => x % 8 === 3 && (y * 7 + x) % 13 < 4, 'wall', 1);
  const lamp = w * (0.25 + rng() * 0.5);
  p.fill((x, y) => ellipse(lamp, 18, 22, 22)(x, y) && x % 8 !== 0, 'wall', 1);
  p.fill((_x, y) => y <= 4, 'trim');
  p.fill((_x, y) => y === 5, 'trim', -1);
  if (kind === 'room') {
    const x0 = rng() < 0.5 ? 2 : w - 22;
    p.fill((x, y) => x >= x0 && x < x0 + 20 && y >= 10 && y < 38, 'trim');
    for (let y = 12; y < 36; y++)
      for (let x = x0 + 2; x < x0 + 18; x++) p.set(x, y, band(y + (x % 2) * (y % 2), 12, 6));
    p.fill((x, y) => (x === x0 + 9 || x === x0 + 10) && y >= 12 && y < 36, 'trim');
    p.fill((x, y) => x >= x0 + 2 && x < x0 + 18 && y === 23, 'trim');
    p.fill((x, y) => x >= x0 - 1 && x < x0 + 21 && y >= 38 && y < 40, 'trim', -1);
  } else {
    p.fill((_x, y) => y >= 42 && y <= 43, 'trim');
    p.fill((_x, y) => y === 44, 'trim', -2);
    for (let x0 = 2 + Math.floor(rng() * 4); x0 < w - 8; x0 += 9 + Math.floor(rng() * 5)) {
      const r = 3 + Math.floor(rng() * 2);
      if (rng() < 0.6) {
        const cy = 41 - r - Math.floor(rng() * 14);
        p.fill(ellipse(x0 + r, cy, r + 1, r + 1), 'trim');
        p.fill(ellipse(x0 + r, cy, r, r), 'prop');
        p.fill(
          (x, y) =>
            (x === Math.floor(x0 + r) && y >= cy - r + 1 && y < cy) ||
            (y === Math.floor(cy) && x >= x0 + r && x < x0 + r + r - 1),
          'hand',
        );
      } else {
        p.fill((x, y) => x >= x0 && x < x0 + 2 * r && y >= 42 - r * 2 && y < 42, 'prop', 0);
        p.fill((x, y) => x >= x0 + 1 && x < x0 + 2 * r - 1 && y >= 41 - r * 2 && y < 42 - r * 2, 'trim');
      }
    }
  }
  return { p, colours };
}
