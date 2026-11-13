import type { NogginTraits } from '../../src/styles/noggin/types.js';
import type { Pixels } from './pixels.js';

const C = 16;
const EYE_ROW = 14;
/** The left eye's two columns; the right eye mirrors them. */
const EYE = [C - 4, C - 3] as const;

/**
 * Draws the eyes, brows, nose, cheeks and mouth from the avatar's own traits,
 * so a portrait keeps its avatar's expression.
 */
export function face(p: Pixels, t: NogginTraits): void {
  const [a, b] = EYE;
  const eye = (x: number, y: number): void => p.mirror(x, y, 'eye');
  switch (t.eyes) {
    case 'dot':
    case 'tall':
      for (let y = t.eyes === 'tall' ? EYE_ROW - 1 : EYE_ROW; y <= EYE_ROW + 1; y++) {
        eye(a, y);
        eye(b, y);
      }
      p.mirror(a, t.eyes === 'tall' ? EYE_ROW - 1 : EYE_ROW, 'shine');
      break;
    case 'happy':
      eye(a, EYE_ROW);
      eye(b, EYE_ROW);
      eye(a - 1, EYE_ROW + 1);
      eye(b + 1, EYE_ROW + 1);
      break;
    case 'closed':
      eye(a, EYE_ROW + 1);
      eye(b, EYE_ROW + 1);
      eye(a - 1, EYE_ROW);
      eye(b + 1, EYE_ROW);
      break;
    case 'wink':
      for (const x of [a, b]) for (const y of [EYE_ROW, EYE_ROW + 1]) p.set(x, y, 'eye');
      p.set(a, EYE_ROW, 'shine');
      p.set(31 - b, EYE_ROW + 1, 'eye');
      p.set(31 - a, EYE_ROW + 1, 'eye');
      p.set(31 - a + 1, EYE_ROW, 'eye');
      break;
  }
  if (t.hasBrows && t.eyewear !== 'shades') for (const x of [a - 1, a, b]) p.mirror(x, EYE_ROW - 2, 'hair', -1);
  p.set(C, 17, 'skin', -1);
  if (t.hasCheeks && t.facial !== 'beard') for (const x of [a - 1, a]) p.mirror(x, 17, 'blush');
  if (t.facial === 'beard') beard(p);
  if (t.facial === 'mustache') for (let x = C - 3; x < C + 3; x++) p.set(x, 18, 'hair');
  mouth(p, t);
}

function beard(p: Pixels): void {
  for (let y = 14; y <= 17; y++) p.mirror(C - 6, y, 'hair');
  for (let y = 18; y <= 22; y++) for (let x = 0; x < 32; x++) if (p.get(x, y) === 'skin') p.set(x, y, 'hair');
  p.span(23, 3, 'hair');
  for (let y = 19; y <= 20; y++) p.span(y, 3, 'skin');
}

function mouth(p: Pixels, t: NogginTraits): void {
  const m = (x: number, y: number, mat = 'mouth'): void => p.set(x, y, mat);
  switch (t.mouth) {
    case 'smile':
      m(C - 3, 19);
      m(C + 2, 19);
      for (let x = C - 2; x < C + 2; x++) m(x, 20);
      return;
    case 'line':
      for (let x = C - 2; x < C + 2; x++) m(x, 19);
      return;
    case 'open':
      for (let x = C - 2; x < C + 2; x++) m(x, 19);
      for (let x = C - 2; x < C + 2; x++) m(x, 20, x === C - 1 || x === C ? 'tongue' : 'mouth');
      return;
    case 'smirk':
      m(C - 2, 19);
      m(C + 1, 19);
      m(C - 1, 20);
      m(C, 20);
      return;
  }
}

/** Glasses or shades over the eyes, in the outfit's accent or near-black. */
export function eyewear(p: Pixels, t: NogginTraits): void {
  const [a, b] = EYE;
  if (t.eyewear === 'glasses') {
    for (let x = a - 1; x <= b + 1; x++) for (const y of [EYE_ROW - 1, EYE_ROW + 2]) p.mirror(x, y, 'frame');
    for (let y = EYE_ROW - 1; y <= EYE_ROW + 2; y++) for (const x of [a - 1, b + 1]) p.mirror(x, y, 'frame');
    p.mirror(C - 1, EYE_ROW, 'frame');
    p.mirror(a - 2, EYE_ROW, 'frame');
  } else if (t.eyewear === 'shades') {
    for (let x = a - 1; x <= b + 1; x++) for (let y = EYE_ROW - 1; y <= EYE_ROW + 1; y++) p.mirror(x, y, 'lens');
    p.mirror(a - 1, EYE_ROW - 1, 'lens', 1);
    p.mirror(C - 1, EYE_ROW - 1, 'lens');
    p.mirror(a - 2, EYE_ROW - 1, 'lens');
  }
}

/** Hats, headbands, earrings and headscarves, over the hair. */
export function headwear(p: Pixels, t: NogginTraits, hw: number): void {
  const on = (y: number, h: number, tone = 0): void => p.span(y, h, 'hat', tone);
  switch (t.headwear) {
    case 'beanie':
      [hw - 3, hw - 1, hw, hw + 1, hw + 1, hw + 1].forEach((h, i) => on(3 + i, h));
      on(9, hw + 1, -1);
      on(10, hw + 1, -1);
      p.span(1, 1, 'hat', 1);
      p.span(2, 1, 'hat', 1);
      return;
    case 'headband':
      p.span(9, hw, 'hat');
      return;
    case 'earring':
      p.mirror(C - hw - 1, 17, 'hat', 1);
      return;
    case 'headscarf':
      [hw - 2, hw, hw + 1, hw + 1, hw + 1].forEach((h, i) => on(5 + i, h));
      on(10, hw, -1);
      for (let y = 11; y <= 20; y++) p.mirror(C - hw, y, 'hat');
      return;
    default:
      return;
  }
}
