/**
 * seedkin/botling/portrait: the Botlings as 64x64 game-style portraits, the
 * same Botling a seed draws as an avatar, drawn fuller in a seeded scene.
 * A Preview: a seed's portrait may change in a minor release (ADR 0018).
 *
 * @packageDocumentation
 */
import { type Colours, createPix, ink, mix, shadeRuns } from '../../../core/portrait/canvas.js';
import { duetOf, type Figure, portraitOf } from '../../../core/portrait/compose.js';
import { motion, tag } from '../../../core/portrait/motion.js';
import type { PortraitOptions } from '../../../core/portrait/options.js';

export type { PortraitOptions } from '../../../core/portrait/options.js';
export type { Holiday } from '../../../core/types.js';

import type { Scene } from '../../../core/portrait/scene.js';
import { createRng, pick } from '../../../core/random.js';
import type { Holiday } from '../../../core/types.js';
import { slots } from '../grid/slots.js';
import { HOLIDAY_PALETTES } from '../holidays.js';
import { PALETTES } from '../palettes.js';
import { traits } from '../traits.js';
import type { Palette } from '../types.js';
import { body, type Gear } from './body.js';
import { drawAccessory, drawQuirk, drawSides, drawTop } from './extras.js';
import { drawFace } from './face.js';
import { drawHead, layout } from './head.js';

const GEAR: readonly Gear[] = ['bare', 'scarf', 'bowtie', 'hoodie', 'straps'];
const FABRICS = ['#c84a4a', '#3a6ab0', '#e0a526', '#4f9a4a', '#7c5cd6', '#2bb3a3', '#e07aa0'];
const SCENES: readonly Scene[] = ['workshop', 'workshop', 'room', 'sky', 'plain'];
const _CX = 32;

/**
 * Draws a Botling as a 64x64 shoulders-up portrait. The head, face, top,
 * sides and colours come from the avatar's own traits, unchanged; what it
 * wears and where it stands come from a second generator salted
 * `botling-portrait:`, so no avatar changes.
 */
function figure(seed: string, holiday?: Holiday): Figure {
  const t = traits(seed);
  const pal = holiday ? HOLIDAY_PALETTES[holiday] : (PALETTES[t.palette] as Palette);
  const rng = createRng(`botling-portrait:${seed}`);
  const gear = pick(rng, GEAR);
  const fabric = pick(rng, FABRICS);
  const b = layout(t);
  const s = slots(t);
  const p = createPix();
  // Two in three horned robots get the avatar's ball-tipped stalks; a side generator keeps the rest of the draws put.
  const tips = createRng(`botling-portrait:${seed}:horns`)() < 0.67;
  if (s.hasTop) tag(p, 'top', () => drawTop(p, t, b, tips));
  if (s.hasSides) tag(p, 'sides', () => drawSides(p, t.sides, b));
  if (s.hasQuirk) drawQuirk(p, t, b, false);
  body(p, gear, t.hasChestLight, b.bottom);
  drawHead(p, t, b);
  drawFace(p, t, b);
  if (s.hasQuirk) drawQuirk(p, t, b, true);
  drawAccessory(p, t, b);
  shadeRuns(p, ['body', 'shade', 'fabric', 'accent'], 0.22, 0.2);
  ink(p, ['glow', 'cheek', 'rivet', 'light']);
  // As the avatar, sleepy eyes are already shut and don't blink.
  const moves = motion(seed, {
    ...(t.eyes === 'sleepy' ? {} : { eyes: ['blink', 'center'] as const }),
    mouth: ['talk', 'center'],
    top: ['wobble', '50% 100%'],
    sides: ['twitch', 'center'],
  });
  return { p, colours: colours(pal, fabric), rng, bg: pal.bg, scenes: holiday ? [holiday] : SCENES, motion: moves };
}

function colours(pal: Palette, fabric: string): Colours {
  return {
    body: pal.body,
    shade: pal.shade,
    screen: pal.screen,
    glow: pal.glow,
    accent: pal.accent,
    fabric,
    panel: mix(pal.body, pal.screen, 0.35),
    visor: mix(pal.glow, pal.screen, 0.6),
    cheek: mix(pal.accent, pal.screen, 0.2),
    rivet: mix(pal.shade, '#000000', 0.35),
    light: mix(pal.accent, '#ffffff', 0.45),
    ink: '#120e18',
  };
}

/**
 * Draws the seed's Botling as a 64x64 portrait in a seeded scene: the
 * same Botling as its avatar, drawn fuller. Preview: the picture may still
 * change in a minor release.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Size, motion, holiday and title
 * @returns A standalone SVG document
 */
export function portrait(seed: string, opts: PortraitOptions = {}): string {
  return portraitOf('botling', 'Robot portrait', figure, seed, opts);
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
 * Draws two seeds' Botlings facing each other in one 128x64 scene, the left
 * one's. Preview, as {@link portrait}.
 *
 * @param left - The seed on the left
 * @param right - The seed on the right, turned to face the left
 * @param opts - Size (the height; the width is twice it), motion, holiday and title
 * @returns A standalone SVG document
 */
export function duet(left: string, right: string, opts: PortraitOptions = {}): string {
  return duetOf('botling', 'Robot portraits', figure, left, right, opts);
}
