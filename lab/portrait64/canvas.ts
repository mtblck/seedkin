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
  set: (x: number, y: number, m: string, tone?: number) => void;
  get: (x: number, y: number) => string;
  /** Paints every cell inside `shape` as one new layer. */
  fill: (shape: Shape, m: string, tone?: number) => void;
  /** Repaints the cells of a layer that are inside `shape`; `when` limits it to cells already of those materials. */
  over: (shape: Shape, m: string, when: readonly string[], tone?: number) => void;
}

export function createPix(w = 64, h = 64): Pix {
  const grid = <T>(v: T): T[][] => Array.from({ length: h }, () => new Array<T>(w).fill(v));
  let layer = 0;
  const p: Pix = {
    w,
    h,
    m: grid(''),
    tone: grid(0),
    z: grid(0),
    set: (x, y, m, tone = 0) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
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

export const and =
  (...s: Shape[]): Shape =>
  (x, y) =>
    s.every((f) => f(x, y));
export const or =
  (...s: Shape[]): Shape =>
  (x, y) =>
    s.some((f) => f(x, y));
export const not =
  (s: Shape): Shape =>
  (x, y) =>
    !s(x, y);
/** A shape and its mirror across the canvas's vertical centre line. */
export const sym =
  (s: Shape, w = 64): Shape =>
  (x, y) =>
    s(x, y) || s(w - 1 - x, y);

/**
 * Flat two-step shading, lit from the upper left: in each row, the right
 * part of a material's run goes dark, and the left part of its upper rows
 * goes light. Cells already given a tone keep it.
 */
export function shadeRuns(p: Pix, mats: readonly string[], dark = 0.3, light = 0.22): void {
  for (const mat of mats) {
    let top = -1;
    let bottom = -1;
    for (let y = 0; y < p.h; y++) {
      if ((p.m[y] as string[]).includes(mat)) {
        if (top < 0) top = y;
        bottom = y;
      }
    }
    for (let y = top; y >= 0 && y <= bottom; y++) {
      const row = p.m[y] as string[];
      const x0 = row.indexOf(mat);
      const x1 = row.lastIndexOf(mat);
      const upper = (y - top) / Math.max(1, bottom - top) < 0.45;
      for (let x = x0; x <= x1; x++) {
        if (row[x] !== mat || (p.tone[y] as number[])[x] !== 0) continue;
        const t = (x - x0 + 0.5) / (x1 - x0 + 1);
        if (t > 1 - dark) (p.tone[y] as number[])[x] = -1;
        else if (upper && t < light) (p.tone[y] as number[])[x] = 1;
      }
    }
  }
}

/**
 * Inks the edges between parts: a cell painted over a different material
 * (not one of `skip`) turns into a line in its own colour. Then an outer
 * outline goes into the empty cells around the figure.
 */
export function ink(p: Pix, skip: readonly string[]): void {
  const lines: [number, number][] = [];
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const m = p.get(x, y);
      if (m === '' || skip.includes(m)) continue;
      const z = (p.z[y] as number[])[x] as number;
      for (const [nx, ny] of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ] as const) {
        const n = p.get(nx, ny);
        if (n !== '' && n !== m && !skip.includes(n) && ((p.z[ny] as number[])[nx] as number) < z) {
          lines.push([x, y]);
          break;
        }
      }
    }
  }
  for (const [x, y] of lines) (p.tone[y] as number[])[x] = -2;
  const edge: [number, number][] = [];
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (p.get(x, y) !== '') continue;
      if ([p.get(x - 1, y), p.get(x + 1, y), p.get(x, y - 1), p.get(x, y + 1)].some((n) => n !== '' && n !== 'ink'))
        edge.push([x, y]);
    }
  }
  for (const [x, y] of edge) p.set(x, y, 'ink');
}

/** Mixes two #rrggbb colours; t=0 is a, t=1 is b. */
export function mix(a: string, b: string, t: number): string {
  const ch = (h: string, i: number): number => Number.parseInt(h.slice(i, i + 2), 16);
  const out = [1, 3, 5].map((i) => Math.round(ch(a, i) * (1 - t) + ch(b, i) * t));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** The colour a cell paints with: warm purple shadows and lines, cream light. */
export function colourOf(base: string, tone: number): string {
  if (tone <= -2) return mix(base, '#160c18', 0.62);
  if (tone < 0) return mix(base, '#2a1530', 0.24);
  if (tone > 0) return mix(base, '#fff2d8', 0.2);
  return base;
}

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
