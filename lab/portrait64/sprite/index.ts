import { createRng } from '../../../src/core/random.js';
import type { Holiday } from '../../../src/core/types.js';
import { Role, type RoleGrid } from '../../../src/core/types.js';
import type { Anchor, Form } from '../../../src/styles/sprite/grid/draw.js';
import { EARTH } from '../../../src/styles/sprite/grid/earth.js';
import { FIRE } from '../../../src/styles/sprite/grid/fire.js';
import { SPACE } from '../../../src/styles/sprite/grid/space.js';
import { WATER } from '../../../src/styles/sprite/grid/water.js';
import { WIND } from '../../../src/styles/sprite/grid/wind.js';
import { HOLIDAY_PALETTES } from '../../../src/styles/sprite/holidays.js';
import { PALETTES } from '../../../src/styles/sprite/palettes.js';
import { traits } from '../../../src/styles/sprite/traits.js';
import type { Palette } from '../../../src/styles/sprite/types.js';
import {
  and,
  type Colours,
  createPix,
  ellipse,
  ink,
  mix,
  or,
  type Pix,
  rect,
  type Shape,
  shadeRuns,
} from '../canvas.js';
import { type Figure, pair, single } from '../compose.js';
import type { Scene } from '../scene.js';
import { face, mark } from './face.js';
import { clumps, type Fit, point, trace } from './trace.js';

const FORMS: Record<string, Form> = { ...FIRE, ...WATER, ...EARTH, ...WIND, ...SPACE };
const SCENES: readonly Scene[] = ['sky', 'sky', 'room', 'shelf', 'plain'];
const FIT: Fit = { s: 3.8, ox: 32 - 7.5 * 3.8, oy: 32 - 7.5 * 3.8 + 1 };
/** Drawn as lines already, or too small to ink. */
const FEATURES = ['face', 'shine', 'blush', 'mote', 'mark'];

/** Frame `n` of the seed's form, before its face, flipped when the Sprite is mirrored. */
function frame(t: ReturnType<typeof traits>, n: number): { g: RoleGrid; at: Anchor } {
  const { c, at } = (FORMS[t.form] as Form).full(n);
  if (!t.isMirrored) return { g: c.cells, at };
  return { g: c.cells.map((row) => [...row].reverse()), at: { ...at, x: c.cells.length - 1 - at.x } };
}

/**
 * Draws a Sprite as a 64x64 portrait: its avatar's form traced smooth at
 * the larger size (the outline, the shade tongues and cracks, the bright
 * core, the accent spots), its motes as twinkles around it, and its face
 * redrawn. Everything comes from the avatar's traits and its still frame;
 * the scene comes from a second generator salted `sprite-portrait:`.
 */
export function figure(seed: string, holiday?: Holiday): Figure {
  const t = traits(seed);
  const pal = holiday ? HOLIDAY_PALETTES[holiday] : (PALETTES[t.palette] as Palette);
  const rng = createRng(`sprite-portrait:${seed}`);
  const all = [0, 1, 2, 3].map((n) => frame(t, n));
  const [first, ...rest] = all.map(({ g, at }, n) => draw(t, g, at, all, n));
  const colours: Colours = {
    body: pal.body,
    shade: pal.shade,
    screen: pal.screen,
    accent: pal.accent,
    face: pal.glow,
    shine: mix(pal.glow, '#ffffff', 0.85),
    blush: pal.accent,
    mote: pal.accent,
    mark: pal.accent,
    ink: '#1a1018',
  };
  // Animated, the portrait sways through the avatar's four frames on the avatar's own beats.
  return {
    p: first as Pix,
    colours,
    rng,
    bg: pal.bg,
    scenes: holiday ? [holiday] : SCENES,
    motion: { parts: {} },
    frames: { ps: rest, beats: t.beats },
  };
}

/**
 * A flame's core as a round glow over the avatar's core cells, its bottom
 * cut off by the flame's base; `k` grows it, the same all round, as it pulses.
 */
function core(g: RoleGrid, k: number): Shape {
  const cells = g.flatMap((row, r) => row.flatMap((v, c) => (v === Role.Screen ? [[r, c] as const] : [])));
  const rs = cells.map(([r]) => r);
  const cs = cells.map(([, c]) => c);
  const [x0, y0] = point(FIT, Math.min(...cs) - 0.5, Math.min(...rs) - 0.5);
  const [x1, y1] = point(FIT, Math.max(...cs) + 0.5, Math.max(...rs) + 0.5);
  const r0 = ((x1 - x0) / 2) * 0.7;
  return ellipse((x0 + x1) / 2, y1 - r0 * 0.55, r0 + k, r0 + k);
}

/** One frame of the portrait, traced from the same frame of the avatar. */
function draw(
  t: ReturnType<typeof traits>,
  g: RoleGrid,
  at: Anchor,
  all: { g: RoleGrid; at: Anchor }[],
  n: number,
): Pix {
  const role = (r: number, c: number): number => g[r]?.[c] ?? Role.Empty;
  const solid = (r: number, c: number): boolean => [Role.Body, Role.Shade, Role.Screen].includes(role(r, c) as 1);
  const touches = (r: number, c: number): boolean =>
    solid(r - 1, c) || solid(r + 1, c) || solid(r, c - 1) || solid(r, c + 1);
  const onBody = (r: number, c: number): boolean => role(r, c) === Role.Accent && touches(r, c);
  // A flame's core holds still and its streaks (the side licks and the forehead mark)
  // draw in toward its middle and back, instead of the avatar's core flickering up.
  const flame = t.form === 'flame';
  const still = all[0]?.g ?? g;
  const stillOn = (r: number, c: number): boolean =>
    still[r]?.[c] === Role.Accent &&
    [still[r - 1]?.[c], still[r + 1]?.[c], still[r]?.[c - 1], still[r]?.[c + 1]].some(
      (v) => v === Role.Body || v === Role.Shade || v === Role.Screen,
    );
  const pull = flame ? ([0, 2, 3, 2][n] as number) : 0;
  const [mx] = point(FIT, at.x, at.y);
  const inward =
    (s: Shape): Shape =>
    (x, y) =>
      s(x + Math.sign(x + 0.5 - mx) * pull, y);
  const p = createPix();
  const body = trace(g, (r, c) => solid(r, c) || (flame ? stillOn(r, c) : onBody(r, c)), FIT, 0.85);
  p.fill(body, 'shade');
  p.fill(
    and(body, (x, y) => body(x - 2, y) && body(x + 2, y)),
    'body',
  );
  // Shade inside the outline: a flame's tongues, a coal's cracks, a crystal's facets.
  const inner = (r: number, c: number): boolean =>
    role(r, c) === Role.Shade && solid(r - 1, c) && solid(r + 1, c) && solid(r, c - 1) && solid(r, c + 1);
  p.over(trace(g, inner, FIT, 0.42), 'shade', ['body'], -1);
  p.over(
    flame ? core(still, [0, 1, 2, 1][n] as number) : trace(g, (r, c) => role(r, c) === Role.Screen, FIT, 0.45),
    'screen',
    ['body', 'shade'],
  );
  p.over(flame ? inward(trace(still, stillOn, FIT, 0.42)) : trace(g, onBody, FIT, 0.42), 'accent', [
    'body',
    'shade',
    'screen',
  ]);
  face(p, g, at, t, FIT);
  mark(p, all, at, t, FIT, pull);
  shadeRuns(p, ['body', 'screen'], 0.22, 0.2);
  ink(p, FEATURES);
  motes(p, g);
  return p;
}

/** The avatar's loose accent cells (embers, sparkles, drops) as small four-point twinkles, unoutlined. */
function motes(p: Pix, g: RoleGrid): void {
  const loose = (r: number, c: number): boolean => {
    if (g[r]?.[c] !== Role.Accent) return false;
    return ![
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ].some(([rr, cc]) => {
      const v = g[rr as number]?.[cc as number];
      return v === Role.Body || v === Role.Shade || v === Role.Screen;
    });
  };
  for (const clump of clumps(g, loose)) {
    const [x, y] = point(
      FIT,
      clump.reduce((a, [, c]) => a + c, 0) / clump.length,
      clump.reduce((a, [r]) => a + r, 0) / clump.length,
    );
    const k = clump.length > 1 ? 1.4 : 1;
    const star: Shape = or(
      rect(Math.round(x), Math.round(y - 2 * k), Math.round(x), Math.round(y + 2 * k)),
      rect(Math.round(x - 2 * k), Math.round(y), Math.round(x + 2 * k), Math.round(y)),
      ellipse(x, y, 1.2 * k, 1.2 * k),
    );
    p.fill(star, 'mote');
  }
}

/** A Sprite portrait in its seeded scene, as SVG. */
export function portrait(seed: string, px = 4, animate = false, holiday?: Holiday): string {
  return single(figure(seed, holiday), px, animate);
}

/** Two Sprites facing each other in one 128x64 scene. */
export function duet(left: string, right: string, px = 4, animate = false, holiday?: Holiday): string {
  return pair(figure(left, holiday), figure(right, holiday), px, animate);
}
