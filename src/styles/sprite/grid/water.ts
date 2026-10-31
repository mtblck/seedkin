import { art, canvas, type Draw, dots, type Form, frames, pick, Role, rows } from './draw.js';

const BUBBLES = frames('12,11 2,5 | 12,9 1,3 | 13,7 2,1 | 12,5 1,12');
const SMALL_BUBBLES = frames('8,6 | 8,4 | 7,2 | 8,0');

const drop: Draw = (f) => {
  const c = canvas(15);
  const s = f % 2;
  if (s) rows(c, 2, [0, 1, 1, 2, 3, 4, 5, 5, 5, 5, 4, 3]);
  else rows(c, 1, [0, 0, 1, 1, 2, 3, 4, 4, 5, 5, 5, 4, 3]);
  dots(c, frames(`5,${6 + s} 4,${7 + s} 4,${8 + s}`)[0] ?? [], Role.Screen);
  dots(c, pick(BUBBLES, f), Role.Accent);
  return { c, at: { x: 7, dx: 2, y: 9 - s } };
};

const dropSmall: Draw = (f) => {
  const c = canvas(9);
  const s = f % 2;
  if (s) rows(c, 2, [0, 1, 2, 3, 4, 3, 2]);
  else rows(c, 1, [0, 0, 1, 2, 3, 3, 3, 2]);
  c.paint(2, 5 + s, Role.Screen);
  dots(c, pick(SMALL_BUBBLES, f), Role.Accent);
  return { c, at: { x: 4, dx: 1, y: 6 - s } };
};

const bubble: Draw = (f) => {
  const c = canvas(15);
  const s = f % 2;
  if (s) rows(c, 4, [3, 4, 5, 6, 6, 6, 5, 4, 3]);
  else rows(c, 3, [2, 3, 4, 5, 5, 5, 5, 4, 3, 2]);
  dots(c, frames(`5,${4 + s} 4,${5 + s} 3,${6 + s}`)[0] ?? [], Role.Screen);
  dots(c, pick(BUBBLES, f + 2), Role.Accent);
  return { c, at: { x: 7, dx: 2, y: 8 - s } };
};

const bubbleSmall: Draw = (f) => {
  const c = canvas(9);
  const s = f % 2;
  if (s) rows(c, 2, [2, 3, 4, 4, 3, 2]);
  else rows(c, 1, [1, 2, 3, 3, 3, 2, 1]);
  dots(c, frames(`3,${2 + s} 2,${3 + s}`)[0] ?? [], Role.Screen);
  dots(c, pick(SMALL_BUBBLES, f + 2), Role.Accent);
  return { c, at: { x: 4, dx: 1, y: 4 - s } };
};

const DOME = `
  .....sssss.....
  ...ss#####ss...
  ..s#o#######s..
  .s#o#########s.
  .s###########s.
  .s###########s.
  .s###########s.
  .s###########s.
  .s###########s.
  .sssssssssssss.
`;
const SMALL_DOME = `
  ..sssss..
  .s#o###s.
  .s#####s.
  .s#####s.
  .s#####s.
  .sssssss.
`;
/** How a tentacle sways, row by row below the rim; each starts a frame after the last. */
const WAVE = [0, 1, 1, 0, -1, -1] as const;
const tentacles = (xs: readonly number[], top: number, rows: number, f: number) =>
  xs.flatMap((x, i) =>
    Array.from({ length: rows }, (_, k) => [x + (WAVE[(k + f + i) % WAVE.length] ?? 0), top + k] as const),
  );
/** A jellyfish rises on a pulse and drifts down again. */
const PULSE = [0, -1, -1, 0] as const;

const jelly: Draw = (f) => {
  const c = canvas(15);
  const h = pick(PULSE, f);
  art(c, DOME, 1 + h);
  dots(c, tentacles([3, 6, 8, 11], 11 + h, 3, f), Role.Shade);
  return { c, at: { x: 7, dx: 2, y: 5 + h } };
};

const jellySmall: Draw = (f) => {
  const c = canvas(9);
  art(c, SMALL_DOME, 1);
  dots(c, tentacles([2, 4, 6], 7, 2, f), Role.Shade);
  return { c, at: { x: 4, dx: 1, y: 3 } };
};

/** A wobbling drop and a round blob, with bubbles rising past, and a pulsing jellyfish. */
export const WATER: Record<'drop' | 'bubble' | 'jelly', Form> = {
  jelly: { full: jelly, small: jellySmall },
  drop: { full: drop, small: dropSmall },
  bubble: { full: bubble, small: bubbleSmall },
};
