import {
  type Colours,
  createPix,
  ellipse,
  ink,
  or,
  type Pix,
  rounded,
  shadeRuns,
  tri,
} from '../../../core/portrait/canvas.js';
import { duetOf, type Figure, portraitOf } from '../../../core/portrait/compose.js';
import { motion, tag } from '../../../core/portrait/motion.js';
import type { PortraitOptions } from '../../../core/portrait/options.js';
import type { Scene } from '../../../core/portrait/scene.js';
import { createRng, pick } from '../../../core/random.js';
import type { Holiday } from '../../../core/types.js';
import { HOLIDAY_PALETTES } from '../holidays.js';
import { PALETTES } from '../palettes.js';
import { traits } from '../traits.js';
import type { Palette } from '../types.js';
import { type Beast, drawBody, feet, layout, limbs, spots, topPiece } from './body.js';
import { eyes, mouth } from './face.js';

export type Gear = 'bare' | 'bowtie' | 'bandana';
const GEAR: readonly Gear[] = ['bare', 'bare', 'bowtie', 'bandana'];
const FABRICS = ['#c84a4a', '#3a6ab0', '#e0a526', '#4f9a4a', '#7c5cd6', '#2bb3a3', '#e07aa0'];
const SCENES: readonly Scene[] = ['room', 'shelf', 'sky', 'sky', 'plain'];
/** Too small or already dark to ink: eyes, glints, mouth and tongue. */
const FEATURES = ['white', 'pupil', 'shine', 'mouth', 'tongue'];

/**
 * Draws a Beastie as a 64x64 portrait of the whole monster: the avatar's
 * body, eyes, mouth, top, spots and hide, with arms on every one (raised when
 * the avatar has arms) and wings behind when it has wings. What it wears and
 * where it stands come from a second generator salted `beastie-portrait:`,
 * so no avatar changes.
 */
export function figure(seed: string, holiday?: Holiday): Figure {
  const t = traits(seed);
  const pal = holiday ? HOLIDAY_PALETTES[holiday] : (PALETTES[t.palette] as Palette);
  const rng = createRng(`beastie-portrait:${seed}`);
  const gear = pick(rng, GEAR);
  const fabric = pick(rng, FABRICS);
  const b = layout(t);
  const p = createPix();
  limbs(p, t, b, false);
  tag(p, 'top', () => topPiece(p, t, b));
  feet(p, t, b);
  drawBody(p, b);
  if (t.hasSpots) spots(p, b);
  tag(p, 'eyes', () => eyes(p, t, b));
  tag(p, 'mouth', () => mouth(p, t, b));
  wear(p, gear, b);
  shadeRuns(p, ['body', 'shade', 'accent', 'fabric'], 0.22, 0.2);
  ink(p, FEATURES);
  const colours: Colours = {
    body: pal.body,
    shade: pal.shade,
    accent: pal.accent,
    white: pal.glow,
    pupil: pal.screen,
    mouth: pal.screen,
    tongue: pal.accent,
    shine: '#ffffff',
    fabric,
    ink: '#1a1018',
  };
  const moves = motion(
    `beastie:${seed}`,
    {
      eyes: ['blink', 'center'],
      mouth: ['talk', 'center'],
      top: ['wobble', '50% 100%'],
      arms: ['twitch', 'center'],
      wings: ['flap', 'center'],
    },
    // A ghost floats, as the avatar hovers.
    t.body === 'ghost' ? 'hover' : undefined,
  );
  return { p, colours, rng, bg: pal.bg, scenes: holiday ? [holiday] : SCENES, motion: moves, behind: ['wings'] };
}

/** A bow tie or a bandana, just under the mouth. */
function wear(p: Pix, gear: Gear, b: Beast): void {
  const y = Math.min(b.top + 8.4 * b.s, b.bottom - 6);
  if (gear === 'bowtie') {
    p.fill(
      or(tri(b.cx, y, b.cx - 6, y - 3.5, b.cx - 6, y + 3.5), tri(b.cx, y, b.cx + 6, y - 3.5, b.cx + 6, y + 3.5)),
      'fabric',
    );
    p.fill(ellipse(b.cx, y, 1.8, 1.8), 'fabric', -1);
  } else if (gear === 'bandana') {
    p.over(rounded(b.cx, y - 1, b.hx, 1.6, 1), 'fabric', ['body', 'shade', 'accent']);
    p.fill(tri(b.cx - 8, y - 1, b.cx + 8, y - 1, b.cx, y + 8), 'fabric');
  }
}

/**
 * Draws the seed's Beastie as a 64x64 portrait in a seeded scene: the
 * same Beastie as its avatar, drawn fuller. Preview: the picture may still
 * change in a minor release.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Size, motion, holiday and title
 * @returns A standalone SVG document
 */
export function portrait(seed: string, opts: PortraitOptions = {}): string {
  return portraitOf('beastie', 'Monster portrait', figure, seed, opts);
}

/**
 * Draws two seeds' Beasties facing each other in one 128x64 scene, the left
 * one's. Preview, as {@link portrait}.
 *
 * @param left - The seed on the left
 * @param right - The seed on the right, turned to face the left
 * @param opts - Size (the height; the width is twice it), motion, holiday and title
 * @returns A standalone SVG document
 */
export function duet(left: string, right: string, opts: PortraitOptions = {}): string {
  return duetOf('beastie', 'Monster portraits', figure, left, right, opts);
}
