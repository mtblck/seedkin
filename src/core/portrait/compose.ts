import type { Rng } from '../random.js';
import type { Holiday } from '../types.js';
import { type Colours, createPix, type Pix } from './canvas.js';
import { css, type Motion } from './motion.js';
import { type PortraitOptions, type PortraitSettled, settlePortrait } from './options.js';
import { type Scene, scene } from './scene.js';
import { type Layer, toSvg } from './svg.js';

/** A drawn character: its canvas, colours, the portrait's generator, its background and the scenes it can stand in. */
export interface Figure {
  p: Pix;
  colours: Colours;
  rng: Rng;
  bg: string;
  scenes: readonly Scene[];
  /** What moves, when animated. */
  motion?: Motion;
  /** Moving parts drawn behind the rest, so they never cross its front (a beastie's wings). */
  behind?: readonly string[];
  /** Further frames shown in turn with `p` (a Sprite's sway), with each frame's share of the loop. */
  frames?: { ps: Pix[]; beats: number[] };
}

/** A copy of a canvas, mirrored left to right. */
function flipped(p: Pix): Pix {
  const q = createPix(p.w, p.h);
  for (let y = 0; y < p.h; y++)
    for (const g of ['m', 'tone', 'z', 'part', 'lid'] as const)
      (q[g] as unknown[][])[y] = [...(p[g][y] as unknown[])].reverse();
  return q;
}

/**
 * The layers for one figure, with its classes and their CSS. `id` keeps two
 * figures' classes apart; `flip` mirrors it to face left.
 */
function figureLayers(
  f: Figure,
  id: string,
  flip: boolean,
  dx: number,
  animate: boolean,
): { layers: Layer[]; style: string; always: string } {
  const one = (p: Pix): Pix => (flip ? flipped(p) : p);
  if (!animate || !f.motion) {
    return { layers: [{ p: one(f.p), colours: f.colours, dx }], style: '', always: '' };
  }
  const { cls, whole, style } = css(f.motion, id, flip);
  const behind = f.behind ?? [];
  if (!f.frames)
    return { layers: [{ p: one(f.p), colours: f.colours, cls, behind, wrap: [whole], dx }], style, always: '' };
  // Sprites: every frame's layer is hidden but for its own share of the loop, as the avatar's are.
  const ps = [f.p, ...f.frames.ps];
  const total = f.frames.beats.reduce((a, b) => a + b, 0);
  let at = 0;
  let extra = '';
  const layers = ps.map((p, i): Layer => {
    const a = Math.round((at / total) * 100);
    at += f.frames?.beats[i] ?? 0;
    const b = i === ps.length - 1 ? 100 : Math.round((at / total) * 100);
    const c = `${id}-f${i}-${a}-${b}-${total}`;
    const show = a === 0 ? '0%{visibility:visible}' : `0%{visibility:hidden}${a}%{visibility:visible}`;
    extra += `@keyframes ${c}{${show}${b === 100 ? '' : `${b}%{visibility:hidden}`}}.${c}{animation:${c} ${total / 1000}s step-end infinite}`;
    return { p: one(p), colours: f.colours, cls, behind, wrap: [whole, c], dx };
  });
  // Without motion, only the first frame shows.
  const always = layers.map((l, i) => (i ? `.${l.wrap?.[1]}{visibility:hidden}` : '')).join('');
  return { layers, style: style + extra, always };
}

/**
 * A figure in its seeded scene, as SVG.
 *
 * @param f - The figure
 * @param s - Settled options: scale, motion and title
 */
export function single(f: Figure, s: PortraitSettled): string {
  const { layers, style, always } = figureLayers(f, 'p', false, 0, s.animate);
  return toSvg([scene(f.rng, f.bg, 64, f.scenes), ...layers], s.px, style, always, s.title);
}

/** Two figures facing each other in one 128x64 scene, the left one's; the right one is flipped. */
export function pair(a: Figure, b: Figure, s: PortraitSettled): string {
  const back = scene(a.rng, a.bg, 128, a.scenes);
  const l = figureLayers(a, 'pa', false, 2, s.animate);
  const r = figureLayers(b, 'pb', true, 62, s.animate);
  return toSvg([back, ...l.layers, ...r.layers], s.px, l.style + r.style, l.always + r.always, s.title);
}

/** How a style draws its figure for a seed, dressed for a holiday or not; `animate` says whether motion will show. */
export type Draw = (seed: string, holiday?: Holiday, animate?: boolean) => Figure;

/**
 * A style's portrait of a seed, with its options checked.
 *
 * @param style - The style's name, for error messages
 * @param title - The accessible name when the caller gives none
 * @param draw - The style's figure
 * @param seed - Any string
 * @param opts - Caller options
 */
export function portraitOf(style: string, title: string, draw: Draw, seed: string, opts: PortraitOptions): string {
  const s = settlePortrait(style, opts, title);
  return single(draw(seed, s.holiday, s.animate), s);
}

/** Two of a style's portraits facing each other, with options checked as {@link portraitOf}'s. */
export function duetOf(
  style: string,
  title: string,
  draw: Draw,
  left: string,
  right: string,
  opts: PortraitOptions,
): string {
  const s = settlePortrait(style, opts, title);
  return pair(draw(left, s.holiday, s.animate), draw(right, s.holiday, s.animate), s);
}
