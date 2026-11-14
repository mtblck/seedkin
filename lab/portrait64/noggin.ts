import { createRng, pick } from '../../src/core/random.js';
import type { Holiday } from '../../src/core/types.js';
import { HOLIDAY_PALETTES } from '../../src/styles/noggin/holidays.js';
import { paletteFor } from '../../src/styles/noggin/palettes.js';
import { traits } from '../../src/styles/noggin/traits.js';
import { type Colours, createPix, ink, mix, shadeRuns } from './canvas.js';
import { body, CLOTHES, collar } from './clothes.js';
import { type Figure, pair, single } from './compose.js';
import { eyewear, FEATURES, face, headwear, scarfBack } from './face.js';
import { backHair, frontHair, head } from './hair.js';
import { motion } from './motion.js';
import { HOME_SCENES } from './scene.js';

/**
 * Draws a Noggin as a 64x64 shoulders-up portrait. Who they are (skin,
 * hair, face, outfit colours) comes from the avatar's traits, unchanged;
 * clothes and scene come from a second generator salted
 * `noggin-portrait:`, so no avatar changes.
 */
export function figure(seed: string, holiday?: Holiday): Figure {
  const t = traits(seed);
  // A holiday outfit is worn with the seed's own skin and hair, as on the avatar.
  const base = paletteFor(t.palette, t.skin, t.hairColour);
  const pal = holiday ? { ...base, ...HOLIDAY_PALETTES[holiday] } : base;
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
  const moves = motion(`noggin:${seed}`, { eyes: ['blink', 'center'], mouth: ['talk', 'center'] });
  return { p, colours, rng, bg: pal.bg, scenes: holiday ? [holiday] : HOME_SCENES, motion: moves };
}

/**
 * A Noggin portrait in its seeded scene, as SVG.
 *
 * @param seed - Any string
 * @param px - Pixels per cell
 * @param animate - Blink and talk as the avatar does
 */
export function portrait(seed: string, px = 4, animate = false, holiday?: Holiday): string {
  return single(figure(seed, holiday), px, animate);
}

/** Two Noggins facing each other in one 128x64 scene. */
export function duet(left: string, right: string, px = 4, animate = false, holiday?: Holiday): string {
  return pair(figure(left, holiday), figure(right, holiday), px, animate);
}
