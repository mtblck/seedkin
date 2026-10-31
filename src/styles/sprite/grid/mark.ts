import { MARKS } from '../parts.js';
import type { Mark } from '../types.js';
import { type Anchor, type Canvas, type Drawn, Role } from './draw.js';

type Cell = readonly [number, number];

const DOT: Cell[] = [[0, 0]];
const BAR: Cell[] = [
  [-1, 0],
  [0, 0],
  [1, 0],
];

/** Each mark's cells, centred two rows above the eyes. */
const CELLS: Record<Mark, Cell[]> = {
  none: [],
  dot: DOT,
  bar: BAR,
  chevron: [
    [-1, -1],
    [0, 0],
    [1, -1],
  ],
  plus: [
    [0, -1],
    [-1, 0],
    [0, 0],
    [1, 0],
    [0, 1],
  ],
  twin: [
    [-1, 0],
    [1, 0],
  ],
};

/** The 9x9 grid only has room for a dot or a bar. */
const SMALL: Record<Mark, Cell[]> = { none: [], dot: DOT, plus: DOT, bar: BAR, chevron: BAR, twin: BAR };

const fits = (c: Canvas, at: Anchor, cells: Cell[], lift: number): boolean =>
  cells.every(([mx, my]) => c.cells[at.y - 2 - lift + my]?.[at.x + mx] === Role.Body);

/** How far above its usual place a mark sits so it fits every frame, or `undefined` if it fits nowhere. */
const liftFor = (cells: Cell[], frames: readonly Drawn[]): number | undefined =>
  [0, 1, 2].find((n) => frames.every((f) => fits(f.c, f.at, cells, n)));

/**
 * The marks that fit on a form at full size, so a seed only picks one that shows.
 *
 * @param frames - All four full-size frames of the form, before any face
 * @returns `'none'` and every mark that fits
 */
export function marksThatFit(frames: readonly Drawn[]): Mark[] {
  return MARKS.filter((m) => m === 'none' || liftFor(CELLS[m], frames) !== undefined);
}

/**
 * Paints a mark on the forehead, in the accent colour. It goes two rows above
 * the eyes, or up to two rows higher, wherever all of it lands on plain body
 * in every frame, so it never hangs off the edge or blinks as the Sprite moves.
 * When it fits nowhere, the Sprite goes without.
 *
 * @param c - The frame being drawn, face already painted
 * @param at - That frame's face anchor
 * @param mark - The mark
 * @param frames - All four frames of the form, before any face
 * @param small - Drawing the 9x9 Sprite
 */
export function paintMark(c: Canvas, at: Anchor, mark: Mark, frames: readonly Drawn[], small: boolean): void {
  const cells = (small ? SMALL : CELLS)[mark];
  if (cells.length === 0) return;
  const lift = liftFor(cells, frames);
  if (lift === undefined) return;
  for (const [mx, my] of cells) c.paint(at.x + mx, at.y - 2 - lift + my, Role.Accent);
}
