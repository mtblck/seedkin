import { and, createPix, ink, or, type Pix, type Shape, shadeRuns } from '../../../core/portrait/canvas.js';
import { tag } from '../../../core/portrait/motion.js';
import { Role, type RoleGrid } from '../../../core/types.js';
import type { Anchor } from '../grid/draw.js';
import type { SpriteTraits } from '../types.js';
import { sprout, sproutCells, tentacles } from './extras.js';
import { face, mark } from './face.js';
import { core, streak } from './flame.js';
import { embers, faces, ring, ringLine, ringRow, rocks, sparkles } from './fx.js';
import { barRow, front, haze, plusAt, tongue } from './layers.js';
import { motes } from './motes.js';
import { LIFT, leaves, shift, sway, trunkRow } from './place.js';
import { clumps, type Fit, isolated, trace } from './trace.js';

/**
 * Where the 15x15 avatar sits: four portrait pixels to an avatar cell, so a part that
 * moves a cell between frames moves four whole pixels and keeps its exact shape.
 */
export const FIT: Fit = { s: 4, ox: 2, oy: 3 };
/** Forms whose traced body holds still: a bubble squashes and a treetop sways as one shape instead. */
export const STILL = ['boulder', 'crystal', 'bubble', 'tree'];

/** One frame of the avatar, with its anchor. */
export interface Frame {
  g: RoleGrid;
  at: Anchor;
}

/**
 * One frame of the portrait, traced from the same frame of the avatar. The
 * face, the mark and the sparkles are drawn from the still frame (`all[0]`)
 * and moved by whole pixels, so they never flicker between frames.
 */
export function draw(t: SpriteTraits, fr: Frame, all: Frame[], n: number): Pix {
  const { g, at } = fr;
  const still = all[0] as Frame;
  const role = (r: number, c: number): number => g[r]?.[c] ?? Role.Empty;
  const filled = (r: number, c: number): boolean => [Role.Body, Role.Shade, Role.Screen].includes(role(r, c) as 1);
  const tentacle = t.form === 'jelly' ? tentacles(g, FIT) : undefined;
  // Loose bits are drawn apart: a planet's sparkles, a boulder's grit, a jellyfish's tentacles.
  const loose = (r: number, c: number): boolean =>
    (role(r, c) === Role.Screen &&
      ![
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ].some(([rr, cc]) => [Role.Body, Role.Shade].includes(role(rr as number, cc as number) as 1)) &&
      isolated(g, r, c)) ||
    (t.form === 'boulder' && !touching(g, r, c)) ||
    (tentacle?.below(r) ?? false);
  const solid = (r: number, c: number): boolean => filled(r, c) && !loose(r, c);
  const touches = (r: number, c: number): boolean =>
    solid(r - 1, c) || solid(r + 1, c) || solid(r, c - 1) || solid(r, c + 1);
  const open = (r: number, c: number): boolean =>
    [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ].some(([rr, cc]) => role(rr as number, cc as number) === Role.Empty);
  // A spot on the body that's there in the still frame too (a cell over, as the body sways), not a
  // drip at its edge or a passing spark: those pop in and out between frames.
  const kept = (r: number, c: number): boolean => [-1, 0, 1].some((d) => still.g[r]?.[c + d] === Role.Accent);
  const onBody = (r: number, c: number): boolean =>
    role(r, c) === Role.Accent && touches(r, c) && !open(r, c) && kept(r, c);
  const flame = t.form === 'flame';
  // Small bright spots on the body are shines, flat white; a fire's core and a tree's trunk aren't.
  const spots = new Set(
    FIRE_CORE.includes(t.form)
      ? []
      : clumps(g, (r, c) => role(r, c) === Role.Screen && solid(r, c))
          .filter((k) => k.length <= 4)
          .flatMap((k) => k.map(([r, c]) => `${r},${c}`)),
  );

  const p = createPix();
  const trunk = trace(g, (r, c) => t.form === 'tree' && role(r, c) === Role.Screen && solid(r, c), FIT, 0.45);
  // A tree's leaves stop where its trunk starts, rather than filling in behind it.
  const crown = (_x: number, y: number): boolean => t.form !== 'tree' || y < FIT.oy + trunkRow(g) * FIT.s;
  const traced = trace(
    g,
    (r, c) => (solid(r, c) || onBody(r, c)) && !(t.form === 'tree' && role(r, c) === Role.Screen),
    FIT,
    0.85,
  );
  const whole: Shape = or(and(traced, crown), trunk);
  // A fire Sprite with a bar across its brow burns bright below it and rises as haze above it.
  const bar = barRow(t, all, still.at);
  const cut =
    bar === undefined ? undefined : FIT.oy + (bar + 0.5 + (t.form === 'ember' ? 0 : at.y - still.at.y)) * FIT.s;
  const body = cut === undefined ? whole : front(whole, cut, FIT.ox + (at.x + 0.5) * FIT.s);
  if (cut !== undefined) haze(p, whole, body);
  const shiny = (r: number, c: number): boolean => spots.has(`${r},${c}`) && (bar === undefined || r > bar);
  // A jellyfish's tentacles hang behind its bell.
  if (tentacle) tentacle.draw(p);
  p.fill(body, 'shade');
  p.fill(
    and(body, (x, y) => whole(x - 2, y) && whole(x + 2, y)),
    'body',
  );
  if (t.form === 'crystal') faces(p, body, FIT);
  else {
    // Shade inside the outline: a flame's tongues, a coal's cracks, a whirlwind's bands.
    const inner = (r: number, c: number): boolean =>
      role(r, c) === Role.Shade &&
      (bar === undefined || r > bar) &&
      solid(r - 1, c) &&
      solid(r + 1, c) &&
      solid(r, c - 1) &&
      solid(r, c + 1);
    p.over(trace(g, inner, FIT, 0.42), PATCHED.includes(t.form) ? 'patch' : 'shade', ['body'], -1);
    const flare = flame ? core(still.g, n, FIT) : undefined;
    const glow = (r: number, c: number): boolean =>
      role(r, c) === Role.Screen && solid(r, c) && (bar === undefined || r > bar);
    p.over(flare?.glow ?? trace(g, (r, c) => glow(r, c) && !shiny(r, c), FIT, 0.45), 'screen', ['body', 'shade']);
    p.over(trace(g, shiny, FIT, 0.45), 'shine', ['body', 'shade']);
  }
  p.over(trace(g, onBody, FIT, 0.42), 'accent', ['body', 'shade', 'screen']);
  if (t.form === 'planet') ring(p, g, FIT);
  if (t.form === 'boulder') tag(p, 'sprout', () => sprout(p, g, FIT));
  // The face and mark keep the still frame's shapes, moved by whole cells with the avatar's.
  const moved: Fit = { ...FIT, ox: FIT.ox + (at.x - still.at.x) * FIT.s, oy: FIT.oy + (at.y - still.at.y) * FIT.s };
  // A treetop's eyes sway with it, so only the other still forms blink.
  const blinks = STILL.includes(t.form) && !SWAYS.includes(t.form) && !['happy', 'sleepy', 'wink'].includes(t.eyes);
  face(p, still.g, still.at, t, moved, blinks);
  const plus = FIRE.includes(t.form) ? plusAt(t, all, still.at, moved) : undefined;
  if (plus) tongue(p, ...plus, FIT.s);
  else if (cut === undefined) mark(p, all, still.at, t, moved);
  if (flame) streak(p, core(still.g, n, FIT).streaks);
  if (t.form === 'boulder') rocks(p, FIT);
  shadeRuns(p, ['body', 'screen'], 0.22, 0.2);
  ink(p, FEATURES);
  if (t.form === 'planet') ringLine(p);
  // A comet's sparks stream down its tail frame by frame, as the avatar's do; fire Sprites throw off
  // rising embers; other sparkles stay put and twinkle, and a still crystal gets more of them.
  if (t.form === 'comet') motes(p, g, FIT, new Set());
  else if (FIRE.includes(t.form))
    embers(
      p,
      trace(still.g, (r, c) => solid(r, c), FIT, 0.85),
    );
  else tag(p, 'motes', () => motes(p, still.g, FIT, skipped(t.form, still.g), WATERY.includes(t.form)));
  if (t.form === 'crystal') sparkles(p, body);
  // A treetop sways over its trunk.
  if (t.form === 'tree') {
    leaves(p, g, FIT);
    sway(p, 'crown', FIT.oy + trunkRow(g) * FIT.s);
  }
  shift(p, LIFT[t.form] ?? 0);
  return p;
}

/** Drawn as lines already, or too small to ink. */
const FEATURES = [
  'face',
  'shine',
  'bubble',
  'bubblein',
  'blush',
  'mote',
  'mark',
  'flare',
  'patch',
  'ink',
  'tentacle',
  'facet',
];
/** Forms whose dark patches are drawn without an outline. */
const PATCHED = ['tornado', 'star'];
/** Fire forms, whose sparks rise off them as embers. */
const FIRE = ['flame', 'wisp', 'ember'];
/** Forms that sway as one part, so their eyes can't blink apart from it. */
const SWAYS = ['tree'];
/** Water forms, whose motes are little floating bubbles. */
export const WATERY = ['drop', 'bubble'];
/** Forms whose bright cells are a fire's core, never a shine. */
const FIRE_CORE = ['flame', 'wisp'];

/** Accent cells drawn as something other than sparkles: a boulder's sprout, a planet's ring. */
function skipped(form: string, g: RoleGrid): Set<string> {
  if (form === 'boulder') return sproutCells(g);
  const at = form === 'planet' ? ringRow(g) : undefined;
  const out = new Set<string>();
  if (at) for (let c = at.c0; c <= at.c1; c++) out.add(`${at.r},${c}`);
  return out;
}

/** Whether a cell has a filled neighbour, so it's part of a body rather than a loose grain. */
function touching(g: RoleGrid, r: number, c: number): boolean {
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ].some(([rr, cc]) => [Role.Body, Role.Shade, Role.Screen].includes(g[rr as number]?.[cc as number] as 1));
}
