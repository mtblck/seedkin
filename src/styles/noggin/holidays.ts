import type { Holiday } from '../../core/types.js';
import type { Outfit } from './types.js';

export type { Holiday } from '../../core/types.js';

/**
 * Holiday outfits, in calendar order: a light background, grid, shirt (screen)
 * and accent, like `PALETTES`. Skin and hair stay the seed's own; where a skin
 * tone wouldn't stand out from the background, it's drawn a deeper shade of
 * the same colour. A seed never picks one: pass it as the `palette` option,
 * e.g. `noggin(id, { palette: HOLIDAY_PALETTES.halloween })`. Recolouring one
 * changes every Noggin drawn with it, so like any palette change that is a
 * major version.
 */
export const HOLIDAY_PALETTES: Readonly<Record<Holiday, Outfit>> = Object.freeze({
  newYear: Object.freeze({ name: "New Year's", bg: '#d6dbf0', grid: '#c5cbe6', screen: '#2c3a8c', accent: '#e8175d' }),
  valentines: Object.freeze({
    name: "Valentine's",
    bg: '#ffd6e2',
    grid: '#f9c2d2',
    screen: '#e0245e',
    accent: '#b81c4c',
  }),
  stPatricks: Object.freeze({
    name: "St Patrick's",
    bg: '#d4efd6',
    grid: '#c0e5c4',
    screen: '#1f9e4a',
    accent: '#e0a800',
  }),
  fourthOfJuly: Object.freeze({
    name: 'Fourth of July',
    bg: '#d6e0f5',
    grid: '#c3d1ee',
    screen: '#d7263d',
    accent: '#2c4fa8',
  }),
  halloween: Object.freeze({ name: 'Halloween', bg: '#e6d9f2', grid: '#d8c6ea', screen: '#f07a1a', accent: '#6a38d1' }),
  christmas: Object.freeze({ name: 'Christmas', bg: '#d9ece0', grid: '#c6e2d0', screen: '#c8323c', accent: '#e0a800' }),
});
