/**
 * seedkin/noggin: the Noggins, seeded people avatars. A seed draws
 * the same Noggin in every 2.x release.
 *
 * @packageDocumentation
 */

export { FRAMES } from '../../core/render/frame.js';
export { LOOKS } from '../../core/render/look.js';
export { randomSeed } from '../../core/seed.js';
export { CENTER, GRID_SIZE, grid, SMALL_GRID_SIZE, smallGrid } from './grid/index.js';
export { HOLIDAY_PALETTES, type Holiday } from './holidays.js';
export { HAIR_COLOURS, PALETTES, paletteFor, SKIN_TONES } from './palettes.js';
export { EYES, EYEWEAR, FACIAL, HAIRS, HEADWEAR, MOUTHS, SHAPES } from './parts.js';
export { noggin, nogginDataUri, resolveTraits } from './svg.js';
export { traits } from './traits.js';
export type {
  Detail,
  Eyes,
  Eyewear,
  Facial,
  Frame,
  Hair,
  Headwear,
  Look,
  Mouth,
  NogginOptions,
  NogginTraits,
  Outfit,
  Palette,
  RoleGrid,
  Shape,
  SkinTone,
} from './types.js';
export { Role } from './types.js';
