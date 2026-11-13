import { createRng, pick, type Rng } from '../../src/core/random.js';
import { paletteFor } from '../../src/styles/noggin/palettes.js';
import { traits } from '../../src/styles/noggin/traits.js';
import { type Colours, createPix, ink, mix, type Pix, shadeRuns } from './canvas.js';
import { body, CLOTHES, collar } from './clothes.js';
import { eyewear, FEATURES, face, headwear, scarfBack } from './face.js';
import { backHair, frontHair, head } from './hair.js';
import { scene } from './scene.js';
import { toSvg } from './svg.js';

/** A drawn character: its canvas, colours, the portrait's generator and outfit background. */
export interface Figure {
  p: Pix;
  colours: Colours;
  rng: Rng;
  bg: string;
}

/**
 * Draws a Noggin as a 64x64 shoulders-up portrait. Who they are (skin,
 * hair, face, outfit colours) comes from the avatar's traits, unchanged;
 * clothes and scene come from a second generator salted
 * `noggin-portrait:`, so no avatar changes.
 */
export function figure(seed: string): Figure {
  const t = traits(seed);
  const pal = paletteFor(t.palette, t.skin, t.hairColour);
  const rng = createRng(`noggin-portrait:${seed}`);
  const clothes = pick(rng, CLOTHES);
  const h = head(t.halfWidth === 3 ? 12.5 : 14);
  const p = createPix();
  const scarfed = t.headwear === 'headscarf';
  if (scarfed) scarfBack(p, h);
  else backHair(p, t.hair, h);
  body(p, clothes);
  collar(p, clothes);
  p.fill(
    (x, y) =>
      Math.hypot((x + 0.5 - (h.cx - h.rx)) / 2.2, (y + 0.5 - 31) / 3.4) <= 1 ||
      Math.hypot((x + 0.5 - (h.cx + h.rx)) / 2.2, (y + 0.5 - 31) / 3.4) <= 1,
    'skin',
  );
  p.fill(h.shape, 'skin');
  if (!scarfed) frontHair(p, t.hair, h);
  headwear(p, t, h);
  face(p, t, h);
  eyewear(p, t, h);
  shadeRuns(p, ['skin'], 0.26, 0);
  shadeRuns(p, ['hair', 'hat', 'cloth', 'trim', 'apron', 'shirt']);
  ink(p, [...FEATURES, 'gold']);
  const colours: Colours = {
    skin: pal.body,
    hair: pal.shade,
    buzz: mix(pal.shade, pal.body, 0.45),
    eye: pal.glow,
    brow: mix(pal.shade, '#000000', 0.25),
    shine: '#fff8f0',
    mouth: mix(pal.glow, '#a03040', 0.4),
    tooth: '#fff8f0',
    tongue: '#e06878',
    blush: mix(pal.body, '#f06a8a', 0.4),
    cloth: pal.screen,
    trim: pal.accent,
    shirt: '#ece4d4',
    apron: mix(pal.screen, '#3a2a20', 0.55),
    hat: pal.accent,
    gold: '#f0c850',
    frame: mix(pal.accent, '#201820', 0.45),
    lens: '#18141c',
    ink: '#1a1018',
  };
  return { p, colours, rng, bg: pal.bg };
}

/**
 * A Noggin portrait in its seeded scene, as SVG.
 *
 * @param seed - Any string
 * @param px - Pixels per cell
 */
export function portrait(seed: string, px = 4): string {
  const f = figure(seed);
  return toSvg([scene(f.rng, f.bg), { p: f.p, colours: f.colours }], px);
}

/** Two Noggins facing each other in one 128x64 scene; the right one is flipped. */
export function duet(left: string, right: string, px = 4): string {
  const a = figure(left);
  const b = figure(right);
  const back = scene(a.rng, a.bg, 128);
  const p = createPix(128, 64);
  const colours: Colours = {};
  for (const [f, dx, flip, k] of [
    [a, 2, false, 'a'],
    [b, 62, true, 'b'],
  ] as const) {
    for (const [m, c] of Object.entries(f.colours)) colours[`${k}${m}`] = c;
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const sx = flip ? 63 - x : x;
        const m = f.p.get(sx, y);
        if (m !== '') p.set(x + dx, y, `${k}${m}`, (f.p.tone[y] as number[])[sx] as number);
      }
    }
  }
  return toSvg([back, { p, colours }], px);
}
