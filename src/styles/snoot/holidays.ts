import type { Holiday } from '../../core/types.js';
import type { Palette } from './types.js';

export type { Holiday } from '../../core/types.js';

/**
 * Holiday coats, in calendar order, painted the way `PALETTES` are (body the fur,
 * screen the muzzle, glow the eyes and nose).
 * A seed never picks one: pass it as the `palette` option, e.g.
 * `snoot(id, { palette: HOLIDAY_PALETTES.halloween })`. Recolouring one changes
 * every Snoot drawn with it, so like any palette change that is a major version.
 */
export const HOLIDAY_PALETTES: Readonly<Record<Holiday, Palette>> = Object.freeze({
  newYear: Object.freeze({
    name: "New Year's",
    bg: '#0c0f1f',
    grid: '#1a1e36',
    body: '#b8bfcc',
    shade: '#8a92a6',
    screen: '#f4f1e6',
    glow: '#0c0f1f',
    accent: '#ffd75e',
  }),
  valentines: Object.freeze({
    name: "Valentine's",
    bg: '#ffe3ea',
    grid: '#fbcdd8',
    body: '#e0245e',
    shade: '#b81c4c',
    screen: '#ffd0dc',
    glow: '#3d0a1c',
    accent: '#ffb3c7',
  }),
  stPatricks: Object.freeze({
    name: "St Patrick's",
    bg: '#e6f5e1',
    grid: '#d1ecc9',
    body: '#1f9e4a',
    shade: '#187f3b',
    screen: '#d9f5c8',
    glow: '#0b2a15',
    accent: '#ffd700',
  }),
  fourthOfJuly: Object.freeze({
    name: 'Fourth of July',
    bg: '#0f1a3a',
    grid: '#1b2a55',
    body: '#d7263d',
    shade: '#ad1d31',
    screen: '#ffffff',
    glow: '#0f1a3a',
    accent: '#6ea8ff',
  }),
  halloween: Object.freeze({
    name: 'Halloween',
    bg: '#160f1f',
    grid: '#241a33',
    body: '#f07a1a',
    shade: '#c95f0c',
    screen: '#ffd9a8',
    glow: '#120a05',
    accent: '#8a4fff',
  }),
  christmas: Object.freeze({
    name: 'Christmas',
    bg: '#0f2418',
    grid: '#1a3524',
    body: '#c8323c',
    shade: '#a02631',
    screen: '#fff4e8',
    glow: '#1a0a0c',
    accent: '#f2c14e',
  }),
});
