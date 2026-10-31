/**
 * seedkin/snoot: the Snoots, seeded animal avatars. A seed draws
 * the same Snoot in every 2.x release.
 *
 * @packageDocumentation
 */

export { FRAMES } from '../../core/render/frame.js';
export { LOOKS } from '../../core/render/look.js';
export { randomSeed } from '../../core/seed.js';
export { CENTER, GRID_SIZE, grid, SMALL_GRID_SIZE, smallGrid } from './grid/index.js';
export { HOLIDAY_PALETTES, type Holiday } from './holidays.js';
export { PALETTES } from './palettes.js';
export { EXTRAS, EYES, MARKINGS, MOUTHS, SHAPES, SPECIES } from './parts.js';
export { resolveTraits, snoot, snootDataUri } from './svg.js';
export { traits } from './traits.js';
export type {
  Detail,
  Extra,
  Eyes,
  Frame,
  Look,
  Marking,
  Mouth,
  Palette,
  RoleGrid,
  Shape,
  SnootOptions,
  SnootTraits,
  Species,
} from './types.js';
export { Role } from './types.js';
