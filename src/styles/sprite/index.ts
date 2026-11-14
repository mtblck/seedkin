/**
 * seedkin/sprite: the Sprites, seeded avatars of little elemental spirits.
 * A seed draws the same Sprite in every 2.x release from 2.5.0.
 *
 * @packageDocumentation
 */

export { FRAMES } from '../../core/render/frame.js';
export { LOOKS } from '../../core/render/look.js';
export { randomSeed } from '../../core/seed.js';
export { CENTER, FRAME_COUNT, GRID_SIZE, grid, SMALL_GRID_SIZE, smallGrid } from './grid/index.js';
export { HOLIDAY_PALETTES, type Holiday } from './holidays.js';
export { PALETTE_GROUPS, PALETTES, type PaletteGroup, palettesFor } from './palettes.js';
export { ELEMENTS, EYES, FORMS, MARKS, MOUTHS, SHAPES } from './parts.js';
export { resolveTraits, sprite, spriteDataUri } from './svg.js';
export { traits } from './traits.js';
export type {
  Detail,
  Element,
  Eyes,
  Form,
  Frame,
  Look,
  Mark,
  Mouth,
  Palette,
  RoleGrid,
  Shape,
  SpriteOptions,
  SpriteTraits,
} from './types.js';
export { Role } from './types.js';
