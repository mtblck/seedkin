import { describe, expect, it } from 'vitest';
import { createPix, type Pix, rect } from '../src/core/portrait/canvas.js';
import { tag } from '../src/core/portrait/motion.js';
import { coverLids, settleSpots, spotCells } from '../src/styles/beastie/portrait/hide.js';

/** A 12x12 body with one 4x4 spot at (4, 4), as `spots` paints it. */
function spotted(): { p: Pix; marks: ReturnType<typeof spotCells> } {
  const p = createPix(12, 12);
  p.fill(rect(0, 0, 11, 11), 'body');
  const spot = rect(4, 4, 7, 7);
  const marks = spotCells(p, [spot]);
  p.over(spot, 'accent', ['body']);
  return { p, marks };
}
const accents = (p: Pix): number => p.m.flat().filter((m) => m === 'accent').length;

describe('Beastie portrait spots', () => {
  it('lets a talk uncover hide, not a spot hidden under the mouth (fuzzy-gizmo-22)', () => {
    const { p, marks } = spotted();
    tag(p, 'mouth', () => p.fill(rect(4, 7, 7, 7), 'mouth'));
    settleSpots(p, marks);
    expect(p.lid[7]?.slice(4, 8)).toEqual(Array(4).fill(['body', 0]));
    // Only a quarter is covered, so the rest of the spot stays.
    expect(accents(p)).toBe(12);
  });

  it('leaves off a spot the face mostly covers, so no sliver peeks out', () => {
    const { p, marks } = spotted();
    const z = p.z[4]?.[3];
    tag(p, 'mouth', () => p.fill(rect(4, 5, 7, 7), 'mouth'));
    settleSpots(p, marks);
    expect(accents(p)).toBe(0);
    expect(p.z[4]?.[4]).toBe(z);
    expect(p.lid.flat().some((l) => l?.[0] === 'accent')).toBe(false);
  });

  it('puts a spot too small for an outline in the body layer, so it shows its colour', () => {
    const p = createPix(12, 12);
    p.fill(rect(0, 0, 11, 11), 'body');
    const marks = spotCells(p, [rect(4, 4, 5, 5)]);
    p.over(rect(4, 4, 5, 5), 'accent', ['body']);
    settleSpots(p, marks);
    expect(accents(p)).toBe(4);
    expect(p.z[4]?.[4]).toBe(p.z[0]?.[0]);
  });

  it('shows a bandana, not hide, where a talking mouth sits on it', () => {
    const { p } = spotted();
    tag(p, 'mouth', () => p.fill(rect(2, 2, 3, 3), 'mouth'));
    coverLids(p, rect(0, 3, 11, 3), 'fabric', ['body']);
    expect(p.lid[2]?.[2]).toEqual(['body', 0]);
    expect(p.lid[3]?.[2]).toEqual(['fabric', 0]);
  });
});
