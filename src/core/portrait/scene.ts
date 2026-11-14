import type { Rng } from '../random.js';
import type { Holiday } from '../types.js';
import { type Colours, createPix, ellipse, or, type Pix } from './canvas.js';
import { HOLIDAY_COLOURS, holidayScene } from './holiday.js';
import { workshop } from './workshop.js';

export type Scene = 'room' | 'shelf' | 'sky' | 'plain' | 'workshop' | Holiday;
/** The scenes a person stands in. */
export const HOME_SCENES: readonly Scene[] = ['room', 'shelf', 'sky', 'plain'];

/** Every holiday, each with a scene of its own. */
export const HOLIDAYS: readonly Holiday[] = [
  'newYear',
  'valentines',
  'stPatricks',
  'fourthOfJuly',
  'halloween',
  'christmas',
];

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
 * @param kinds - The scenes to pick from
 */
export function scene(
  rng: Rng,
  bg: string,
  w = 64,
  kinds: readonly Scene[] = HOME_SCENES,
): { p: Pix; colours: Colours } {
  const kind = kinds[Math.floor(rng() * kinds.length)] as Scene;
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
  if (HOLIDAYS.includes(kind as Holiday)) {
    holidayScene(p, kind as Holiday, rng, w);
    return { p, colours: { ...colours, ...HOLIDAY_COLOURS } };
  }
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
  if (kind === 'workshop') {
    workshop(p, rng, w);
    return { p, colours };
  }
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
    // One clock on the wall: beside the character, or between two of them.
    const left = rng() < 0.5;
    const cx = w > 64 ? w / 2 : left ? 10 : 54;
    p.fill(ellipse(cx, 19, 6, 6), 'trim');
    p.fill(ellipse(cx, 19, 5, 5), 'prop');
    p.fill(
      (x, y) => (x === Math.floor(cx) - 1 && y >= 15 && y < 19) || (y === 18 && x >= cx - 1 && x < cx + 3),
      'hand',
    );
    // Books, jars and a plant along the shelf.
    const spines = ['hill', 'sky1', 'sky2', 'trim', 'prop'];
    for (let x0 = 1 + Math.floor(rng() * 3); x0 < w - 6; ) {
      const kind = rng();
      if (kind < 0.5) {
        const n = 3 + Math.floor(rng() * 3);
        for (let i = 0; i < n; i++) {
          const h = 6 + Math.floor(rng() * 4);
          const m = spines[Math.floor(rng() * spines.length)] as string;
          p.fill((x, y) => x >= x0 + i * 2 && x < x0 + i * 2 + 2 && y >= 42 - h && y < 42, m, i % 2 ? -1 : 0);
        }
        x0 += n * 2 + 3 + Math.floor(rng() * 4);
      } else if (kind < 0.8) {
        p.fill((x, y) => x >= x0 && x < x0 + 5 && y >= 36 && y < 42, 'prop', 0);
        p.fill((x, y) => x >= x0 + 1 && x < x0 + 4 && y === 35, 'trim');
        x0 += 8 + Math.floor(rng() * 4);
      } else {
        p.fill((x, y) => x >= x0 && x < x0 + 5 && y >= 38 && y < 42, 'trim', 1);
        p.fill(
          or(ellipse(x0 + 2.5, 35, 3.5, 3), ellipse(x0 + 1, 32, 1.6, 2.5), ellipse(x0 + 4, 32, 1.6, 2.5)),
          'hill',
          1,
        );
        x0 += 9 + Math.floor(rng() * 4);
      }
    }
  }
  return { p, colours };
}
