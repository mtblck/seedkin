import { createRng, pick } from '../../../src/core/random.js';
import { slots } from '../../../src/styles/botling/grid/slots.js';
import { PALETTES } from '../../../src/styles/botling/palettes.js';
import { traits } from '../../../src/styles/botling/traits.js';
import type { Palette } from '../../../src/styles/botling/types.js';
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
export function figure(seed: string): Figure {
  const t = traits(seed);
  const pal = PALETTES[t.palette] as Palette;
  const rng = createRng(`botling-portrait:${seed}`);
  const gear = pick(rng, GEAR);
  const fabric = pick(rng, FABRICS);
  const b = layout(t);
  const s = slots(t);
  const p = createPix();
  if (s.hasTop) drawTop(p, t, b);
  if (s.hasSides) drawSides(p, t.sides, b);
  if (s.hasQuirk) drawQuirk(p, t, b, false);
  body(p, gear, t.hasChestLight, b.bottom);
  drawHead(p, t, b);
  drawFace(p, t, b);
  if (s.hasQuirk) drawQuirk(p, t, b, true);
  drawAccessory(p, t, b);
  shadeRuns(p, ['body', 'shade', 'fabric', 'accent'], 0.22, 0.2);
  ink(p, ['glow', 'cheek', 'rivet', 'light']);
  return { p, colours: colours(pal, fabric), rng, bg: pal.bg, scenes: SCENES };
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

/** A segmented neck and a chassis, with what the robot wears on it. */
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
  p.fill(chassis, 'body');
  p.fill(or(ellipse(CX - 21, 52, 4.5, 4.5), ellipse(CX + 21, 52, 4.5, 4.5)), 'shade');
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

/** A Botling portrait in its seeded scene, as SVG. */
export function portrait(seed: string, px = 4): string {
  return single(figure(seed), px);
}

/** Two Botlings facing each other in one 128x64 scene. */
export function duet(left: string, right: string, px = 4): string {
  return pair(figure(left), figure(right), px);
}
