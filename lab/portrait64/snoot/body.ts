import type { SnootTraits } from '../../../src/styles/snoot/types.js';
import { and, ellipse, not, or, type Pix, rect, rounded, type Shape, tri } from '../canvas.js';

const CX = 32;
type Point = readonly [number, number];

/** A tube of radius `r` along a quadratic curve from `a` through control `c` to `b`. */
function tube(a: Point, c: Point, b: Point, r: number, from = 0): Shape {
  const dots: Shape[] = [];
  for (let i = Math.round(from * 24); i <= 24; i++) {
    const t = i / 24;
    const x = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0];
    const y = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1];
    dots.push(ellipse(x, y, r, r));
  }
  return or(...dots);
}
const pair = (f: (s: number) => Shape): Shape => or(f(-1), f(1));

/** Each species' tail, drawn behind the body. */
function tail(p: Pix, t: SnootTraits): void {
  switch (t.species) {
    case 'cat':
      return p.fill(tube([CX + 9, 58], [CX + 22, 57], [CX + 20, 42], 1.8), 'body');
    case 'fox':
      p.fill(tube([CX + 8, 58], [CX + 23, 61], [CX + 21, 45], 3.6), 'body');
      return p.fill(tube([CX + 8, 58], [CX + 23, 61], [CX + 21, 45], 3.6, 0.75), 'screen');
    case 'dog':
      return p.fill(tube([CX + 9, 55], [CX + 18, 53], [CX + 19, 43], 2), 'body');
    case 'mouse':
      return p.fill(tube([CX + 10, 61], [CX + 27, 63], [CX + 25, 50], 1), 'accent');
    case 'pig':
      return p.fill(and(ellipse(CX + 12, 50, 2.4, 2.4), not(ellipse(CX + 12, 50, 1.1, 1.1))), 'body');
    case 'bunny':
      return p.fill(ellipse(CX + 11, 57, 3.6, 3.4), 'screen');
    default:
      return p.fill(ellipse(CX + 10, 57, 2.4, 2.2), t.species === 'panda' ? 'shade' : 'body');
  }
}

/** A four-legged animal sitting back on its haunches, front legs straight, tail curled round. */
function sitting(p: Pix, t: SnootTraits): void {
  // Haunches are their own material so the ink pass draws the thigh's line where the body overlaps it.
  const limb = 'haunch';
  const bunny = t.species === 'bunny';
  tail(p, t);
  p.fill(
    pair((s) => ellipse(CX + s * 8.5, 51, 8, 9.5)),
    limb,
  );
  p.fill(
    pair((s) => ellipse(CX + s * (bunny ? 14 : 13), 61, bunny ? 7 : 5, 2.4)),
    limb,
  );
  p.fill(or(ellipse(CX, 42, 9, 15), ellipse(CX, 51, 10.5, 9)), 'body');
  // A pale chest, and the belly in shadow behind the front legs.
  if (t.species !== 'pig' && t.species !== 'panda') p.fill(ellipse(CX, 39, 5, 7.5), 'screen');
  p.fill(and(ellipse(CX, 56, 3, 7), (_x, y) => y >= 50), 'body', -1);
  forelegs(p);
}

/**
 * Two straight front legs standing in front of the haunches. They are their
 * own material, so the ink pass outlines them against the body behind, and
 * each is lit on its left and shadowed on its right.
 */
function forelegs(p: Pix): void {
  for (const s of [-1, 1]) {
    const x = CX + s * 4;
    // A shoulder that narrows into the leg, then a paw.
    const leg = or(ellipse(x + s * 0.6, 46, 3.8, 4), rounded(x, 53, 3, 8, 2), ellipse(x + s * 0.3, 60.5, 3.6, 2.4));
    p.fill(leg, 'leg');
    p.fill(and(leg, (cx) => cx + 0.5 - x > 1.4), 'leg', -1);
    p.fill(and(leg, (cx, cy) => cx + 0.5 - x < -1.2 && cy < 57), 'leg', 1);
    // Toes: two short creases on each paw.
    for (const dx of [-1, 1]) p.fill(rect(Math.round(x + s * 0.4 + dx), 61, Math.round(x + s * 0.4 + dx), 62), 'leg', -2);
  }
}

/** An owl: an egg of a body, a pale barred breast, wings folded at its sides, talons below. */
function owl(p: Pix): void {
  p.fill(tri(CX - 5, 56, CX + 5, 56, CX, 64), 'shade');
  p.fill(ellipse(CX, 44, 12, 17), 'body');
  const breast = ellipse(CX, 47, 7.5, 11);
  p.fill(breast, 'screen');
  p.fill(
    and(breast, (x, y) => (y - 39) % 4 === 0 && Math.abs(x + 0.5 - CX) % 3 < 1.5),
    'bar',
  );
  const wing = (s: number): Shape =>
    and(ellipse(CX + s * 10.5, 45, 4.6, 12.5), (x, y) => y < 57 - Math.abs(x + 0.5 - (CX + s * 10)) * 0.4);
  p.fill(pair(wing), 'shade');
  p.fill(
    and(pair(wing), (_x, y) => y % 4 === 0 && y > 40),
    'shade',
    -1,
  );
  for (const s of [-1, 1])
    for (const dx of [-1.5, 0, 1.5])
      p.fill(rect(Math.round(CX + s * 4 + dx), 60, Math.round(CX + s * 4 + dx), 62), 'accent');
}

/** A frog squatting: a round body, folded back legs at its sides, front legs between. */
function frog(p: Pix): void {
  p.fill(ellipse(CX, 50, 14, 12), 'body');
  p.fill(ellipse(CX, 53, 8, 7.5), 'screen');
  p.fill(
    pair((s) => ellipse(CX + s * 14, 54, 6, 7.5)),
    'body',
  );
  p.fill(
    pair((s) => ellipse(CX + s * 18, 61.5, 5.5, 1.9)),
    'body',
  );
  p.fill(
    pair((s) => or(rounded(CX + s * 6, 57, 1.6, 4, 1.4), ellipse(CX + s * 6.5, 61.5, 2.6, 1.5))),
    'body',
  );
}

/** Where a body's neck is, for collars and scarves. */
export function neckY(t: SnootTraits): number {
  return t.species === 'frog' ? 38 : 30;
}

/** The species' body, sitting. */
export function body(p: Pix, t: SnootTraits): void {
  if (t.species === 'owl') owl(p);
  else if (t.species === 'frog') frog(p);
  else sitting(p, t);
}
