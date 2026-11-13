/**
 * A colour canvas for portrait prototypes: unlike the 15x15 role grid, each
 * cell holds a material (skin, hair, cloth...) and every material has its own
 * three-step ramp, so the picture can shade without a new Role per tone.
 */

/** A material's base colour; shading derives the dark and light steps from it. */
export type Materials = Record<string, string>;

export interface Pixels {
  w: number;
  h: number;
  /** Material name per cell, or '' for empty (scene shows through). */
  cells: string[][];
  /** Shade step per cell: -1 dark, 0 base, 1 light. */
  tone: number[][];
  set: (x: number, y: number, m: string, tone?: number) => void;
  /** Sets a cell and its mirror across the vertical centre line. */
  mirror: (x: number, y: number, m: string, tone?: number) => void;
  /** Fills columns centre-half..centre+half-1 on row y (an even-width span). */
  span: (y: number, half: number, m: string, tone?: number) => void;
  get: (x: number, y: number) => string;
}

export function createPixels(w: number, h: number): Pixels {
  const cells = Array.from({ length: h }, () => new Array<string>(w).fill(''));
  const tone = Array.from({ length: h }, () => new Array<number>(w).fill(0));
  const p: Pixels = {
    w,
    h,
    cells,
    tone,
    set: (x, y, m, t = 0) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      (cells[y] as string[])[x] = m;
      (tone[y] as number[])[x] = t;
    },
    mirror: (x, y, m, t = 0) => {
      p.set(x, y, m, t);
      p.set(w - 1 - x, y, m, t);
    },
    span: (y, half, m, t = 0) => {
      for (let x = w / 2 - half; x < w / 2 + half; x++) p.set(x, y, m, t);
    },
    get: (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? '' : ((cells[y] as string[])[x] as string)),
  };
  return p;
}

/** Mixes two #rrggbb colours; t=0 is a, t=1 is b. */
export function mix(a: string, b: string, t: number): string {
  const ch = (h: string, i: number): number => Number.parseInt(h.slice(i, i + 2), 16);
  const out = [1, 3, 5].map((i) => Math.round(ch(a, i) * (1 - t) + ch(b, i) * t));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Shades every cell of the given materials with light from the upper left:
 * a cell whose right or lower neighbour is another material goes a step
 * darker, one whose upper and left neighbours both differ a step lighter.
 */
export function shade(p: Pixels, materials: readonly string[], ignore: readonly string[] = []): void {
  const only = new Set(materials);
  const skip = new Set(ignore);
  const next = p.tone.map((r) => [...r]);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const m = p.get(x, y);
      if (!only.has(m) || (p.tone[y] as number[])[x] !== 0) continue;
      const row = next[y] as number[];
      const other = (n: string): boolean => n !== m && !skip.has(n);
      if (other(p.get(x + 1, y)) || other(p.get(x, y + 1))) row[x] = -1;
      else if (other(p.get(x - 1, y)) && other(p.get(x, y - 1))) row[x] = 1;
    }
  }
  p.tone = next;
}

/** Draws a one-cell dark outline into the empty cells around everything drawn. */
export function outline(p: Pixels): void {
  const edge: [number, number][] = [];
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (p.get(x, y) !== '') continue;
      const near = [p.get(x - 1, y), p.get(x + 1, y), p.get(x, y - 1), p.get(x, y + 1)];
      if (near.some((m) => m !== '' && m !== 'ink')) edge.push([x, y]);
    }
  }
  for (const [x, y] of edge) p.set(x, y, 'ink');
}

/** The colour a cell paints with. */
export function colourOf(base: string, tone: number): string {
  if (tone < 0) return mix(base, '#1a1020', 0.28);
  if (tone > 0) return mix(base, '#fff6e0', 0.22);
  return base;
}

/**
 * Renders layers of pixels (first at the back) to an SVG string, merging
 * horizontal runs of one colour into a single rect.
 */
export function toSvg(layers: { p: Pixels; colours: Materials }[], scale = 1): string {
  const { w, h } = layers[0]?.p ?? { w: 0, h: 0 };
  const rects: string[] = [];
  for (const { p, colours } of layers) {
    for (let y = 0; y < h; y++) {
      let x = 0;
      while (x < w) {
        const m = p.get(x, y);
        if (m === '') {
          x++;
          continue;
        }
        const fill = colourOf(colours[m] ?? '#ff00ff', (p.tone[y] as number[])[x] as number);
        let end = x + 1;
        while (end < w && p.get(end, y) !== '' && colourOf(colours[p.get(end, y)] ?? '#ff00ff', (p.tone[y] as number[])[end] as number) === fill) end++;
        rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${fill}"/>`);
        x = end;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * scale}" height="${h * scale}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}
