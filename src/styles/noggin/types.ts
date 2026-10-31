import type { CommonOptions } from '../../core/options.js';
import type { Palette, Shape } from '../../core/types.js';

export type { Detail, Frame, Look, Palette, RoleGrid, Shape } from '../../core/types.js';
export { Role } from '../../core/types.js';

export type Hair =
  | 'bald'
  | 'buzz'
  | 'short'
  | 'spiky'
  | 'bob'
  | 'long'
  | 'bun'
  | 'mohawk'
  | 'curly'
  | 'sidepart'
  | 'afro'
  | 'locs';
export type Eyes = 'dot' | 'tall' | 'happy' | 'wink' | 'closed';
export type Mouth = 'smile' | 'line' | 'open' | 'smirk';
export type Facial = 'none' | 'mustache' | 'beard';
export type Eyewear = 'none' | 'glasses' | 'shades';
export type Headwear = 'none' | 'beanie' | 'earring' | 'headband' | 'headscarf';

/** The background, grid, shirt and accent colours a Noggin wears. */
export type Outfit = Omit<Palette, 'body' | 'shade' | 'glow'>;

/** A skin tone, with the eye and mouth colour that reads on it. */
export interface SkinTone {
  name: string;
  body: string;
  glow: string;
}

/** Every choice that makes up one Noggin. */
export interface NogginTraits {
  /** Index into `SKIN_TONES`. */
  skin: number;
  /** Index into `PALETTES`, the outfits. */
  palette: number;
  /** Index into `HAIR_COLOURS`. */
  hairColour: number;
  hair: Hair;
  eyes: Eyes;
  mouth: Mouth;
  facial: Facial;
  eyewear: Eyewear;
  headwear: Headwear;
  /** Head half-width in cells, not counting the centre column. */
  halfWidth: number;
  hasBrows: boolean;
  hasCheeks: boolean;
  shape: Shape;
}

/** Options for `noggin()`. */
export interface NogginOptions extends CommonOptions {
  /** Cell shape. Default: picked by the seed. */
  shape?: Shape;
  /**
   * Index into `PALETTES` (the outfits); an outfit object, such as one of
   * `HOLIDAY_PALETTES`, worn over the seed's skin and hair; or a whole palette
   * object. Colours are hex. Default: picked by the seed.
   */
  palette?: number | Outfit | Palette;
  /** Index into `SKIN_TONES`. Default: picked by the seed. */
  skin?: number;
}
