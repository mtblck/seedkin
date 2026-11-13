import { createRng, pick, type Rng } from '../../src/core/random.js';
import { paletteFor } from '../../src/styles/noggin/palettes.js';
import { traits } from '../../src/styles/noggin/traits.js';
import { eyewear, face, headwear } from './face.js';
import { backHair, frontHair, stack } from './hair.js';
import { createPixels, type Materials, mix, outline, type Pixels, shade, toSvg } from './pixels.js';
import { scene } from './scene.js';

export type Clothes = 'tee' | 'vneck' | 'hoodie' | 'jacket' | 'turtleneck' | 'scarf';
const CLOTHES: readonly Clothes[] = ['tee', 'vneck', 'hoodie', 'jacket', 'turtleneck', 'scarf'];
const C = 16;
const FEATURES = ['eye', 'shine', 'mouth', 'tongue', 'blush', 'frame', 'lens'];

/** A drawn portrait: the character layer, its colours and the portrait's generator. */
export interface Figure {
  p: Pixels;
  colours: Materials;
  rng: Rng;
  bg: string;
}

/**
 * Draws a Noggin as a 32x32 shoulders-up portrait. Identity (skin, hair,
 * face, outfit colours) comes from the avatar's own traits, unchanged;
 * clothes and scene come from a second generator salted
 * `noggin-portrait:`, so the avatar's picture is untouched.
 */
export function figure(seed: string): Figure {
  const t = traits(seed);
  const pal = paletteFor(t.palette, t.skin, t.hairColour);
  const rng = createRng(`noggin-portrait:${seed}`);
  const clothes = pick(rng, CLOTHES);
  const hw = t.halfWidth === 3 ? 6 : 7;
  const p = createPixels(32, 32);
  const scarfed = t.headwear === 'headscarf';
  if (scarfed) stack(p, 5, [hw - 2, hw, hw + 1, ...new Array(14).fill(hw + 2), hw + 1, hw, hw - 1], 'hat');
  else backHair(p, t.hair, hw);
  if (clothes === 'hoodie') stack(p, 23, [7, 8, 8], 'cloth', 1);
  stack(p, 21, [3, 3, 3, 3], 'skin', -1);
  stack(p, 25, [7, 10, 12, 13, 14, 14, 14], 'cloth');
  neckline(p, clothes);
  // Ears, then the head over them.
  for (let y = 14; y <= 16; y++) p.mirror(C - hw - 1, y, 'skin', y === 15 ? -1 : 0);
  stack(p, 7, [hw - 3, hw - 1, ...new Array(9).fill(hw), hw - 1, hw - 1, hw - 2, hw - 3, hw - 4], 'skin');
  if (!scarfed) frontHair(p, t.hair, hw);
  face(p, t);
  eyewear(p, t);
  headwear(p, t, hw);
  if (clothes === 'turtleneck') stack(p, 22, [4, 4, 4], 'cloth', 1);
  if (clothes === 'scarf') scarf(p);
  shade(p, ['skin', 'hair', 'cloth', 'hat', 'trim'], FEATURES);
  outline(p);
  const colours: Materials = {
    skin: pal.body,
    hair: pal.shade,
    buzz: mix(pal.shade, pal.body, 0.45),
    eye: pal.glow,
    shine: '#fff8f0',
    mouth: mix(pal.glow, '#c0404a', 0.35),
    tongue: mix(pal.accent, '#e06070', 0.5),
    blush: mix(pal.body, pal.accent, 0.45),
    cloth: pal.screen,
    trim: pal.accent,
    shirt: '#eee6d8',
    hat: pal.accent,
    frame: mix(pal.accent, '#201820', 0.4),
    lens: '#18141c',
    ink: '#1c1418',
  };
  return { p, colours, rng, bg: pal.bg };
}

function neckline(p: Pixels, clothes: Clothes): void {
  if (clothes === 'tee') {
    stack(p, 25, [3, 2], 'skin', -1);
    for (const [x, y] of [
      [C - 4, 25],
      [C - 3, 26],
      [C - 2, 26],
    ])
      p.mirror(x as number, y as number, 'cloth', -1);
  } else if (clothes === 'vneck') {
    stack(p, 25, [3, 2, 1, 1], 'skin', -1);
    for (let i = 0; i < 4; i++) p.mirror(C - 4 + i, 25 + i, 'trim');
  } else if (clothes === 'hoodie') {
    stack(p, 25, [2], 'skin', -1);
    for (let y = 26; y <= 29; y++) p.mirror(C - 3, y, 'trim');
  } else if (clothes === 'jacket') {
    stack(p, 25, [3, 3, 2, 2, 2, 2, 2], 'shirt');
    for (let y = 26; y <= 31; y++) p.span(y, 1, 'trim');
    for (let y = 25; y <= 31; y++) p.mirror(C - (y < 27 ? 4 : 3), y, 'cloth', 1);
  }
}

function scarf(p: Pixels): void {
  stack(p, 22, [4, 5, 6, 6, 5], 'trim');
  for (let x = 0; x < 32; x += 2) p.set(x, 24, p.get(x, 24) === 'trim' ? 'trim' : p.get(x, 24), -1);
  for (let y = 27; y <= 31; y++) for (let x = C + 2; x < C + 5; x++) p.set(x, y, 'trim', y === 31 && x % 2 ? -1 : 0);
}

/**
 * Renders a Noggin portrait with its seeded scene.
 *
 * @param seed - Any string
 * @param scale - Pixels per cell
 */
export function portrait(seed: string, scale = 8): string {
  const f = figure(seed);
  return toSvg([scene(f.rng, f.bg), { p: f.p, colours: f.colours }], scale);
}

/**
 * Two Noggins facing each other in one 64x32 scene, the visual-novel layout.
 * The right one is flipped so they face in.
 */
export function duet(left: string, right: string, scale = 8): string {
  const a = figure(left);
  const b = figure(right);
  const back = scene(a.rng, a.bg, 64);
  const p = createPixels(64, 32);
  const colours: Materials = {};
  for (const [f, dx, flip, k] of [
    [a, -4, false, 'a'],
    [b, 36, true, 'b'],
  ] as const) {
    for (const [m, c] of Object.entries(f.colours)) colours[`${k}${m}`] = c;
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const sx = flip ? 31 - x : x;
        const m = f.p.get(sx, y);
        if (m !== '') p.set(x + dx, y, `${k}${m}`, (f.p.tone[y] as number[])[sx] as number);
      }
    }
  }
  return toSvg([back, { p, colours }], scale);
}
