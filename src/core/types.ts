/** The cell shape an avatar is drawn with. */
export type Shape = 'square' | 'circle' | 'triangle' | 'diamond';

/** The outline of the background an avatar sits in. */
export type Frame = 'square' | 'rounded' | 'squircle' | 'circle';

/**
 * How cells are drawn: `gapped` cells over a faint grid, or one of the
 * gapless looks, where touching cells merge into flat shapes.
 */
export type Look = 'gapped' | 'flat' | 'inked' | 'soft' | 'soft-inked' | 'sticker';

/** How much detail an avatar is drawn with: the 15x15 grid, the simpler 9x9 one, or the size's pick. */
export type Detail = 'auto' | 'full' | 'small';

/**
 * What a grid cell is part of. Each role maps to one palette colour, so a
 * palette can restyle an avatar without touching its layout.
 */
export const Role = {
  Empty: 0,
  Body: 1,
  Screen: 2,
  Glow: 3,
  Accent: 4,
  Shade: 5,
} as const;
export type Role = (typeof Role)[keyof typeof Role];

/** A grid of roles, indexed `[row][column]`. */
export type RoleGrid = Role[][];

/** The colours one avatar is painted with. All values are CSS colours. */
export interface Palette {
  name: string;
  /** Square behind the avatar. */
  bg: string;
  /** Empty grid cells, when the grid is shown. */
  grid: string;
  body: string;
  /** Body edge, ears and neck. */
  shade: string;
  /** Face screen behind the eyes and mouth. */
  screen: string;
  /** Eyes and mouth on a screen. */
  glow: string;
  /** Antenna tips, bolts, cheeks and other details. */
  accent: string;
}

/** The holidays every style has a palette for, in calendar order. */
export type Holiday = 'newYear' | 'valentines' | 'stPatricks' | 'fourthOfJuly' | 'halloween' | 'christmas';
