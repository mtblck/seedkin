/**
 * seedkin/noggin/portrait: the Noggins as 64x64 game-style portraits, the
 * same Noggin a seed draws as an avatar, drawn fuller in a seeded scene.
 * A Preview: a seed's portrait may change in a minor release (ADR 0018).
 *
 * @packageDocumentation
 */
import { type Colours, createPix, ink, mix, shadeRuns } from '../../../core/portrait/canvas.js';
import { duetOf, type Figure, portraitOf } from '../../../core/portrait/compose.js';
import { motion } from '../../../core/portrait/motion.js';
import type { PortraitOptions } from '../../../core/portrait/options.js';

export type { PortraitOptions } from '../../../core/portrait/options.js';
export type { Holiday } from '../../../core/types.js';

import { HOME_SCENES } from '../../../core/portrait/scene.js';
import { createRng, pick } from '../../../core/random.js';
import type { Holiday } from '../../../core/types.js';
import { HOLIDAY_PALETTES } from '../holidays.js';
import { paletteFor } from '../palettes.js';
import { traits } from '../traits.js';
import { body, CLOTHES, collar } from './clothes.js';
import { eyewear, FEATURES, face, headwear, scarfBack } from './face.js';
import { backHair, frontHair, head } from './hair.js';

/**
 * Draws a Noggin as a 64x64 shoulders-up portrait. Who they are (skin,
 * hair, face, outfit colours) comes from the avatar's traits, unchanged;
 * clothes and scene come from a second generator salted
 * `noggin-portrait:`, so no avatar changes.
 */
function figure(seed: string, holiday?: Holiday): Figure {
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
 * Draws the seed's Noggin as a 64x64 portrait in a seeded scene: the
 * same Noggin as its avatar, drawn fuller. Preview: the picture may still
 * change in a minor release.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Size, motion, holiday and title
 * @returns A standalone SVG document
 */
export function portrait(seed: string, opts: PortraitOptions = {}): string {
  return portraitOf('noggin', 'Person portrait', figure, seed, opts);
}

/**
 * The seed's portrait as a `data:` URI, for an `<img src>` or CSS `url()`.
 * Preview, as {@link portrait}.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Size, motion, holiday and title
 * @returns A `data:image/svg+xml` URI
 */
export function portraitDataUri(seed: string, opts: PortraitOptions = {}): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(portrait(seed, opts))}`;
}

/**
 * Draws two seeds' Noggins facing each other in one 128x64 scene, the left
 * one's. Preview, as {@link portrait}.
 *
 * @param left - The seed on the left
 * @param right - The seed on the right, turned to face the left
 * @param opts - Size (the height; the width is twice it), motion, holiday and title
 * @returns A standalone SVG document
 */
export function duet(left: string, right: string, opts: PortraitOptions = {}): string {
  return duetOf('noggin', 'Person portraits', figure, left, right, opts);
}
