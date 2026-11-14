import type { Pix } from './canvas.js';

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
  // An outline cell moves with its part when only that part touches it.
  for (const [x, y] of edge) {
    const near = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ].filter(([nx, ny]) => p.get(nx as number, ny as number) !== '' && p.get(nx as number, ny as number) !== 'ink');
    const parts = new Set(near.map(([nx, ny]) => (p.part[ny as number] as string[])[nx as number]));
    const was = p.current;
    p.current = parts.size === 1 ? ([...parts][0] as string) : '';
    p.set(x, y, 'ink');
    p.current = was;
  }
}
