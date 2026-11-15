/**
 * A 64x64 canvas drawn from shapes rather than hand-placed cells. Each cell
 * holds a material, a tone (-2 line, -1 shadow, 0 base, 1 light) and the
 * order it was painted in, so edges between overlapping parts can be inked.
 */

/** Tests whether the cell at (x, y) is inside a shape. */
export type Shape = (x: number, y: number) => boolean;

/** Material name to base colour. */
export type Colours = Record<string, string>;

export interface Pix {
  w: number;
  h: number;
  m: string[][];
  tone: number[][];
  z: number[][];
  /** The moving part each cell belongs to (`''` holds still); see `motion.ts`. */
  part: string[][];
  /** What a moving cell covered, `[material, tone]`, shown when it squashes. */
  lid: ([string, number] | null)[][];
  /** The part being drawn now. */
  current: string;
  set: (x: number, y: number, m: string, tone?: number) => void;
  get: (x: number, y: number) => string;
  /** Paints every cell inside `shape` as one new layer. */
  fill: (shape: Shape, m: string, tone?: number) => void;
  /** Repaints the cells of a layer that are inside `shape`; `when` limits it to cells already of those materials. */
  over: (shape: Shape, m: string, when: readonly string[], tone?: number) => void;
}

/** A blank canvas, 64x64 unless asked otherwise. */
export function createPix(w = 64, h = 64): Pix {
  const grid = <T>(v: T): T[][] => Array.from({ length: h }, () => new Array<T>(w).fill(v));
  let layer = 0;
  const p: Pix = {
    w,
    h,
    m: grid(''),
    tone: grid(0),
    z: grid(0),
    part: grid(''),
    lid: grid<[string, number] | null>(null),
    current: '',
    set: (x, y, m, tone = 0) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const was = (p.m[y] as string[])[x] as string;
      const row = p.lid[y] as ([string, number] | null)[];
      if (p.current === '') row[x] = null;
      else if ((p.part[y] as string[])[x] !== p.current && was !== '')
        row[x] = [was, (p.tone[y] as number[])[x] as number];
      (p.part[y] as string[])[x] = p.current;
      (p.m[y] as string[])[x] = m;
      (p.tone[y] as number[])[x] = tone;
      (p.z[y] as number[])[x] = layer;
    },
    get: (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? '' : ((p.m[y] as string[])[x] as string)),
    fill: (shape, m, tone = 0) => {
      layer++;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (shape(x, y)) p.set(x, y, m, tone);
    },
    over: (shape, m, when, tone = 0) => {
      layer++;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) if (shape(x, y) && when.includes(p.get(x, y))) p.set(x, y, m, tone);
      }
    },
  };
  return p;
}

/** An ellipse centred at (cx, cy), measured to cell centres. */
export const ellipse =
  (cx: number, cy: number, rx: number, ry: number): Shape =>
  (x, y) =>
    ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;

/** Cells from (x0, y0) to (x1, y1), inclusive. */
export const rect =
  (x0: number, y0: number, x1: number, y1: number): Shape =>
  (x, y) =>
    x >= x0 && x <= x1 && y >= y0 && y <= y1;

/** Cells inside every one of the shapes. */
export const and =
  (...s: Shape[]): Shape =>
  (x, y) =>
    s.every((f) => f(x, y));
/** Cells inside any of the shapes. */
export const or =
  (...s: Shape[]): Shape =>
  (x, y) =>
    s.some((f) => f(x, y));
/** Cells outside the shape. */
export const not =
  (s: Shape): Shape =>
  (x, y) =>
    !s(x, y);
/** A shape and its mirror across the canvas's vertical centre line. */
export const sym =
  (s: Shape, w = 64): Shape =>
  (x, y) =>
    s(x, y) || s(w - 1 - x, y);

export { colourOf, mix } from './colour.js';
export { ink, shadeRuns } from './shading.js';

/** A rectangle of half-size (hx, hy) centred at (cx, cy), with corners rounded to radius r. */
export const rounded =
  (cx: number, cy: number, hx: number, hy: number, r: number): Shape =>
  (x, y) => {
    const dx = Math.max(Math.abs(x + 0.5 - cx) - (hx - r), 0);
    const dy = Math.max(Math.abs(y + 0.5 - cy) - (hy - r), 0);
    return Math.abs(x + 0.5 - cx) <= hx && Math.abs(y + 0.5 - cy) <= hy && dx * dx + dy * dy <= r * r;
  };

/** A triangle through three points, measured to cell centres. */
export const tri =
  (ax: number, ay: number, bx: number, by: number, cx: number, cy: number): Shape =>
  (x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;
    const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
    const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
    const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
