import type { Holiday } from '../../core/types.js';
import type { Palette } from './types.js';

export type { Holiday } from '../../core/types.js';

/**
 * Holiday palettes, in calendar order. A seed never picks one: pass it as the
 * `palette` option, e.g. `botling(id, { palette: HOLIDAY_PALETTES.halloween })`.
 * Being outside {@link PALETTES}, a new holiday can be added without changing
 * any seed's everyday robot. Recolouring an existing one changes every robot
 * drawn with it, so like any palette change that is a major version.
 */
export const HOLIDAY_PALETTES: Readonly<Record<Holiday, Palette>> = Object.freeze({
  newYear: Object.freeze({
    name: "New Year's",
    bg: '#0c0f1f',
    grid: '#1a1e36',
    body: '#9aa3b8',
    shade: '#7c8499',
    screen: '#06070f',
    glow: '#ffd75e',
    accent: '#e8175d',
  }),
  valentines: Object.freeze({
    name: "Valentine's",
    bg: '#ffe3ea',
    grid: '#fbcdd8',
    body: '#e0245e',
    shade: '#b81c4c',
    screen: '#3d0a1c',
    glow: '#ffffff',
    accent: '#4a0e6b',
  }),
  stPatricks: Object.freeze({
    name: "St Patrick's",
    bg: '#e6f5e1',
    grid: '#d1ecc9',
    body: '#1f9e4a',
    shade: '#187f3b',
    screen: '#0b2a15',
    glow: '#ffd700',
    accent: '#ffb347',
  }),
  fourthOfJuly: Object.freeze({
    name: 'Fourth of July',
    bg: '#0f1a3a',
    grid: '#1b2a55',
    body: '#d7263d',
    shade: '#ad1d31',
    screen: '#070c1f',
    glow: '#ffffff',
    accent: '#6ea8ff',
  }),
  halloween: Object.freeze({
    name: 'Halloween',
    bg: '#160f1f',
    grid: '#241a33',
    body: '#f07a1a',
    shade: '#c95f0c',
    screen: '#120a05',
    glow: '#b8ff3d',
    accent: '#8a4fff',
  }),
  christmas: Object.freeze({
    name: 'Christmas',
    bg: '#0f2418',
    grid: '#1a3524',
    body: '#c8323c',
    shade: '#a02631',
    screen: '#0a140e',
    glow: '#fff4d6',
    accent: '#f2c14e',
  }),
});
