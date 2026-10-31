import { type Canvas, createCanvas } from '../../../core/canvas.js';
import { Role } from '../../../core/types.js';

/** Where a form puts its face: the centre column, the eyes' distance from it, and the eye row. */
export interface Anchor {
  x: number;
  dx: number;
  y: number;
  /** Rows to move the mouth down, to clear something between it and the eyes. */
  mouthDy?: number;
}

/** One frame of a form: its cells and where the face goes. */
export interface Drawn {
  c: Canvas;
  at: Anchor;
}

/** Draws frame `f` (0-3) of a form, without its face. */
export type Draw = (f: number) => Drawn;

/** A form drawn on both grids. */
export interface Form {
  full: Draw;
  small: Draw;
}

/** Fills cells `xl`..`xr` on row `y`, with the two end cells in `edge`. */
export function span(
  c: Canvas,
  y: number,
  xl: number,
  xr: number,
  fill: Role = Role.Body,
  edge: Role = Role.Shade,
): void {
  for (let x = xl; x <= xr; x++) c.paint(x, y, x === xl || x === xr ? edge : fill);
}

/**
 * Fills a blob row by row from half-widths about the centre, each row
 * nudged sideways by `shift(i)` columns: how a flame's tip sways.
 */
export function rows(
  c: Canvas,
  top: number,
  widths: readonly number[],
  shift: (i: number) => number = () => 0,
  fill: Role = Role.Body,
  edge: Role = Role.Shade,
): void {
  widths.forEach((w, i) => {
    const m = c.center + shift(i);
    span(c, top + i, m - w, m + w, fill, edge);
  });
}

type Cells = (readonly [number, number])[];

/** Paints a list of `[x, y]` cells in one role. */
export function dots(c: Canvas, cells: Cells, role: Role): void {
  for (const [x, y] of cells) c.paint(x, y, role);
}

/**
 * Parses frames of cells written as `"x,y x,y | x,y"`: one group per frame,
 * so mote paths stay one line each.
 */
export function frames(s: string): Cells[] {
  return s.split('|').map((g) =>
    g
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((xy) => xy.split(',').map(Number) as [number, number]),
  );
}

const SWAY = [0, 1, 0, -1] as const;
/** Sideways sway for frame `f`: 0, 1, 0, -1. */
export const sway = (f: number): number => SWAY[f % 4] as number;
/** The item for frame `f`, cycling through the list. */
export const pick = <T>(list: readonly T[], f: number): T => list[f % list.length] as T;
/** An empty canvas of the given size. */
export const canvas = (size: number): Canvas => createCanvas(size);

const ROLES: Readonly<Record<string, Role>> = { '#': Role.Body, s: Role.Shade, o: Role.Screen, a: Role.Accent };

/**
 * Paints a picture drawn in text, one row per line: `#` body, `s` edge,
 * `o` screen, `a` accent, anything else left alone; shifted `dy` down and
 * `dx` across, which can differ row by row to lean the picture.
 */
export function art(c: Canvas, picture: string, dy = 0, dx: number | ((y: number) => number) = 0): void {
  picture
    .trim()
    .split(/\s+/)
    .forEach((row, y) => {
      const shift = typeof dx === 'number' ? dx : dx(y);
      [...row].forEach((ch, x) => {
        const role = ROLES[ch];
        if (role !== undefined) c.paint(x + shift, y + dy, role);
      });
    });
}

/** Moves a list of cells `dy` rows down (up when negative). */
export const lift = (cells: Cells, dy: number): Cells => cells.map(([x, y]) => [x, y + dy] as const);

export type { Canvas };
export { Role };
