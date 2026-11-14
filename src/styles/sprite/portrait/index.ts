/**
 * seedkin/sprite/portrait: the Sprites as 64x64 game-style portraits, the
 * same Sprite a seed draws as an avatar, drawn fuller in a seeded scene.
 * A Preview: a seed's portrait may change in a minor release (ADR 0018).
 *
 * @packageDocumentation
 */
import { and, type Colours, createPix, ink, mix, type Pix, shadeRuns } from '../../../core/portrait/canvas.js';
import { duetOf, type Figure, portraitOf } from '../../../core/portrait/compose.js';
import type { PortraitOptions } from '../../../core/portrait/options.js';

export type { PortraitOptions } from '../../../core/portrait/options.js';
export type { Holiday } from '../../../core/types.js';

import type { Scene } from '../../../core/portrait/scene.js';
import { createRng } from '../../../core/random.js';
import type { Holiday } from '../../../core/types.js';
import { Role, type RoleGrid } from '../../../core/types.js';
import type { Anchor, Form } from '../grid/draw.js';
import { EARTH } from '../grid/earth.js';
import { FIRE } from '../grid/fire.js';
import { SPACE } from '../grid/space.js';
import { WATER } from '../grid/water.js';
import { WIND } from '../grid/wind.js';
import { HOLIDAY_PALETTES } from '../holidays.js';
import { PALETTES } from '../palettes.js';
import { traits } from '../traits.js';
import type { Palette } from '../types.js';
import { face, mark } from './face.js';
import { core, streak } from './flame.js';
import { motes } from './motes.js';
import { type Fit, trace } from './trace.js';

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
function figure(seed: string, holiday?: Holiday, animate = true): Figure {
  const t = traits(seed);
  const pal = holiday ? HOLIDAY_PALETTES[holiday] : (PALETTES[t.palette] as Palette);
  const rng = createRng(`sprite-portrait:${seed}`);
  const all = [0, 1, 2, 3].map((n) => frame(t, n));
  // Still, only the first frame shows, so only it is drawn.
  const [first, ...rest] = (animate ? all : all.slice(0, 1)).map(({ g, at }, n) => draw(t, g, at, all, n));
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
    ...(animate ? { frames: { ps: rest, beats: t.beats } } : {}),
  };
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
  // A flame's core keeps the avatar's still shape and pulses with streaks; see `core`.
  const flame = t.form === 'flame';
  const still = all[0]?.g ?? g;
  const p = createPix();
  const body = trace(g, (r, c) => solid(r, c) || onBody(r, c), FIT, 0.85);
  p.fill(body, 'shade');
  p.fill(
    and(body, (x, y) => body(x - 2, y) && body(x + 2, y)),
    'body',
  );
  // Shade inside the outline: a flame's tongues, a coal's cracks, a crystal's facets.
  const inner = (r: number, c: number): boolean =>
    role(r, c) === Role.Shade && solid(r - 1, c) && solid(r + 1, c) && solid(r, c - 1) && solid(r, c + 1);
  p.over(trace(g, inner, FIT, 0.42), 'shade', ['body'], -1);
  const flare = flame ? core(still, n, FIT) : undefined;
  p.over(flare?.glow ?? trace(g, (r, c) => role(r, c) === Role.Screen, FIT, 0.45), 'screen', ['body', 'shade']);
  p.over(trace(g, onBody, FIT, 0.42), 'accent', ['body', 'shade', 'screen']);
  face(p, g, at, t, FIT);
  mark(p, all, at, t, FIT);
  if (flare) streak(p, flare.streaks);
  shadeRuns(p, ['body', 'screen'], 0.22, 0.2);
  ink(p, FEATURES);
  motes(p, g, FIT);
  return p;
}

/**
 * Draws the seed's Sprite as a 64x64 portrait in a seeded scene: the
 * same Sprite as its avatar, drawn fuller. Preview: the picture may still
 * change in a minor release.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Size, motion, holiday and title
 * @returns A standalone SVG document
 */
export function portrait(seed: string, opts: PortraitOptions = {}): string {
  return portraitOf('sprite', 'Sprite portrait', figure, seed, opts);
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
 * Draws two seeds' Sprites facing each other in one 128x64 scene, the left
 * one's. Preview, as {@link portrait}.
 *
 * @param left - The seed on the left
 * @param right - The seed on the right, turned to face the left
 * @param opts - Size (the height; the width is twice it), motion, holiday and title
 * @returns A standalone SVG document
 */
export function duet(left: string, right: string, opts: PortraitOptions = {}): string {
  return duetOf('sprite', 'Sprite portraits', figure, left, right, opts);
}
