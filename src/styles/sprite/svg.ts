import { type CommonOptions, checkPalette, settle } from '../../core/options.js';
import { stillSvg } from '../../core/render/svg.js';
import { animatedSprite } from './animate.js';
import { drawFrame } from './grid/index.js';
import { PALETTES } from './palettes.js';
import { ELEMENTS, SHAPES } from './parts.js';
import { traits } from './traits.js';
import type { Palette, SpriteOptions, SpriteTraits } from './types.js';

/**
 * Applies the `element`, `shape` and numeric `palette` options to a seed's
 * traits, rejecting values that would otherwise fail quietly.
 *
 * @param seed - Any string
 * @param opts - Caller options
 * @returns Traits to draw
 */
export function resolveTraits(seed: string, opts: SpriteOptions = {}): SpriteTraits {
  if (opts.element !== undefined && !ELEMENTS.includes(opts.element)) {
    throw new RangeError(`sprite: unknown element "${String(opts.element)}"`);
  }
  const t = traits(seed, opts.element);
  if (opts.shape !== undefined) {
    if (!SHAPES.includes(opts.shape)) throw new RangeError(`sprite: unknown shape "${String(opts.shape)}"`);
    t.shape = opts.shape;
  }
  if (opts.palette !== undefined && typeof opts.palette !== 'object') {
    if (!Number.isInteger(opts.palette) || opts.palette < 0 || opts.palette >= PALETTES.length) {
      throw new RangeError(`sprite: palette must be an integer from 0 to ${PALETTES.length - 1}, or a palette object`);
    }
    t.palette = opts.palette;
  }
  return t;
}

/**
 * Renders the Sprite for a seed as an SVG string. A seed draws
 * the same Sprite in every 2.x release from 2.5.0.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Rendering options
 * @returns A standalone SVG document
 */
export function sprite(seed: string, opts: SpriteOptions = {}): string {
  const t = resolveTraits(seed, opts);
  const palette: Palette =
    typeof opts.palette === 'object' ? checkPalette('sprite', opts.palette) : (PALETTES[t.palette] as Palette);
  const s = settle('sprite', opts as CommonOptions);
  const title = opts.title === undefined ? 'Sprite avatar' : opts.title;
  const look = { shape: t.shape, palette, background: opts.background !== false, title };
  if (s.animate) return animatedSprite(t, look, s);
  return stillSvg({ ...look, cells: drawFrame(t, 0, s.isSmall).cells }, s);
}

/**
 * Renders the Sprite for a seed as a `data:` URI, for an `<img src>` or CSS `url()`.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Rendering options
 * @returns A `data:image/svg+xml` URI
 */
export function spriteDataUri(seed: string, opts: SpriteOptions = {}): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sprite(seed, opts))}`;
}
