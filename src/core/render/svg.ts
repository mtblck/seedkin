import type { Settled } from '../options.js';
import { type Palette, Role, type RoleGrid, type Shape } from '../types.js';
import { cellStyle, type Outline, padding } from './cell.js';
import { framed, frameFit } from './frame.js';
import { inkFor, innerLines, silhouette } from './ink.js';
import { lookCell, softExtras, stickerGroup } from './look.js';
import { paintAttrs, pathData } from './path.js';

/** One still avatar, ready to draw. */
export interface Picture {
  cells: RoleGrid;
  shape: Shape;
  palette: Palette;
  /** Draw the palette's background. */
  background: boolean;
  /** Accessible name; `null` marks the image decorative. */
  title: string | null;
}

/** Escapes text for an XML attribute or text node. */
export const escapeXml = (s: string): string => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

/**
 * Maps each role to its palette colour.
 *
 * @param p - The palette
 * @returns A colour for every role but empty
 */
export function roleColours(p: Palette): Record<number, string> {
  return {
    [Role.Body]: p.body,
    [Role.Screen]: p.screen,
    [Role.Glow]: p.glow,
    [Role.Accent]: p.accent,
    [Role.Shade]: p.shade,
  };
}

/**
 * Wraps drawn cells in the SVG document: the frame, background, size and accessible name.
 *
 * @param pic - The picture, for its shape, palette and title
 * @param s - Settled options
 * @param fit - The frame's fit
 * @param cells - The drawn cells
 * @param css - A `<style>` to put first, if any
 * @returns A standalone SVG document
 */
export function svgDocument(
  pic: Picture,
  s: Settled,
  fit: ReturnType<typeof frameFit>,
  cells: string,
  css = '',
): string {
  const n = pic.cells.length;
  const pad = padding(pic.shape);
  const span = n + 2 * pad;
  const a11y = pic.title === null ? 'aria-hidden="true"' : `role="img" aria-label="${escapeXml(pic.title)}"`;
  const body = framed(s.frame, fit, n, pad, pic.background ? pic.palette.bg : null, cells);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${span} ${span}" width="${s.size}" height="${s.size}" ${a11y}>${css}${body}</svg>`;
}

/**
 * Draws a grid of roles as a standalone SVG: one path per colour, in the
 * cell shape and look, inside the frame. Small avatars draw touching cells.
 *
 * @param pic - The cells, shape, palette and title
 * @param s - Settled size, detail, grid and frame
 * @returns A standalone SVG document
 */
export function stillSvg(pic: Picture, s: Settled): string {
  const p = pic.palette;
  const colours = roleColours(p);
  const n = pic.cells.length;
  const pad = padding(pic.shape);
  const fit = frameFit(s.frame, pic.shape, n, pad);
  const reach = s.showGrid ? fit.reach : 0;
  const g = pic.cells.map((row) => row.map((r) => (r === Role.Empty ? null : (colours[r] as string))));
  const { under, over } = softExtras(s.look, pic.shape, g);
  const byColour = new Map<string, Outline[]>();
  const drawn: Outline[] = [];
  for (let y = -reach; y < n + reach; y++) {
    for (let x = -reach; x < n + reach; x++) {
      const role = pic.cells[y]?.[x] ?? Role.Empty;
      if (role === Role.Empty && !(s.showGrid && fit.holds(x, y))) continue;
      const fill = role === Role.Empty ? p.grid : (colours[role] as string);
      const list = byColour.get(fill) ?? [];
      const cell = lookCell(s.look, pic.shape, g, x, y, s.isSmall);
      list.push(cell);
      byColour.set(fill, list);
      if (role !== Role.Empty) drawn.push(cell);
    }
  }
  const style = cellStyle(pic.shape, s.isSmall || s.look !== 'gapped');
  const paths = (m: Map<string, Outline[]>, colour: string): string => {
    const list = m.get(colour);
    return list ? `<path ${paintAttrs(colour, style.paint)} d="${pathData(list)}"/>` : '';
  };
  let cells = '';
  // The grid first, so the picture paints over it.
  const order = [...byColour.keys()].sort((a, b) => Number(b === p.grid) - Number(a === p.grid));
  for (const colour of under.keys()) cells += paths(under, colour);
  for (const colour of order) cells += paths(byColour, colour);
  for (const colour of over.keys()) cells += paths(over, colour);
  if (style.attrs && cells) cells = `<g ${style.attrs}>${cells}</g>`;
  const ink = inkFor(p.shade);
  cells = silhouette(s.look, pic.shape === 'circle', pathData(drawn), ink) + cells;
  cells += innerLines(s.look, pic.shape, g, ink);
  if (s.look === 'sticker' && cells) cells = stickerGroup(n, cells);
  return svgDocument(pic, s, fit, cells);
}
