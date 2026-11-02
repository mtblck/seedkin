import { blob, stamp, still } from '../../../core/art.js';
import { type Canvas, createCanvas, tagged } from '../../../core/canvas.js';
import { type BeastieTraits, Role } from '../types.js';

/** Row half-widths for each body, top to bottom. */
function rows(t: BeastieTraits): number[] {
  const w = t.halfWidth;
  switch (t.body) {
    case 'tall':
      return [w - 2, w - 1, w - 1, w - 1, w - 1, w - 1, w - 1, w - 1, w - 1, w - 2];
    case 'wide':
      return [w - 1, w + 1, w + 1, w + 1, w + 1, w + 1, w];
    case 'ghost':
      return [w - 2, w - 1, w, w, w, w, w, w, w];
    case 'box':
      return [w, w, w, w, w, w, w, w];
    default:
      return [w - 2, w - 1, w, w, w, w, w, w - 1, w - 2];
  }
}

/**
 * Draws the detailed 15x15 Beastie.
 *
 * @param t - The Beastie's traits
 * @returns A 15x15 canvas
 */
export function drawGrid(t: BeastieTraits): Canvas {
  const c = createCanvas();
  const r = rows(t);
  const top = t.body === 'tall' ? 3 : 4;
  const bottom = top + r.length - 1;
  const hw = Math.max(...r);
  // Tagged parts move when animated: sides twitch, tops wobble, eyes blink, mouths talk.
  tagged(c, 'sides', () => sides(c, t, top, hw));
  blob(c, top, r, Role.Body, Role.Shade);
  if (t.body === 'ghost') for (let dx = 1; dx <= hw; dx += 2) c.mirror(dx, bottom, Role.Empty);
  else for (const dx of [Math.max(1, hw - 3), Math.max(2, hw - 2)]) c.mirror(dx, bottom + 1, Role.Shade);
  tagged(c, 'top', () => topPiece(c, t, top, r[0] ?? hw));
  const eyeRow = top + 2;
  tagged(c, 'eyes', () => eyes(c, t, eyeRow, hw));
  // Stalks hold still; only the eyes on them blink.
  if (t.eyes === 'stalks') tagged(c, null, () => stalks(c, eyeRow));
  tagged(c, 'mouth', () => mouth(c, t, eyeRow + 3, hw));
  // Spots go on last, and only where no moving part sits, so a blink or a talk
  // uncovers hide, not a spot hidden under the eyes or mouth.
  const s = still(c);
  if (t.hasSpots)
    for (const [dx, dy] of [
      [-hw + 1, 4],
      [hw - 2, 2],
      [-1, 6],
    ] as const)
      s.paint(c.center + dx, top + dy, Role.Accent);
  return c;
}

/** One eye: whites in glow with a pupil in screen. Size 1 is a 2x2 white, 2 a 3x3. */
function eye(c: Canvas, x: number, y: number, size: 1 | 2): void {
  for (let dy = 0; dy <= size; dy++) for (let dx = 0; dx <= size; dx++) c.paint(x + dx, y + dy, Role.Glow);
  c.paint(x + 1, y + size, Role.Screen);
}

function eyes(c: Canvas, t: BeastieTraits, y: number, hw: number): void {
  const mid = c.center;
  switch (t.eyes) {
    case 'one':
      eye(c, mid - 1, y - 1, 2);
      return;
    case 'two':
      eye(c, mid - 3, y, 1);
      eye(c, mid + 2, y, 1);
      return;
    case 'three':
      eye(c, mid - 4, y, 1);
      eye(c, mid - 1, y - 1, 1);
      eye(c, mid + 3, y, 1);
      return;
    case 'tiny':
      c.mirror(Math.min(2, hw - 2), y + 1, Role.Glow);
      return;
    case 'stalks':
      stamp(c, ['GG', 'GC'], mid - 3, y - 6);
      stamp(c, ['GG', 'GC'], mid - 3, y - 6, true);
      c.mirror(1, y + 1, Role.Glow);
      return;
  }
}

function mouth(c: Canvas, t: BeastieTraits, y: number, hw: number): void {
  const w = Math.min(hw - 1, 3);
  const line = (row: number, to: number): void => {
    for (let dx = 0; dx <= to; dx++) c.mirror(dx, row, Role.Screen);
  };
  switch (t.mouth) {
    case 'fangs':
      line(y, w);
      c.mirror(w - 1, y + 1, Role.Glow);
      return;
    case 'toothy':
      line(y, w);
      line(y + 1, w - 1);
      for (let dx = 0; dx <= w; dx += 2) c.mirror(dx, y, Role.Glow);
      return;
    case 'grin':
      line(y + 1, w - 1);
      c.mirror(w, y, Role.Screen);
      return;
    case 'o':
      line(y, 0);
      line(y + 1, 0);
      c.mirror(1, y, Role.Screen);
      c.mirror(1, y + 1, Role.Screen);
      return;
    case 'tongue':
      line(y, w - 1);
      c.paint(c.center + 1, y + 1, Role.Accent);
      c.paint(c.center + 1, y + 2, Role.Accent);
      return;
  }
}

function stalks(c: Canvas, y: number): void {
  for (const row of [y - 4, y - 3]) c.mirror(2, row, Role.Body);
}

function topPiece(c: Canvas, t: BeastieTraits, top: number, w: number): void {
  switch (t.top) {
    case 'horns':
      c.mirror(w, top - 1, Role.Shade);
      c.mirror(w + 1, top - 2, Role.Accent);
      return;
    case 'antennae':
      c.mirror(1, top - 1, Role.Shade);
      c.mirror(2, top - 2, Role.Shade);
      c.mirror(2, top - 3, Role.Accent);
      return;
    case 'spikes':
      for (let dx = 0; dx <= w; dx += 2) c.mirror(dx, top - 1, Role.Shade);
      return;
    case 'tuft':
      c.paint(c.center, top - 1, Role.Shade);
      c.paint(c.center - 1, top - 2, Role.Shade);
      c.paint(c.center + 1, top - 1, Role.Shade);
      return;
  }
}

function sides(c: Canvas, t: BeastieTraits, top: number, hw: number): void {
  if (t.sides === 'arms') {
    c.mirror(hw + 1, top + 5, Role.Shade);
    c.mirror(hw + 2, top + 4, Role.Shade);
  } else if (t.sides === 'wings') {
    stamp(c, ['A..', 'AA.', 'AAA'], c.center - hw - 3, top + 1);
    stamp(c, ['A..', 'AA.', 'AAA'], c.center - hw - 3, top + 1, true);
  }
}
