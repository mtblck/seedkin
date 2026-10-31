/**
 * seedkin/sprite: the Sprites, seeded avatars of little elemental spirits.
 * Sprite is a Preview style: a seed's Sprite may change in a minor release
 * until it's marked Stable.
 *
 * @packageDocumentation
 */

export { FRAMES } from '../../core/render/frame.js';
export { LOOKS } from '../../core/render/look.js';
export { randomSeed } from '../../core/seed.js';
export { CENTER, FRAME_COUNT, GRID_SIZE, grid, SMALL_GRID_SIZE, smallGrid } from './grid/index.js';
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
