/**
 * seedkin/beastie: the Beasties, seeded monster avatars. A seed draws
 * the same Beastie in every 2.x release.
 *
 * @packageDocumentation
 */

export { FRAMES } from '../../core/render/frame.js';
export { LOOKS } from '../../core/render/look.js';
export { randomSeed } from '../../core/seed.js';
export { CENTER, GRID_SIZE, grid, SMALL_GRID_SIZE, smallGrid } from './grid/index.js';
export { HOLIDAY_PALETTES, type Holiday } from './holidays.js';
export { PALETTES } from './palettes.js';
export { BODIES, EYES, MOUTHS, SHAPES, SIDES, TOPS } from './parts.js';
export { beastie, beastieDataUri, resolveTraits } from './svg.js';
export { traits } from './traits.js';
export type {
  BeastieOptions,
  BeastieTraits,
  Body,
  Detail,
  Eyes,
  Frame,
  Look,
  Mouth,
  Palette,
  RoleGrid,
  Shape,
  Sides,
  Top,
} from './types.js';
export { Role } from './types.js';
