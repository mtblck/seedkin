import type { Holiday } from '../../core/types.js';
import type { Outfit } from './types.js';

export type { Holiday } from '../../core/types.js';

/**
 * Holiday outfits, in calendar order: a background, grid, shirt (screen) and
 * accent, like `PALETTES`. Skin and hair stay the seed's own, and every
 * background stands out from every skin tone. A seed never picks one: pass it
 * as the `palette` option, e.g. `noggin(id, { palette: HOLIDAY_PALETTES.halloween })`.
 * Recolouring one changes every Noggin drawn with it, so like any palette
 * change that is a major version.
 */
export const HOLIDAY_PALETTES: Readonly<Record<Holiday, Outfit>> = Object.freeze({
  newYear: Object.freeze({ name: "New Year's", bg: '#0c0f1f', grid: '#1a1e36', screen: '#ffd75e', accent: '#e8175d' }),
  valentines: Object.freeze({
    name: "Valentine's",
    bg: '#3d0a1c',
    grid: '#4f1428',
    screen: '#e0245e',
    accent: '#ffb3c7',
  }),
  stPatricks: Object.freeze({
    name: "St Patrick's",
    bg: '#0b2a15',
    grid: '#15381f',
    screen: '#1f9e4a',
    accent: '#ffd700',
  }),
  fourthOfJuly: Object.freeze({
    name: 'Fourth of July',
    bg: '#0f1a3a',
    grid: '#1b2a55',
    screen: '#d7263d',
    accent: '#6ea8ff',
  }),
  halloween: Object.freeze({ name: 'Halloween', bg: '#160f1f', grid: '#241a33', screen: '#f07a1a', accent: '#8a4fff' }),
  christmas: Object.freeze({ name: 'Christmas', bg: '#0f2418', grid: '#1a3524', screen: '#c8323c', accent: '#f2c14e' }),
});
