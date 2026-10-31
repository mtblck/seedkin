import type { Outfit, Palette, SkinTone } from './types.js';

/**
 * Noggin outfits: the background, grid, shirt (screen) and accent (cheeks,
 * glasses, hats). Skin and hair come from their own lists.
 */
export const PALETTES: readonly Outfit[] = Object.freeze(
  [
    { name: 'Teal', bg: '#14202a', grid: '#1f2e3b', screen: '#2bb3a3', accent: '#ff8a7a' },
    { name: 'Coral', bg: '#fdf1e7', grid: '#f3e1d1', screen: '#ff6f61', accent: '#e0567a' },
    { name: 'Navy', bg: '#e8eef8', grid: '#d6e0f0', screen: '#2c3e75', accent: '#e0567a' },
    { name: 'Mustard', bg: '#1d1a12', grid: '#2c271b', screen: '#e0a526', accent: '#ff8a7a' },
    { name: 'Violet', bg: '#17142a', grid: '#241f3d', screen: '#7c5cd6', accent: '#ff9ab0' },
    { name: 'Leaf', bg: '#f4f8ec', grid: '#e4eed4', screen: '#4f9a4a', accent: '#e0567a' },
  ].map((p) => Object.freeze(p)),
);

/** Skin tones from lightest to deepest, each with an eye and mouth colour that reads on it. */
export const SKIN_TONES: readonly SkinTone[] = Object.freeze(
  [
    { name: 'Tone 1', body: '#ffe0cc', glow: '#3a2418' },
    { name: 'Tone 2', body: '#f5c9a6', glow: '#3a2418' },
    { name: 'Tone 3', body: '#e2ab82', glow: '#2e1b10' },
    { name: 'Tone 4', body: '#c98e5c', glow: '#24140a' },
    { name: 'Tone 5', body: '#a8703f', glow: '#160b05' },
    { name: 'Tone 6', body: '#8a5530', glow: '#0c0603' },
    { name: 'Tone 7', body: '#6e4123', glow: '#050302' },
  ].map((s) => Object.freeze(s)),
);

/** Hair colours: black, browns, auburn, blond, grey, and two dyed. */
export const HAIR_COLOURS: readonly string[] = Object.freeze([
  '#1f1a17',
  '#5a3825',
  '#a0482a',
  '#e6c15a',
  '#c4c4cc',
  '#ff7eb6',
  '#5a8dee',
]);

/** Relative luminance of a #rrggbb colour. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG contrast ratio between two #rrggbb colours.
 *
 * @param a - A colour
 * @param b - Another colour
 * @returns From 1 to 21
 */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Puts a Noggin's skin, hair and outfit together into one palette.
 *
 * @param outfit - Index into `PALETTES`
 * @param skin - Index into `SKIN_TONES`
 * @param hair - Index into `HAIR_COLOURS`
 * @returns The palette to draw with
 */
export function paletteFor(outfit: number, skin: number, hair: number): Palette {
  const o = PALETTES[outfit] as Outfit;
  const s = SKIN_TONES[skin] as SkinTone;
  return { ...o, body: s.body, glow: s.glow, shade: HAIR_COLOURS[hair] as string };
}

/** A #rrggbb colour with each channel scaled by `f`, so the same hue, deeper. */
function deepen(hex: string, f: number): string {
  const channel = (i: number): string =>
    Math.round(Number.parseInt(hex.slice(i, i + 2), 16) * f)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}

/**
 * Deepens a palette's background and grid, keeping their hue, until the face
 * stands out from it (the 1.5 contrast a seed's own outfits keep), so a light
 * outfit still frames the lightest skin tones.
 *
 * @param p - A palette whose body is the skin
 * @returns The palette, with its background deepened if it had to be
 */
export function standOut(p: Palette): Palette {
  for (let f = 1; f > 0; f -= 0.05) {
    const bg = deepen(p.bg, f);
    if (contrast(p.body, bg) >= 1.5) return f === 1 ? p : { ...p, bg, grid: deepen(p.grid, f) };
  }
  return { ...p, bg: '#000000', grid: '#000000' };
}
