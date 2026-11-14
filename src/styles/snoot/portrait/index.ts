import {
  and,
  type Colours,
  createPix,
  ellipse,
  ink,
  mix,
  not,
  or,
  type Pix,
  rect,
  shadeRuns,
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
import { body, neckY, openShoulders } from './body.js';
import { extra, face, markings } from './face.js';
import { dogEars, drawHead, ears, layout } from './head.js';

export type Gear = 'bare' | 'scarf' | 'bandana' | 'collar';
const GEAR: readonly Gear[] = ['bare', 'scarf', 'bandana', 'collar'];
const FABRICS = ['#c84a4a', '#3a6ab0', '#e0a526', '#4f9a4a', '#7c5cd6', '#2bb3a3', '#e07aa0'];
const SCENES: readonly Scene[] = ['sky', 'sky', 'room', 'shelf', 'plain'];
const CX = 32;
/** Drawn as lines already, or too small to ink: eyes and their whites, cheeks, whiskers. */
const FEATURES = ['glow', 'shine', 'cheek', 'whisker', 'tongue', 'white'];

/**
 * Draws a Snoot as a 64x64 portrait of the whole animal, sitting: four-legged
 * kinds on their haunches, an owl with its wings folded, a frog squatting. Species, coat, eyes,
 * markings, mouth and extra come from the avatar's traits, unchanged; what
 * it wears and where it sits come from a second generator salted
 * `snoot-portrait:`, so no avatar changes.
 */
export function figure(seed: string, holiday?: Holiday): Figure {
  const t = traits(seed);
  const pal = holiday ? HOLIDAY_PALETTES[holiday] : (PALETTES[t.palette] as Palette);
  const rng = createRng(`snoot-portrait:${seed}`);
  const gear = pick(rng, GEAR);
  const fabric = pick(rng, FABRICS);
  // A smaller head, so the whole body fits; a frog's is wide and sits low on its body.
  const h = t.species === 'frog' ? layout(t, 0.9, 28) : layout(t, 0.78, 19);
  const p = createPix();
  tag(p, 'ears', () => ears(p, t, h));
  body(p, t);
  wear(p, gear, neckY(t));
  drawHead(p, t, h);
  markings(p, t, h);
  face(p, t, h);
  if (t.species === 'dog') dogEars(p, h);
  extra(p, t, h);
  shadeRuns(p, ['body', 'haunch', 'shade', 'fabric', 'screen'], 0.22, 0.2);
  ink(p, FEATURES);
  openShoulders(p, t);
  const colours: Colours = {
    body: pal.body,
    leg: t.species === 'panda' ? pal.shade : pal.body,
    paw: t.species === 'panda' ? pal.shade : pal.body,
    haunch: t.species === 'panda' ? pal.shade : pal.body,
    shade: pal.shade,
    screen: pal.screen,
    white: pal.screen,
    glow: pal.glow,
    accent: pal.accent,
    fabric,
    shine: '#fff8f0',
    cheek: mix(pal.accent, pal.body, 0.35),
    tongue: '#e8687a',
    whisker: mix(pal.shade, pal.glow, 0.4),
    tag: '#f0c850',
    bar: pal.shade,
    ink: '#1a1018',
  };
  const moves = motion(`snoot:${seed}`, {
    eyes: ['blink', 'center'],
    ears: ['twitch', 'center'],
    // Tails wag from their base: a side tail's lower left, a cat's tip from its lower right.
    tail: ['wag', t.species === 'cat' ? '100% 100%' : '0% 100%'],
    wings: ['flap', 'center'],
  });
  return { p, colours, rng, bg: pal.bg, scenes: holiday ? [holiday] : SCENES, motion: moves };
}

/** What a Snoot wears at its neck, over its body and under its chin. */
function wear(p: Pix, gear: Gear, y: number): void {
  if (gear === 'scarf') {
    p.fill(or(ellipse(CX, y, 10, 3.2), ellipse(CX + 1, y + 2.5, 9, 2.6)), 'fabric');
    p.fill(
      and(
        rect(CX + 2, y + 3, CX + 6, y + 12),
        not((x, yy) => yy > y + 10 && x % 2 === 0),
      ),
      'fabric',
      -1,
    );
  } else if (gear === 'collar') {
    p.fill(and(ellipse(CX, y, 9.5, 2.8), not(ellipse(CX, y - 1, 9.5, 2.2))), 'fabric');
    p.fill(ellipse(CX, y + 3, 1.6, 1.6), 'tag');
  } else if (gear === 'bandana') {
    p.fill((x, yy) => yy >= y - 1 && yy <= y + 9 && Math.abs(x + 0.5 - CX) <= (y + 9 - yy) * 0.85, 'fabric');
  }
}

/**
 * Draws the seed's Snoot as a 64x64 portrait in a seeded scene: the
 * same Snoot as its avatar, drawn fuller. Preview: the picture may still
 * change in a minor release.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Size, motion, holiday and title
 * @returns A standalone SVG document
 */
export function portrait(seed: string, opts: PortraitOptions = {}): string {
  return portraitOf('snoot', 'Animal portrait', figure, seed, opts);
}

/**
 * Draws two seeds' Snoots facing each other in one 128x64 scene, the left
 * one's. Preview, as {@link portrait}.
 *
 * @param left - The seed on the left
 * @param right - The seed on the right, turned to face the left
 * @param opts - Size (the height; the width is twice it), motion, holiday and title
 * @returns A standalone SVG document
 */
export function duet(left: string, right: string, opts: PortraitOptions = {}): string {
  return duetOf('snoot', 'Animal portraits', figure, left, right, opts);
}
