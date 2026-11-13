import { createRng, pick } from '../../../src/core/random.js';
import { PALETTES } from '../../../src/styles/snoot/palettes.js';
import { traits } from '../../../src/styles/snoot/traits.js';
import type { Palette } from '../../../src/styles/snoot/types.js';
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
  rounded,
  shadeRuns,
} from '../canvas.js';
import { type Figure, pair, single } from '../compose.js';
import type { Scene } from '../scene.js';
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
export function figure(seed: string): Figure {
  const t = traits(seed);
  const pal = PALETTES[t.palette] as Palette;
  const rng = createRng(`snoot-portrait:${seed}`);
  const gear = pick(rng, GEAR);
  const fabric = pick(rng, FABRICS);
  // A smaller head, so the whole body fits; a frog's is wide and sits low on its body.
  const h = t.species === 'frog' ? layout(t, 0.9, 28) : layout(t, 0.78, 19);
  const p = createPix();
  ears(p, t, h);
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
  return { p, colours, rng, bg: pal.bg, scenes: SCENES };
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

/** A Snoot portrait in its seeded scene, as SVG. */
export function portrait(seed: string, px = 4): string {
  return single(figure(seed), px);
}

/** Two Snoots facing each other in one 128x64 scene. */
export function duet(left: string, right: string, px = 4): string {
  return pair(figure(left), figure(right), px);
}
