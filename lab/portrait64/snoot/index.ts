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
import { extra, face, markings } from './face.js';
import { dogEars, drawHead, ears, layout } from './head.js';

export type Gear = 'bare' | 'scarf' | 'sweater' | 'bandana' | 'collar' | 'overalls';
const GEAR: readonly Gear[] = ['bare', 'scarf', 'sweater', 'bandana', 'collar', 'overalls'];
const FABRICS = ['#c84a4a', '#3a6ab0', '#e0a526', '#4f9a4a', '#7c5cd6', '#2bb3a3', '#e07aa0'];
const SCENES: readonly Scene[] = ['sky', 'sky', 'room', 'shelf', 'plain'];
const CX = 32;
/** Drawn as lines already, or too small to ink: eyes and their whites, cheeks, whiskers. */
const FEATURES = ['glow', 'shine', 'cheek', 'whisker', 'tongue', 'white'];

/**
 * Draws a Snoot as a 64x64 shoulders-up portrait. Species, coat, eyes,
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
  const h = layout(t);
  const p = createPix();
  ears(p, t, h);
  body(p, gear);
  drawHead(p, t, h);
  markings(p, t, h);
  face(p, t, h);
  if (t.species === 'dog') dogEars(p, h);
  extra(p, t, h);
  if (gear === 'bandana') p.fill((x, y) => y >= 40 && y <= 54 && Math.abs(x + 0.5 - CX) <= (54 - y) * 0.75, 'fabric');
  shadeRuns(p, ['body', 'shade', 'fabric', 'screen'], 0.22, 0.2);
  ink(p, FEATURES);
  const colours: Colours = {
    body: pal.body,
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
    ink: '#1a1018',
  };
  return { p, colours, rng, bg: pal.bg, scenes: SCENES };
}

/** A furry torso with a pale chest and arms, and what the Snoot wears on it. */
function body(p: Pix, gear: Gear): void {
  const torso = rounded(CX, 62, 15, 22, 9);
  const arm =
    (s: number) =>
    (x: number, y: number): boolean =>
      y >= 46 && Math.abs(x + 0.5 - (CX + s * (16 + (y - 46) * 0.5))) <= 4.2;
  const arms = or(ellipse(CX - 15, 48, 5, 5), ellipse(CX + 15, 48, 5, 5), arm(-1), arm(1));
  const clothed = gear === 'sweater';
  p.fill(arms, clothed ? 'fabric' : 'body');
  if (clothed)
    p.fill(
      and(arms, (_x, y) => y >= 61),
      'fabric',
      -1,
    );
  p.fill(torso, clothed ? 'fabric' : 'body');
  if (clothed) {
    p.fill(and(rect(CX - 8, 40, CX + 7, 46), torso), 'fabric', 1);
    return;
  }
  p.fill(ellipse(CX, 56, 8, 9), 'screen');
  if (gear === 'scarf') {
    p.fill(or(ellipse(CX, 42, 13, 4.2), ellipse(CX + 1, 45.5, 12, 3.6)), 'fabric');
    p.fill(
      and(
        rect(CX + 3, 46, CX + 8, 63),
        not((x, y) => y > 61 && x % 2 === 0),
      ),
      'fabric',
      -1,
    );
  } else if (gear === 'collar') {
    p.fill(and(ellipse(CX, 41, 13, 3.4), not(ellipse(CX, 39.5, 13, 2.6))), 'fabric');
    p.fill(ellipse(CX, 46, 1.8, 1.8), 'tag');
  } else if (gear === 'overalls') {
    p.fill(
      and(torso, or(rect(CX - 8, 44, CX - 6, 63), rect(CX + 5, 44, CX + 7, 63), rect(CX - 8, 54, CX + 7, 63))),
      'fabric',
    );
    p.fill(or(ellipse(CX - 6.5, 54.5, 1, 1), ellipse(CX + 6.5, 54.5, 1, 1)), 'tag');
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
