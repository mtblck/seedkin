import type { Rng } from '../../src/core/random.js';
import { createPixels, type Materials, type Pixels } from './pixels.js';

export type Scene = 'room' | 'shelf' | 'sky' | 'plain';
export const SCENES: readonly Scene[] = ['room', 'shelf', 'sky', 'plain'];

/** Scene moods: wall, trim, window sky (top to bottom) and a prop colour. */
const MOODS = [
  { wall: '#8a5a3a', trim: '#4a2e1d', sky: ['#38407a', '#7a5aa8', '#e89a6a', '#6878a8'], prop: '#efe6d2' },
  { wall: '#4a5a78', trim: '#2a3048', sky: ['#1a2040', '#2a3466', '#4a5a9a', '#f0d890'], prop: '#e8c860' },
  { wall: '#6e8a6a', trim: '#3a4a38', sky: ['#7ac0e8', '#a8d8f0', '#f0f4e8', '#c8e0a0'], prop: '#e86a5a' },
  { wall: '#a86a6a', trim: '#5a3038', sky: ['#f0a070', '#f8c890', '#f8e0b0', '#a8c0d0'], prop: '#f4e8c8' },
] as const;

/**
 * Draws a seeded backdrop behind a portrait.
 *
 * @param rng - The portrait's own generator
 * @param bg - The outfit background, used by the plain scene
 * @param w - Width in cells
 */
export function scene(rng: Rng, bg: string, w = 32): { p: Pixels; colours: Materials } {
  const kind = SCENES[Math.floor(rng() * SCENES.length)] as Scene;
  const mood = MOODS[Math.floor(rng() * MOODS.length)] as (typeof MOODS)[number];
  const p = createPixels(w, 32);
  const colours: Materials = { wall: mood.wall, trim: mood.trim, prop: mood.prop, bg };
  mood.sky.forEach((c, i) => (colours[`sky${i}`] = c));
  colours.hill = '#4a7a4a';
  const fill = (m: string): void => {
    for (let y = 0; y < 32; y++) for (let x = 0; x < w; x++) p.set(x, y, m);
  };
  if (kind === 'plain') {
    fill('bg');
    for (let y = 26; y < 32; y++) for (let x = 0; x < w; x++) p.set(x, y, 'bg', -1);
    return { p, colours };
  }
  if (kind === 'sky') {
    for (let y = 0; y < 32; y++) for (let x = 0; x < w; x++) p.set(x, y, `sky${Math.min(3, Math.floor(y / 6))}`);
    for (let x = 0; x < w; x++) {
      const top = 20 + Math.round(2 * Math.sin(x / 3.5 + rng() * 0.4));
      for (let y = top; y < 32; y++) p.set(x, y, 'hill', y === top ? 1 : y > 26 ? -1 : 0);
    }
    return { p, colours };
  }
  fill('wall');
  for (let y = 0; y < 32; y++) for (let x = 0; x < w; x += 4) p.set(x, y, 'wall', -1);
  for (let x = 0; x < w; x++) for (const y of [0, 1]) p.set(x, y, 'trim');
  if (kind === 'room') {
    const side = rng() < 0.5 ? 1 : w - 10;
    for (let y = 4; y <= 17; y++) {
      for (let x = side; x < side + 9; x++) {
        const edge = y === 4 || y === 17 || x === side || x === side + 8 || x === side + 4 || y === 10;
        p.set(x, y, edge ? 'trim' : `sky${Math.min(3, Math.floor((y - 5) / 3))}`);
      }
    }
  } else {
    for (let x = 0; x < w; x++) p.set(x, 17, 'trim');
    for (let x = 0; x < w; x++) p.set(x, 18, 'trim', -1);
    for (const x0 of [1, 5, w - 9, w - 4]) {
      const h = 2 + Math.floor(rng() * 3);
      for (let y = 17 - h; y < 17; y++) for (let x = x0; x < x0 + 3; x++) p.set(x, y, 'prop', x === x0 ? 1 : 0);
    }
  }
  return { p, colours };
}
