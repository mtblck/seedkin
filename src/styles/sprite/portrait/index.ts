/**
 * seedkin/sprite/portrait: the Sprites as 64x64 game-style portraits, the
 * same Sprite a seed draws as an avatar, drawn fuller in a seeded scene.
 * A Preview: a seed's portrait may change in a minor release (ADR 0018).
 *
 * @packageDocumentation
 */
import { type Colours, mix } from '../../../core/portrait/canvas.js';
import { duetOf, type Figure, portraitOf } from '../../../core/portrait/compose.js';
import { motion } from '../../../core/portrait/motion.js';
import { only, type PortraitOptions } from '../../../core/portrait/options.js';

export type { PortraitOptions } from '../../../core/portrait/options.js';
export type { Holiday } from '../../../core/types.js';
export type { Element } from '../types.js';

import { OUTDOORS, type Scene } from '../../../core/portrait/scene.js';
import { createRng } from '../../../core/random.js';
import type { Holiday } from '../../../core/types.js';
import type { Form } from '../grid/draw.js';
import { EARTH } from '../grid/earth.js';
import { FIRE } from '../grid/fire.js';
import { SPACE } from '../grid/space.js';
import { WATER } from '../grid/water.js';
import { WIND } from '../grid/wind.js';
import { HOLIDAY_PALETTES } from '../holidays.js';
import { PALETTES } from '../palettes.js';
import { resolveTraits } from '../svg.js';
import type { Element, Palette, SpriteTraits } from '../types.js';
import { draw, type Frame, STILL, WATERY } from './draw.js';

/** A Sprite portrait's options: the shared ones, and the avatar's `element`. */
export interface SpritePortraitOptions extends PortraitOptions {
  /** Draw the seed's Sprite of this element, as the avatar's `element` option. */
  element?: Element;
}

const FORMS: Record<string, Form> = { ...FIRE, ...WATER, ...EARTH, ...WIND, ...SPACE };
/** Forms that move as a whole. */
const WHOLE: Record<string, 'squash' | 'hover'> = { bubble: 'squash', planet: 'hover' };
const SCENES: readonly Scene[] = ['sky', 'sky', 'room', 'shelf', 'plain', ...OUTDOORS];

/** Frame `n` of the seed's form, before its face, flipped when the Sprite is mirrored. */
function frame(t: SpriteTraits, n: number): Frame {
  const { c, at } = (FORMS[t.form] as Form).full(n);
  if (!t.isMirrored) return { g: c.cells, at };
  return { g: c.cells.map((row) => [...row].reverse()), at: { ...at, x: c.cells.length - 1 - at.x } };
}

/**
 * Draws a Sprite as a 64x64 portrait: its avatar's form traced smooth at
 * the larger size (the outline, the shade tongues and cracks, the bright
 * core, the accent spots), its motes as twinkles around it, and its face
 * redrawn. Everything comes from the avatar's traits and its frames; the
 * scene comes from a second generator salted `sprite-portrait:`.
 */
function figure(seed: string, holiday: Holiday | undefined, animate: boolean, o: SpritePortraitOptions): Figure {
  const t = resolveTraits(seed, only(o, ['palette', 'element']));
  const pal = holiday ? HOLIDAY_PALETTES[holiday] : (PALETTES[t.palette] as Palette);
  const rng = createRng(`sprite-portrait:${seed}`);
  const all = [0, 1, 2, 3].map((n) => frame(t, n));
  // A boulder and a crystal hold still; the others sway through the avatar's four frames on its beats.
  const sways = animate && !STILL.includes(t.form);
  const [first, ...rest] = (sways ? all : all.slice(0, 1)).map((fr, n) => draw(t, fr, all, n));
  const colours: Colours = {
    body: pal.body,
    shade: pal.shade,
    patch: pal.shade,
    tentacle: pal.shade,
    pebble: pal.shade,
    facet: mix(pal.body, pal.shade, 0.55),
    sprout: pal.accent,
    screen: pal.screen,
    accent: pal.accent,
    face: pal.glow,
    shine: '#ffffff',
    blush: pal.accent,
    mote: pal.accent,
    mark: pal.accent,
    flare: mix(pal.accent, '#ffffff', 0.55),
    haze: pal.shade,
    // Bubbles in the avatar's own colour for its loose drops.
    bubble: pal.accent,
    bubblein: `${pal.accent}55`,
    spark: pal.screen,
    leaf: pal.accent,
    ink: '#1a1018',
  };
  const moves = motion(
    `sprite:${seed}`,
    {
      eyes: ['blink', 'center'],
      motes: [WATERY.includes(t.form) ? 'drift' : 'twinkle', 'center'],
      rocks: ['drift', 'center'],
      sprout: ['wobble', '50% 100%'],
      sparkles: ['twinkle', 'center'],
      sparkles2: ['twinkle', 'center'],
      ember0: ['rise', 'center'],
      ember1: ['rise', 'center'],
      ember2: ['rise', 'center'],
      crown: ['sway', '50% 100%'],
      leaves: ['fall', 'center'],
    },
    // A bubble squashes; a planet hovers, as it has no other move of its own.
    animate ? WHOLE[t.form] : undefined,
  );
  return {
    p: first as Figure['p'],
    colours,
    rng,
    bg: pal.bg,
    scenes: holiday ? [holiday] : SCENES,
    motion: moves,
    ...(sways ? { frames: { ps: rest, beats: t.beats } } : {}),
  };
}

/**
 * Draws the seed's Sprite as a 64x64 portrait in a seeded scene: the
 * same Sprite as its avatar, drawn fuller. Preview: the picture may still
 * change in a minor release.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Size, motion, holiday, title, palette and element
 * @returns A standalone SVG document
 */
export function portrait(seed: string, opts: SpritePortraitOptions = {}): string {
  return portraitOf('sprite', 'Sprite portrait', figure, seed, opts);
}

/**
 * The seed's portrait as a `data:` URI, for an `<img src>` or CSS `url()`.
 * Preview, as {@link portrait}.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Size, motion, holiday, title, palette and element
 * @returns A `data:image/svg+xml` URI
 */
export function portraitDataUri(seed: string, opts: SpritePortraitOptions = {}): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(portrait(seed, opts))}`;
}

/**
 * Draws two seeds' Sprites facing each other in one 128x64 scene, the left
 * one's. Preview, as {@link portrait}.
 *
 * @param left - The seed on the left
 * @param right - The seed on the right, turned to face the left
 * @param opts - Size (the height; the width is twice it), motion, holiday, title, palette and element, for both
 * @returns A standalone SVG document
 */
export function duet(left: string, right: string, opts: SpritePortraitOptions = {}): string {
  return duetOf('sprite', 'Sprite portraits', figure, left, right, opts);
}
