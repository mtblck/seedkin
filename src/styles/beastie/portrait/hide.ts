import type { Pix, Shape } from '../../../core/portrait/canvas.js';

/** A spot's cells, each with what it painted over: `[x, y, material, tone, layer]`. */
export type Spot = [number, number, string, number, number][];

/** Of a spot's cells, the share something drawn later may cover before the spot is left off. */
const MOST = 0.25;

/**
 * Notes, before the spots are painted, which cells each spot will take and
 * what those cells hold, so {@link settleSpots} can put the hide back.
 *
 * @param p - The canvas, with the body drawn and no spots yet
 * @param shapes - One shape per spot
 * @returns Each spot's cells, with what is under them
 */
export function spotCells(p: Pix, shapes: readonly Shape[]): Spot[] {
  const taken = new Set<string>();
  return shapes.map((shape) => {
    const cells: Spot = [];
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        if (!shape(x, y) || p.get(x, y) !== 'body' || taken.has(`${x},${y}`)) continue;
        taken.add(`${x},${y}`);
        cells.push([x, y, 'body', p.tone[y]?.[x] ?? 0, p.z[y]?.[x] ?? 0]);
      }
    }
    return cells;
  });
}

/**
 * Settles the spots once the face and gear are on, as the avatar does: a
 * blink or a talk uncovers hide, never a spot hidden under the eyes or mouth,
 * and a spot that the face or gear mostly covers is left off, so no sliver
 * of it peeks out beside them. A spot too small to show colour inside an
 * outline goes without one.
 *
 * @param p - The drawn canvas, before shading and ink
 * @param spots - Each spot's cells, from {@link spotCells}
 */
export function settleSpots(p: Pix, spots: readonly Spot[]): void {
  for (const cells of spots) {
    const shows = cells.filter(([x, y]) => p.get(x, y) === 'accent' && p.part[y]?.[x] === '');
    const drop = cells.length > 0 && shows.length < cells.length * (1 - MOST);
    // A spot with no cell clear of its edge would ink to a dark smudge: it sits in the body's own layer instead, unlined.
    const seen = new Set(shows.map(([x, y]) => `${x},${y}`));
    const flat = !shows.some(([x, y]) =>
      [`${x - 1},${y}`, `${x + 1},${y}`, `${x},${y - 1}`, `${x},${y + 1}`].every((k) => seen.has(k)),
    );
    for (const [x, y, m, tone, z] of cells) {
      const lid = p.lid[y];
      if (lid?.[x]?.[0] === 'accent') lid[x] = [m, tone];
      if (p.get(x, y) !== 'accent' || p.part[y]?.[x] !== '') continue;
      if (drop) {
        (p.m[y] as string[])[x] = m;
        (p.tone[y] as number[])[x] = tone;
      }
      if (drop || flat) (p.z[y] as number[])[x] = z;
    }
  }
}

/**
 * Lets the cells of moving parts inside `shape` uncover `m` where they would
 * have uncovered one of `when`, for something worn over the hide that a
 * mouth sits on: a talk then shows the bandana, not the hide under it.
 *
 * @param p - The canvas
 * @param shape - Where the new material lies
 * @param m - The material
 * @param when - The materials it replaces
 */
export function coverLids(p: Pix, shape: Shape, m: string, when: readonly string[]): void {
  for (let y = 0; y < p.h; y++) {
    const lid = p.lid[y] as ([string, number] | null)[];
    for (let x = 0; x < p.w; x++) {
      const was = lid[x];
      if (was && shape(x, y) && when.includes(was[0])) lid[x] = [m, 0];
    }
  }
}
