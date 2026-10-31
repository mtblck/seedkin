import type { Holiday } from '../../core/types.js';
import type { Palette } from './types.js';

export type { Holiday } from '../../core/types.js';

/**
 * Holiday palettes, in calendar order, painted the way `PALETTES` are (screen the
 * bright core, glow the face, accent the motes and cheeks). Any form can wear one.
 * A seed never picks one: pass it as the `palette` option, e.g.
 * `sprite(id, { palette: HOLIDAY_PALETTES.halloween })`. Recolouring one changes
 * every Sprite drawn with it, so like any palette change that is a major version.
 */
export const HOLIDAY_PALETTES: Readonly<Record<Holiday, Palette>> = Object.freeze({
  newYear: Object.freeze({
    name: "New Year's",
    bg: '#0c0f1f',
    grid: '#1a1e36',
    body: '#ffd75e',
    shade: '#d9a521',
    screen: '#fff6c9',
    glow: '#1a1206',
    accent: '#e8175d',
  }),
  valentines: Object.freeze({
    name: "Valentine's",
    bg: '#ffe3ea',
    grid: '#fbcdd8',
    body: '#ff4f86',
    shade: '#d1235c',
    screen: '#ffd6e2',
    glow: '#3d0a1c',
    accent: '#e0245e',
  }),
  stPatricks: Object.freeze({
    name: "St Patrick's",
    bg: '#e6f5e1',
    grid: '#d1ecc9',
    body: '#2fb35a',
    shade: '#1f8a42',
    screen: '#d6ffc4',
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
    glow: '#1a0508',
    accent: '#6ea8ff',
  }),
  halloween: Object.freeze({
    name: 'Halloween',
    bg: '#160f1f',
    grid: '#241a33',
    body: '#f07a1a',
    shade: '#c95f0c',
    screen: '#ffd25e',
    glow: '#1a0a02',
    accent: '#b8ff3d',
  }),
  christmas: Object.freeze({
    name: 'Christmas',
    bg: '#0f2418',
    grid: '#1a3524',
    body: '#c8323c',
    shade: '#a02631',
    screen: '#fff4d6',
    glow: '#1a0507',
    accent: '#f2c14e',
  }),
});
