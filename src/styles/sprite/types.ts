import type { CommonOptions } from '../../core/options.js';
import type { Palette, Shape } from '../../core/types.js';

export type { Detail, Frame, Look, Palette, RoleGrid, Shape } from '../../core/types.js';
export { Role } from '../../core/types.js';

export type Element = 'fire' | 'water' | 'earth' | 'wind' | 'space';
export type Form =
  | 'flame'
  | 'wisp'
  | 'ember'
  | 'drop'
  | 'bubble'
  | 'jelly'
  | 'boulder'
  | 'crystal'
  | 'mushroom'
  | 'puff'
  | 'tornado'
  | 'leaf'
  | 'planet'
  | 'star'
  | 'comet';
export type Eyes = 'dots' | 'tiny' | 'round' | 'happy' | 'sleepy' | 'wink';
export type Mouth = 'none' | 'dot' | 'smile' | 'grin';

/** Every choice that makes up one Sprite. */
export interface SpriteTraits {
  element: Element;
  form: Form;
  /** Index into `PALETTES`. */
  palette: number;
  eyes: Eyes;
  mouth: Mouth;
  hasBlush: boolean;
  /** Drawn facing the other way: flames lean, wind blows and highlights fall from the right. */
  isMirrored: boolean;
  /** Milliseconds each of the four animation frames holds. */
  beats: number[];
  shape: Shape;
}

/** Options for `sprite()`. */
export interface SpriteOptions extends CommonOptions {
  /** The element: `'fire'`, `'water'`, `'earth'`, `'wind'` or `'space'`. Default: picked by the seed. */
  element?: Element;
  /** Cell shape. Default `'square'`. */
  shape?: Shape;
  /** Index into `PALETTES`, or a palette object with hex colours. Default: picked by the seed, from its element's. */
  palette?: number | Palette;
}
