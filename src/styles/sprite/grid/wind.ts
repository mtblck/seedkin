import {
  art,
  type Canvas,
  canvas,
  type Draw,
  dots,
  type Form,
  frames,
  lift,
  pick,
  Role,
  rows,
  span,
  sway,
} from './draw.js';

/** How high a cloud hovers in each frame: it rises a row and settles. */
const HOVER = [0, -1, -1, 0] as const;
/** The little puffs around a cloud float half a beat behind it. */
const TRAIL = [0, 0, -1, -1] as const;

/** A round-topped cloud with a flat bottom, and a wisp bending back off its head. */
const CLOUD = `
  ...............
  ...............
  ...............
  ...s...........
  ....ss.........
  .....sssss.....
  ......s###s....
  ...sss#####ss..
  ...s#########s.
  ..s##########s.
  ..s##########s.
  ..s##########s.
  ..s##########s.
  ..ssssssssssss.
`;
const SMALL_CLOUD = `
  .........
  .........
  .ss......
  ..sssss..
  ..s####s.
  .s#####s.
  .s#####s.
  .sssssss.
`;

/** Cells breaking off the end of the wisp, a few at a time. */
const FLECKS = frames('2,2 1,3 | 1,2 | 2,1 0,3 | 1,1 3,2');
const SMALL_FLECKS = frames('0,1 | 0,2 | 1,1 | 0,0');
/** A puff ball floating behind the cloud and a speck ahead of it. */
const PUFFS = frames('0,6 1,6 0,7 1,7 13,4')[0] ?? [];

const puff: Draw = (f) => {
  const c = canvas(15);
  const h = pick(HOVER, f);
  art(c, CLOUD, h);
  dots(c, lift(pick(FLECKS, f), h), Role.Body);
  dots(c, lift(PUFFS, pick(TRAIL, f)), Role.Accent);
  return { c, at: { x: 8, dx: 2, y: 8 + h } };
};

const puffSmall: Draw = (f) => {
  const c = canvas(9);
  const h = pick(HOVER, f);
  art(c, SMALL_CLOUD, h);
  dots(c, lift(pick(SMALL_FLECKS, f), h), Role.Body);
  return { c, at: { x: 4, dx: 1, y: 4 + h } };
};

/** Paints a funnel's spinning bands: short dashes that slide down a row each frame. */
const bands = (
  c: Canvas,
  w: readonly number[],
  top: number,
  shift: (i: number) => number,
  f: number,
  gap: number,
): void => {
  for (let k = 0; k < w.length; k += gap) {
    const i = (k + f) % w.length;
    const n = w[i] ?? 0;
    if (n < 2) continue;
    const m = c.center + shift(i);
    const from = k % (2 * gap) ? m : m - n + 1;
    span(c, top + i, from, from + n - 2, Role.Shade, Role.Shade);
  }
};

const tornado: Draw = (f) => {
  const c = canvas(15);
  const w = [5, 6, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
  const shift = (i: number): number => Math.trunc((sway(f) * i) / 5);
  rows(c, 1, w, shift, Role.Body, Role.Body);
  bands(c, w, 1, shift, f, 3);
  dots(c, pick(frames('1,5 13,9 | 2,8 12,4 | 1,11 13,6 | 2,3 12,10'), f), Role.Accent);
  return { c, at: { x: 7, dx: 2, y: 3 } };
};

const tornadoSmall: Draw = (f) => {
  const c = canvas(9);
  const w = [3, 4, 3, 2, 2, 1, 1, 0];
  const shift = (i: number): number => (i >= 4 ? Math.trunc((sway(f) * (i - 2)) / 2) : 0);
  rows(c, 1, w, shift, Role.Body, Role.Body);
  const y = 4 + (f % 2);
  const n = w[y - 1] ?? 0;
  span(c, y, 4 + shift(y - 1) - n, 4 + shift(y - 1) + n - 1, Role.Shade, Role.Shade);
  return { c, at: { x: 4, dx: 1, y: 2 } };
};

const LEAF = `
  .......s.......
  ......s#s......
  .....s###s.....
  ....s#####s....
  ...s#######s...
  ..s#########s..
  ..s#########s..
  .s###########s.
  .s###########s.
  ..s#########s..
  ...s#######s...
  ....ss#s#ss....
  ......sss......
  .......s.......
  ........s......
`;
const SMALL_LEAF = `
  ....s....
  ...s#s...
  ..s###s..
  .s#####s.
  .s#####s.
  .s#####s.
  ..s###s..
  ...sss...
  ....s....
`;
/** Breeze streaks blowing past a leaf. */
const STREAKS = frames('0,4 1,4 12,11 13,11 | 1,4 2,4 13,11 14,11 | 0,10 1,10 12,3 13,3 | 1,10 2,10 13,3 14,3');
const SMALL_STREAKS = frames('0,2 | 0,6 | 8,7 | 8,2');

/** A leaf flutters: its top leans one way, then the other, about its middle. */
const flutter = (f: number, mid: number) => (y: number) => Math.round((sway(f) * (mid - y)) / mid);

const leaf: Draw = (f) => {
  const c = canvas(15);
  const h = pick(HOVER, f);
  art(c, LEAF, h, flutter(f, 9));
  dots(c, pick(STREAKS, f), Role.Accent);
  return { c, at: { x: 7, dx: 2, y: 6 + h } };
};

const leafSmall: Draw = (f) => {
  const c = canvas(9);
  art(c, SMALL_LEAF, 0, flutter(f, 5));
  dots(c, pick(SMALL_STREAKS, f), Role.Accent);
  return { c, at: { x: 4, dx: 1, y: 3 } };
};

/** A hovering cloud trailing a wisp and little puffs, a spinning funnel, and a fluttering leaf. */
export const WIND: Record<'puff' | 'tornado' | 'leaf', Form> = {
  leaf: { full: leaf, small: leafSmall },
  puff: { full: puff, small: puffSmall },
  tornado: { full: tornado, small: tornadoSmall },
};
