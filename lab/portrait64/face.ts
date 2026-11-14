import type { NogginTraits } from '../../src/styles/noggin/types.js';
import { and, ellipse, not, or, type Pix, rect, sym } from './canvas.js';
import type { Head } from './hair.js';
import { tag } from './motion.js';

/** The left eye's columns and row; the right eye mirrors them. */
const EX = 25;
const EY = 30;
const R = (x: number): number => 63 - x;

/** Features never get ink lines; they are drawn as lines already. */
export const FEATURES = ['eye', 'shine', 'brow', 'mouth', 'tooth', 'tongue', 'blush', 'lens'];

/**
 * Eyes, brows, nose, cheeks and mouth from the avatar's own traits, so the
 * portrait keeps its avatar's expression.
 */
export function face(p: Pix, t: NogginTraits, h: Head): void {
  const both = (x: number, y: number, m = 'eye'): void => {
    p.set(x, y, m);
    p.set(R(x), y, m);
  };
  const open = (x: number, tall: boolean, side: (x: number) => number): void => {
    for (let y = tall ? EY - 2 : EY - 1; y <= EY + 1; y++) for (const dx of [0, 1]) p.set(side(x + dx), y, 'eye');
    p.set(side(x), tall ? EY - 2 : EY - 1, 'shine');
  };
  const id = (x: number): number => x;
  tag(p, 'eyes', () => {
    if (t.eyes === 'dot' || t.eyes === 'tall') {
      open(EX, t.eyes === 'tall', id);
      open(EX, t.eyes === 'tall', R);
    } else if (t.eyes === 'happy' || t.eyes === 'closed') {
      const [mid, ends] = t.eyes === 'happy' ? [EY - 1, EY] : [EY + 1, EY];
      for (const x of [EX, EX + 1]) both(x, mid);
      for (const x of [EX - 1, EX + 2]) both(x, ends);
    } else {
      open(EX, false, id);
      for (const x of [EX, EX + 1]) p.set(R(x), EY + 1, 'eye');
      p.set(R(EX - 1), EY, 'eye');
      p.set(R(EX + 2), EY, 'eye');
    }
  });
  if (t.hasBrows && t.eyewear !== 'shades') {
    for (let x = EX - 2; x <= EX + 2; x++) both(x, x === EX - 2 ? EY - 3 : EY - 4, 'brow');
  }
  p.set(h.cx, 34, 'skin', -1);
  p.set(h.cx, 35, 'skin', -1);
  if (t.hasCheeks && t.facial !== 'beard') for (const x of [EX - 2, EX - 1, EX]) both(x, 34, 'blush');
  if (t.facial === 'beard') {
    p.over(
      or(
        and(h.shape, (x, y) => y >= 36 - Math.abs(x + 0.5 - h.cx) * 0.25, not(ellipse(h.cx, 37.8, 4.4, 2.2))),
        and(h.shape, (x, y) => y >= 27 && Math.abs(x + 0.5 - h.cx) > h.rx - 2),
      ),
      'hair',
      ['skin', 'blush'],
    );
    p.fill(and(ellipse(h.cx, 41, 8, 6), not(h.shape)), 'hair');
  }
  if (t.facial === 'mustache' || t.facial === 'beard') p.fill(ellipse(h.cx, 35.6, 4.8, 1.4), 'hair');
  tag(p, 'mouth', () => mouth(p, t, h.cx));
}

function mouth(p: Pix, t: NogginTraits, cx: number): void {
  const y = 37;
  const run = (x0: number, x1: number, row: number, m = 'mouth'): void => {
    for (let x = x0; x <= x1; x++) p.set(x, row, m);
  };
  if (t.mouth === 'smile') {
    p.set(cx - 4, y, 'mouth');
    p.set(cx + 3, y, 'mouth');
    run(cx - 3, cx + 2, y + 1);
  } else if (t.mouth === 'line') {
    run(cx - 2, cx + 1, y);
  } else if (t.mouth === 'open') {
    run(cx - 3, cx + 2, y);
    run(cx - 2, cx + 1, y + 1);
    p.set(cx - 2, y, 'tooth');
    run(cx - 1, cx, y + 1, 'tongue');
  } else {
    run(cx - 3, cx, y + 1);
    p.set(cx + 1, y, 'mouth');
    p.set(cx + 2, y - 1, 'mouth');
  }
}

/** Glasses (framed in the accent) or dark shades. */
export function eyewear(p: Pix, t: NogginTraits, h: Head): void {
  const lens = rect(EX - 3, EY - 3, EX + 4, EY + 3);
  const inside = rect(EX - 2, EY - 2, EX + 3, EY + 2);
  const temple = rect(h.cx - h.rx, EY - 1, EX - 3, EY - 1);
  const bridge = rect(EX + 5, EY - 1, R(EX + 5), EY - 1);
  if (t.eyewear === 'glasses') p.fill(or(sym(and(lens, not(inside))), sym(temple), bridge), 'frame');
  if (t.eyewear === 'shades') {
    p.fill(or(sym(lens), sym(temple), bridge), 'lens');
    p.fill(sym(rect(EX - 2, EY - 2, EX - 1, EY - 2)), 'shine');
  }
}

/** Hats, headbands, earrings and headscarves. */
export function headwear(p: Pix, t: NogginTraits, h: Head): void {
  const top = h.cy - h.ry;
  if (t.headwear === 'beanie') {
    p.fill(
      and(ellipse(h.cx, top + 9, h.rx + 2, 11), (_x, y) => y <= top + 8),
      'hat',
    );
    p.fill(rect(h.cx - h.rx - 2, top + 6, h.cx + h.rx + 1, top + 10), 'hat', -1);
    p.fill(ellipse(h.cx, top - 3.5, 3.6, 3.4), 'hat', 1);
  } else if (t.headwear === 'headband') {
    p.over(rect(0, top + 6, 63, top + 8), 'hat', ['hair', 'skin', 'buzz']);
  } else if (t.headwear === 'earring') {
    p.fill(sym(ellipse(h.cx - h.rx - 0.5, 36.5, 1.3, 1.3)), 'gold');
  } else if (t.headwear === 'headscarf') {
    p.over(
      or(
        (_x, y) => y < top + 7,
        (x, y) => y < 40 && Math.abs(x + 0.5 - h.cx) > h.rx - 2,
      ),
      'hat',
      ['skin', 'hat'],
    );
  }
}

/** The headscarf's drape behind the head, drawn before it. */
export function scarfBack(p: Pix, h: Head): void {
  p.fill(
    or(
      ellipse(h.cx, h.cy - 1, h.rx + 3, h.ry + 3),
      and(rect(h.cx - h.rx - 3, h.cy, h.cx + h.rx + 2, 50), not(ellipse(h.cx, 56, 6, 8))),
    ),
    'hat',
  );
}
