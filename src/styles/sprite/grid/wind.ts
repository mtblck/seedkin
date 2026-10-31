import { type Canvas, canvas, type Draw, dots, type Form, frames, pick, Role, rows, span, sway } from './draw.js';

/** How high a cloud hovers in each frame: it rises a row and settles. */
const HOVER = [0, -1, -1, 0] as const;
/** The little puffs around a cloud float half a beat behind it. */
const TRAIL = [0, 0, -1, -1] as const;

const ROLES: Readonly<Record<string, Role>> = { '#': Role.Body, s: Role.Shade };

/** Paints a picture drawn in text, `#` for body and `s` for edge, `dy` rows down. */
const art = (c: Canvas, picture: string, dy: number): void => {
  picture
    .trim()
    .split(/\s+/)
    .forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const role = ROLES[ch];
        if (role !== undefined) c.paint(x, y + dy, role);
      });
    });
};

/** A round-topped cloud with a flat bottom, and a wisp bending back off its head. */
const CLOUD = `
  ...............
  ...............
  ...............
  ...#...........
  ....##.........
  ......ssss.....
  ......s###s....
  ...sss#####ss..
  ...s#########s.
  ..s##########s.
  ..s##########s.
  ..s##########s.
  ..ssssssssssss.
`;
const SMALL_CLOUD = `
  .........
  .........
  .##......
  ...ssss..
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

type Cells = ReturnType<typeof frames>[number];
const lift = (cells: Cells, dy: number): Cells => cells.map(([x, y]) => [x, y + dy] as const);

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

/** A hovering cloud trailing a wisp and little puffs, and a spinning funnel. */
export const WIND: Record<'puff' | 'tornado', Form> = {
  puff: { full: puff, small: puffSmall },
  tornado: { full: tornado, small: tornadoSmall },
};
