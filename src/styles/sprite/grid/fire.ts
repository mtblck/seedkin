import { art, canvas, type Draw, dots, type Form, frames, pick, Role, rows, sway } from './draw.js';

const tip = (s: number, n: number) => (i: number) => (i < n ? Math.trunc((s * (n - i)) / 2) : 0);
const EMBERS = frames('2,6 12,3 | 2,4 12,9 | 3,2 11,7 | 1,9 12,5');
const TONGUES = frames('4,5 3,4 | 11,7 | 10,5 11,4 | 3,7');
const SMALL_EMBERS = frames('1,2 | 7,1 | 1,0 | 7,3');

const flame: Draw = (f) => {
  const c = canvas(15);
  rows(c, 1, [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 3, 2], tip(sway(f), 4));
  dots(c, pick(TONGUES, f), Role.Shade);
  rows(c, 10, [0, 1, 2, 1], undefined, Role.Screen, Role.Screen);
  if (f % 2) c.paint(7, 9, Role.Screen);
  dots(c, pick(EMBERS, f), Role.Accent);
  return { c, at: { x: 7, dx: 2, y: 7 } };
};

const flameSmall: Draw = (f) => {
  const c = canvas(9);
  rows(c, 1, [0, 0, 1, 1, 2, 2, 3, 2], (i) => (i === 0 ? sway(f) : 0));
  c.paint(4, 7, Role.Screen);
  dots(c, pick(SMALL_EMBERS, f), Role.Accent);
  return { c, at: { x: 4, dx: 1, y: 4 } };
};

const wisp: Draw = (f) => {
  const c = canvas(15);
  rows(c, 2, [0, 0, 1, 1, 2], tip(sway(f), 5));
  rows(c, 7, [2, 3, 4, 4, 4, 3, 2]);
  rows(c, 11, [1, 2], undefined, Role.Screen, Role.Screen);
  dots(c, pick(EMBERS, f + 1), Role.Accent);
  return { c, at: { x: 7, dx: 2, y: 8 } };
};

const wispSmall: Draw = (f) => {
  const c = canvas(9);
  rows(c, 1, [0, 0, 1], (i) => (i < 2 ? sway(f) : 0));
  rows(c, 4, [2, 3, 3, 3, 2]);
  c.paint(4, 7, Role.Screen);
  dots(c, pick(SMALL_EMBERS, f + 1), Role.Accent);
  return { c, at: { x: 4, dx: 1, y: 5 } };
};

/** A glowing coal with bright cracks; its little flame is drawn separately so it can sway. */
const COAL = `
  ....sssssss....
  ...s###o###s...
  ..s#########s..
  .s#########o#s.
  .so#########os.
  .s#o#########s.
  .s###########s.
  ..sssssssssss..
`;
const SMALL_COAL = `
  ..sssss..
  .s#####s.
  .s#####s.
  .so####s.
  .s####os.
  ..sssss..
`;
/** Sparks rising off a coal, clear of its flame. */
const SPARKS = frames('3,4 11,3 | 3,3 11,2 | 2,2 12,4 | 2,1 12,3');

const ember: Draw = (f) => {
  const c = canvas(15);
  const s = sway(f);
  art(c, COAL, 6);
  dots(
    c,
    [
      [7 + s, 3],
      [6 + Math.trunc(s / 2), 4],
      [8 + Math.trunc(s / 2), 4],
      [5, 5],
      [9, 5],
    ],
    Role.Body,
  );
  dots(
    c,
    [
      [7, 4],
      [6, 5],
      [7, 5],
      [8, 5],
    ],
    Role.Screen,
  );
  dots(c, pick(SPARKS, f), Role.Accent);
  return { c, at: { x: 7, dx: 2, y: 8 } };
};

const emberSmall: Draw = (f) => {
  const c = canvas(9);
  art(c, SMALL_COAL, 3);
  dots(
    c,
    [
      [4 + sway(f), 1],
      [3, 2],
      [5, 2],
    ],
    Role.Body,
  );
  c.paint(4, 2, Role.Screen);
  dots(c, pick(SMALL_EMBERS, f + 2), Role.Accent);
  return { c, at: { x: 4, dx: 1, y: 5 } };
};

/** A flame with a swaying tip, a round wisp with a tail of fire, and a glowing ember. */
export const FIRE: Record<'flame' | 'wisp' | 'ember', Form> = {
  ember: { full: ember, small: emberSmall },
  flame: { full: flame, small: flameSmall },
  wisp: { full: wisp, small: wispSmall },
};
