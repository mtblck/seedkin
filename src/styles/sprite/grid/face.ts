import type { Eyes, Mouth } from '../types.js';
import { type Anchor, type Canvas, Role } from './draw.js';

/** What a face is made of. */
export interface Face {
  eyes: Eyes;
  mouth: Mouth;
  hasBlush: boolean;
}

type Cell = readonly [number, number];

/** The eye cells left of centre, as offsets from the anchor; the right eye mirrors them. */
const eyeCells = (eyes: Eyes, dx: number): Cell[] => {
  const inner = Math.max(dx - 1, 1);
  switch (eyes) {
    case 'round':
      return [
        [inner, 0],
        [inner + 1, 0],
        [inner, 1],
        [inner + 1, 1],
      ];
    case 'happy':
      return [
        [dx, 0],
        [dx - 1, 1],
        [dx + 1, 1],
      ];
    case 'close':
      return [
        [inner, 0],
        [inner, 1],
      ];
    case 'tiny':
      return [[dx, 1]];
    case 'sleepy':
      return [
        [inner, 1],
        [inner + 1, 1],
      ];
    default:
      return [
        [dx, 0],
        [dx, 1],
      ];
  }
};

const MOUTH_CELLS: Record<Mouth, Cell[]> = {
  none: [],
  dot: [[0, 3]],
  smile: [
    [-1, 3],
    [1, 3],
    [0, 4],
  ],
  open: [
    [-1, 3],
    [0, 3],
    [1, 3],
    [0, 4],
  ],
  smirk: [
    [-1, 4],
    [0, 4],
    [1, 3],
  ],
  oh: [
    [0, 3],
    [0, 4],
  ],
  grin: [
    [-1, 3],
    [0, 3],
    [1, 3],
  ],
};

const WIDE: readonly Mouth[] = ['smile', 'grin', 'open'];

/** Glancing eyes look one column over, unless that would put an eye off the body. */
const glance = (c: Canvas, cells: readonly Cell[]): number =>
  cells.every(([x, y]) => {
    const role = c.cells[y]?.[x + 1];
    return role === Role.Body || role === Role.Screen;
  })
    ? 1
    : 0;

/** The 9x9 face: one cell per eye, maybe glancing, a dot or wide mouth, and cheeks. */
function paintSmallFace(c: Canvas, at: Anchor, face: Face): void {
  const { x, dx, y } = at;
  const eyes: Cell[] = [-1, 1].map((s) => [x + s * dx, y]);
  const shift = face.eyes === 'glance' ? glance(c, eyes) : 0;
  for (const [ex, ey] of eyes) c.paint(ex + shift, ey, Role.Glow);
  if (WIDE.includes(face.mouth)) for (const mx of [-1, 0, 1]) c.paint(x + mx, y + 2, Role.Glow);
  else if (face.mouth !== 'none') c.paint(x, y + 2, Role.Glow);
  // Cheeks only land on the Sprite, never beside a narrow one.
  if (!face.hasBlush) return;
  for (const s of [-1, 1]) if (c.cells[y + 1]?.[x + s * (dx + 1)]) c.paint(x + s * (dx + 1), y + 1, Role.Accent);
}

/**
 * Paints a face at a form's anchor. On the 9x9 grid there's room for one
 * cell per eye and one for the mouth, so every face shrinks to that.
 */
export function paintFace(c: Canvas, at: Anchor, face: Face, small: boolean): void {
  const { x, dx, y } = at;
  if (small) {
    paintSmallFace(c, at, face);
    return;
  }
  // A wink is open on the left and shut on the right.
  const left = eyeCells(face.eyes === 'wink' ? 'dots' : face.eyes, dx);
  const right = face.eyes === 'wink' ? eyeCells('sleepy', dx) : left;
  const cells: Cell[] = [
    ...left.map(([ex, ey]): Cell => [x - ex, y + ey]),
    ...right.map(([ex, ey]): Cell => [x + ex, y + ey]),
  ];
  const shift = face.eyes === 'glance' ? glance(c, cells) : 0;
  for (const [ex, ey] of left) c.paint(x - ex + shift, y + ey, Role.Glow);
  for (const [ex, ey] of right) c.paint(x + ex + shift, y + ey, Role.Glow);
  for (const [mx, my] of MOUTH_CELLS[face.mouth]) c.paint(x + mx, y + my + (at.mouthDy ?? 0), Role.Glow);
  if (face.hasBlush) for (const s of [-1, 1]) c.paint(x + s * (dx + 2), y + 2, Role.Accent);
}
