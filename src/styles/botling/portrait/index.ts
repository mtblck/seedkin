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
} from '../../../core/portrait/canvas.js';
import { duetOf, type Figure, portraitOf } from '../../../core/portrait/compose.js';
import { motion, tag } from '../../../core/portrait/motion.js';
import type { PortraitOptions } from '../../../core/portrait/options.js';
import type { Scene } from '../../../core/portrait/scene.js';
import { createRng, pick } from '../../../core/random.js';
import type { Holiday } from '../../../core/types.js';
import { slots } from '../grid/slots.js';
import { HOLIDAY_PALETTES } from '../holidays.js';
import { PALETTES } from '../palettes.js';
import { traits } from '../traits.js';
import type { Palette } from '../types.js';
import { drawAccessory, drawQuirk, drawSides, drawTop } from './extras.js';
import { drawFace } from './face.js';
import { drawHead, layout } from './head.js';

export type Gear = 'bare' | 'scarf' | 'bowtie' | 'hoodie' | 'straps';
const GEAR: readonly Gear[] = ['bare', 'scarf', 'bowtie', 'hoodie', 'straps'];
const FABRICS = ['#c84a4a', '#3a6ab0', '#e0a526', '#4f9a4a', '#7c5cd6', '#2bb3a3', '#e07aa0'];
const SCENES: readonly Scene[] = ['workshop', 'workshop', 'room', 'sky', 'plain'];
const CX = 32;

/**
 * Draws a Botling as a 64x64 shoulders-up portrait. The head, face, top,
 * sides and colours come from the avatar's own traits, unchanged; what it
 * wears and where it stands come from a second generator salted
 * `botling-portrait:`, so no avatar changes.
 */
export function figure(seed: string, holiday?: Holiday): Figure {
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
  const moves = motion(seed, {
    eyes: ['blink', 'center'],
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

/** A segmented neck, a torso with arms, and what the robot wears on it. */
function body(p: Pix, gear: Gear, light: boolean, neckTop: number): void {
  const chassis = rounded(CX, 64, 25, 16, 6);
  const hole = ellipse(CX, 47.5, 5.6, 2.6);
  if (gear === 'hoodie')
    p.fill(
      and(ellipse(CX, 50, 15, 6.5), (_x, y) => y <= 52),
      'fabric',
      1,
    );
  p.fill(rect(CX - 4, Math.floor(neckTop) - 2, CX + 3, 50), 'shade');
  p.fill(
    and(rect(CX - 4, Math.floor(neckTop), CX + 3, 50), (_x, y) => y % 3 === 0),
    'shade',
    -1,
  );
  if (gear === 'hoodie') {
    p.fill(and(chassis, not(hole)), 'fabric');
    p.fill(or(rect(CX - 4, 51, CX - 4, 58), rect(CX + 3, 51, CX + 3, 58)), 'accent');
    return;
  }
  // Arms hang from ball joints beside a narrower torso, splayed a little so
  // the background shows between, and ringed like the neck.
  const arm =
    (s: number) =>
    (x: number, y: number): boolean =>
      y >= 50 && Math.abs(x + 0.5 - (CX + s * (20 + (y - 50) * 0.5))) <= 3.4;
  const arms = or(arm(-1), arm(1));
  p.fill(arms, 'body');
  p.fill(
    and(arms, (_x, y) => y % 3 === 1 && y > 54),
    'shade',
    -1,
  );
  p.fill(rounded(CX, 64, 15, 16, 5), 'body');
  p.fill(or(ellipse(CX - 18, 51.5, 4.4, 4.4), ellipse(CX + 18, 51.5, 4.4, 4.4)), 'shade');
  p.fill(rounded(CX, 57, 9, 5, 2), 'panel');
  if (light) {
    p.fill(ellipse(CX, 57, 2.8, 2.8), 'accent');
    p.fill(rect(CX - 2, 55, CX - 2, 55), 'light');
  } else
    p.fill(
      and(rect(CX - 6, 55, CX + 5, 59), (_x, y) => y % 2 === 1),
      'screen',
    );
  if (gear === 'scarf') {
    p.fill(or(ellipse(CX, 48, 12, 4), ellipse(CX + 1, 51, 11, 3.5)), 'fabric');
    p.fill(
      and(
        rect(CX + 3, 51, CX + 8, 63),
        not((x, y) => y > 61 && x % 2 === 0),
      ),
      'fabric',
      -1,
    );
  } else if (gear === 'bowtie') {
    const wing = (s: number) => (x: number, y: number) => {
      const dx = (x + 0.5 - CX) * s;
      return dx > 0 && dx < 5 && Math.abs(y + 0.5 - 49) <= dx * 0.55 + 0.6;
    };
    p.fill(or(wing(1), wing(-1)), 'fabric');
    p.fill(ellipse(CX, 49, 1.3, 1.3), 'fabric', -1);
  } else if (gear === 'straps') {
    p.fill(or(rect(CX - 9, 48, CX - 7, 63), rect(CX + 6, 48, CX + 8, 63), rect(CX - 9, 58, CX + 8, 63)), 'fabric');
    p.fill(or(ellipse(CX - 7.5, 58.5, 1, 1), ellipse(CX + 7.5, 58.5, 1, 1)), 'accent');
  }
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
