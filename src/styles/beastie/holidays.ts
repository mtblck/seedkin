import type { Holiday } from '../../core/types.js';
import type { Palette } from './types.js';

export type { Holiday } from '../../core/types.js';

/**
 * Holiday hides, in calendar order, painted the way `PALETTES` are (screen the
 * mouth and pupils, glow the eye whites and teeth, accent the spots and wings).
 * A seed never picks one: pass it as the `palette` option, e.g.
 * `beastie(id, { palette: HOLIDAY_PALETTES.halloween })`. Recolouring one changes
 * every Beastie drawn with it, so like any palette change that is a major version.
 */
export const HOLIDAY_PALETTES: Readonly<Record<Holiday, Palette>> = Object.freeze({
  newYear: Object.freeze({
    name: "New Year's",
    bg: '#0c0f1f',
    grid: '#1a1e36',
    body: '#9aa3b8',
    shade: '#6f7790',
    screen: '#0c0f1f',
    glow: '#ffffff',
    accent: '#ffd75e',
  }),
  valentines: Object.freeze({
    name: "Valentine's",
    bg: '#ffe3ea',
    grid: '#fbcdd8',
    body: '#ff5c8a',
    shade: '#d12a5c',
    screen: '#3d0a1c',
    glow: '#ffffff',
    accent: '#a3124a',
  }),
  stPatricks: Object.freeze({
    name: "St Patrick's",
    bg: '#e6f5e1',
    grid: '#d1ecc9',
    body: '#2fb35a',
    shade: '#1a7f3b',
    screen: '#06180c',
    glow: '#ffffff',
    accent: '#ffd700',
  }),
  fourthOfJuly: Object.freeze({
    name: 'Fourth of July',
    bg: '#0f1a3a',
    grid: '#1b2a55',
    body: '#e8364b',
    shade: '#b51f33',
    screen: '#070c1f',
    glow: '#ffffff',
    accent: '#6ea8ff',
  }),
  halloween: Object.freeze({
    name: 'Halloween',
    bg: '#160f1f',
    grid: '#241a33',
    body: '#9a63ff',
    shade: '#6a38d1',
    screen: '#120a05',
    glow: '#ffffff',
    accent: '#f07a1a',
  }),
  christmas: Object.freeze({
    name: 'Christmas',
    bg: '#0f2418',
    grid: '#1a3524',
    body: '#2f9e4a',
    shade: '#1f6e33',
    screen: '#1a0a0c',
    glow: '#ffffff',
    accent: '#e0303a',
  }),
});
