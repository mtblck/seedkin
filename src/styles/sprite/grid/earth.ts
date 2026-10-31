import { art, canvas, type Draw, dots, type Form, frames, pick, Role, rows, span, sway } from './draw.js';

const PEBBLES = frames('1,8 | 2,4 | 13,7 | 12,3');

const boulder: Draw = (f) => {
  const c = canvas(15);
  span(c, 6, 5, 8);
  span(c, 7, 4, 10);
  span(c, 8, 3, 11);
  for (let y = 9; y <= 12; y++) span(c, y, 2, 12);
  span(c, 13, 2, 12, Role.Shade);
  dots(c, frames('11,10 10,11 11,12')[0] ?? [], Role.Shade);
  dots(c, frames('7,5 7,4')[0] ?? [], Role.Accent);
  dots(c, frames(f % 2 ? '8,3 9,3 6,4' : '6,3 5,3 8,4')[0] ?? [], Role.Accent);
  if (f === 0) c.paint(5, 8, Role.Screen);
  if (f === 2) c.paint(4, 10, Role.Screen);
  dots(c, pick(PEBBLES, f), Role.Shade);
  return { c, at: { x: 7, dx: 2, y: 8 } };
};

const boulderSmall: Draw = (f) => {
  const c = canvas(9);
  span(c, 4, 2, 5);
  for (let y = 5; y <= 7; y++) span(c, y, 1, 7);
  span(c, 8, 1, 7, Role.Shade);
  c.paint(4, 3, Role.Accent);
  c.paint(f % 2 ? 5 : 3, 2, Role.Accent);
  return { c, at: { x: 4, dx: 1, y: 6 } };
};

/** Fills the right half of a gem, inside its edge, with its shadow. */
const facet = (c: ReturnType<typeof canvas>, top: number, w: readonly number[]): void => {
  w.forEach((n, i) => {
    for (let x = c.center + 1; x < c.center + n; x++) c.paint(x, top + i, Role.Shade);
  });
};

const crystal: Draw = (f) => {
  const c = canvas(15);
  const w = [2, 3, 4, 4, 4, 3, 3, 2, 2, 1, 1, 0];
  rows(c, 2, w);
  facet(c, 2, w);
  span(c, 2, 6, 8, Role.Screen, Role.Shade);
  const glint = pick(frames('5,4 | 5,7 | 6,10 | '), f);
  dots(c, glint, Role.Screen);
  const bob = sway(f);
  dots(
    c,
    [
      [2, 7 + bob],
      [12, 7 - bob],
    ],
    Role.Accent,
  );
  return { c, at: { x: 7, dx: 2, y: 5 } };
};

const crystalSmall: Draw = (f) => {
  const c = canvas(9);
  const w = [2, 3, 3, 2, 2, 1, 0];
  rows(c, 1, w);
  facet(c, 1, w);
  if (f === 0) c.paint(3, 1, Role.Screen);
  if (f === 2) c.paint(2, 3, Role.Screen);
  return { c, at: { x: 4, dx: 1, y: 3 } };
};

/** A toadstool's cap, spotted; its stem is drawn in screen so the face sits on it. */
const CAP = `
  ......sss......
  ....ss###ss....
  ...s##oo###s...
  ..s##oo####os..
  .s#########oos.
  .s##o#######os.
  .sssssssssssss.
`;
const STEM = `
  ...sooooooos...
  ...sooooooos...
  ...sooooooos...
  ...sooooooos...
  ...sooooooos...
  ...sooooooos...
  ...sssssssss...
`;
const SMALL_CAP = `
  ...sss...
  .ss#o#ss.
  s##o###os
  sssssssss
`;
const SMALL_STEM = `
  ..sooos..
  ..sooos..
  ..sooos..
  ..sssss..
`;
/** Spores drifting down past the stem. */
const SPORES = frames('1,9 13,11 | 1,10 13,12 | 1,11 13,9 | 1,12 13,10');
/** The cap bobs on its stem. */
const BOB = [0, 0, 1, 1] as const;

/** A round, leafy crown; the trunk below is drawn in screen. */
const CROWN = `
  .....sssss.....
  ...ss#####ss...
  ..s##s######s..
  .s###########s.
  .s###########s.
  .s###########s.
  .s###########s.
  .s#########s#s.
  ..s#########s..
  ...sss###sss...
`;
const TRUNK = `
  ......ooo......
  ......ooo......
  .....oo.oo.....
`;
const SMALL_CROWN = `
  ..sssss..
  .s#####s.
  s#######s
  s#######s
  .s#####s.
  ..sssss..
`;
const SMALL_TRUNK = `
  ....o....
  ....o....
  ...o.o...
`;
/** Fruit in the crown, and a leaf falling past the trunk. */
const FRUIT = frames('3,4 12,6 9,2')[0] ?? [];
const FALLING = frames('2,10 | 3,11 | 2,12 | 3,13');

const tree: Draw = (f) => {
  const c = canvas(15);
  art(c, TRUNK, 11);
  art(c, CROWN, 1, (y) => (y < 4 ? sway(f) : 0));
  // Fruit in the swaying rows sways with them.
  dots(c, FRUIT.map(([x, y]): [number, number] => [x + (y < 5 ? sway(f) : 0), y]), Role.Accent);
  dots(c, pick(FALLING, f), Role.Accent);
  return { c, at: { x: 7, dx: 2, y: 5 } };
};

const treeSmall: Draw = (f) => {
  const c = canvas(9);
  art(c, SMALL_TRUNK, 6);
  art(c, SMALL_CROWN, 0, (y) => (y < 2 ? sway(f) : 0));
  return { c, at: { x: 4, dx: 1, y: 2 } };
};

const mushroom: Draw = (f) => {
  const c = canvas(15);
  art(c, STEM, 8);
  art(c, CAP, 1 + pick(BOB, f));
  dots(c, pick(SPORES, f), Role.Accent);
  return { c, at: { x: 7, dx: 2, y: 9 } };
};

const mushroomSmall: Draw = (f) => {
  const c = canvas(9);
  art(c, SMALL_STEM, 5);
  art(c, SMALL_CAP, 1 + pick(BOB, f));
  return { c, at: { x: 4, dx: 1, y: 5 } };
};

/** A boulder with a sprout, and a cut gem. */
export const EARTH: Record<'boulder' | 'crystal' | 'mushroom' | 'tree', Form> = {
  mushroom: { full: mushroom, small: mushroomSmall },
  tree: { full: tree, small: treeSmall },
  boulder: { full: boulder, small: boulderSmall },
  crystal: { full: crystal, small: crystalSmall },
};
