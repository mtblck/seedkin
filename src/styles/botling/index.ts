/**
 * seedkin/botling: the Botlings, seeded robot avatars and the first Seedkin style.
 *
 * @packageDocumentation
 */

export { FRAMES } from '../../core/render/frame.js';
export { LOOKS } from '../../core/render/look.js';
export { randomSeed } from '../../core/seed.js';
export { CENTER, GRID_SIZE, grid, SMALL_GRID_SIZE, smallGrid } from './grid/index.js';
export { HOLIDAY_PALETTES, type Holiday } from './holidays.js';
export { PALETTES } from './palettes.js';
export { ACCESSORIES, EYES, HEADS, MOUTHS, PATTERNS, QUIRKS, SHAPES, SIDES, TOPS } from './parts.js';
export { botling, botlingDataUri, resolveTraits } from './svg.js';
export { traits } from './traits.js';
export type {
  Accessory,
  BotlingOptions,
  Detail,
  Eyes,
  Frame,
  Head,
  Look,
  Mouth,
  Palette,
  Pattern,
  Quirk,
  RoleGrid,
  Shape,
  Sides,
  Top,
  Traits,
} from './types.js';
export { Role } from './types.js';
