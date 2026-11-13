import { and, ellipse, not, or, type Pix, rect, type Shape, sym } from './canvas.js';

export type Clothes = 'tee' | 'vneck' | 'hoodie' | 'jacket' | 'turtleneck' | 'scarf' | 'apron';
export const CLOTHES: readonly Clothes[] = ['tee', 'vneck', 'hoodie', 'jacket', 'turtleneck', 'scarf', 'apron'];

const CX = 32;
const ax = (x: number): number => Math.abs(x + 0.5 - CX);

/** The shoulders, as one shape. */
const SHOULDERS = ellipse(CX, 67, 29, 19);
/** A V from the base of the neck down to `bottom`. */
const vee =
  (bottom: number, slope: number, pad = 0): Shape =>
  (x, y) =>
    y >= 44 && ax(x) <= (bottom - y) * slope + pad;

/** The neckline each top leaves open: the skin it shows below the neck. */
function opening(clothes: Clothes): Shape {
  switch (clothes) {
    case 'vneck':
      return or(vee(56, 0.75), rect(CX - 5, 44, CX + 4, 47));
    case 'jacket':
      return vee(64, 0.3, 3);
    case 'turtleneck':
      return () => false;
    case 'hoodie':
      return ellipse(CX, 47.5, 5.6, 2.6);
    default:
      return ellipse(CX, 47.2, 6.2, 2.8);
  }
}

/**
 * Neck and shoulders, with what's worn on them. Drawn back to front, so the
 * ink lands on the top that rests over the skin: anything behind the neck
 * (a hood), then the neck and the skin a neckline shows, then the top with
 * that neckline cut out of it, then trims over the top.
 */
export function body(p: Pix, clothes: Clothes): void {
  const hole = opening(clothes);
  if (clothes === 'hoodie')
    p.fill(
      and(ellipse(CX, 50, 15, 6.5), (_x, y) => y <= 52),
      'cloth',
      1,
    );
  p.fill(or(rect(CX - 5, 36, CX + 4, 50), and(hole, SHOULDERS)), 'skin');
  p.fill(rect(CX - 5, 36, CX + 4, 43), 'skin', -1);
  if (clothes === 'jacket') {
    p.fill(and(SHOULDERS, hole, not(ellipse(CX, 46.5, 4.2, 2.4))), 'shirt');
    p.fill(and(SHOULDERS, not(hole)), 'cloth');
    p.fill(and(SHOULDERS, vee(60, 0.3, 6), not(hole)), 'cloth', 1);
    p.fill(
      or(ellipse(CX, 49.5, 2, 1.6), (x, y) => y >= 51 && y <= 61 && ax(x) <= 1 + (y - 51) * 0.08),
      'trim',
    );
    return;
  }
  p.fill(and(SHOULDERS, not(hole)), 'cloth');
  if (clothes === 'vneck') p.fill(and(SHOULDERS, vee(56, 0.75, 1.4), not(hole)), 'trim');
  if (clothes === 'hoodie') p.fill(sym(rect(CX - 4, 51, CX - 4, 58)), 'trim');
  if (clothes === 'apron') {
    p.fill(and(rect(CX - 8, 53, CX + 7, 63), not(ellipse(CX, 51, 4, 2))), 'apron');
    p.fill(sym(rect(CX - 8, 49, CX - 7, 53)), 'apron');
    p.fill(
      or(
        sym((x, y) => y >= 47 && y <= 51 && CX - x - 0.5 > 0 && CX - x - 0.5 <= 1 + Math.abs(y - 49) * 1.6),
        ellipse(CX, 49.5, 1, 1),
      ),
      'trim',
    );
  }
}

/** Collars and scarves drawn over the neck, before the head and its chin. */
export function collar(p: Pix, clothes: Clothes): void {
  if (clothes === 'turtleneck') {
    p.fill(rect(CX - 7, 40, CX + 6, 51), 'cloth', 1);
    p.fill(
      and(rect(CX - 7, 41, CX + 6, 50), (x) => x % 3 === 0),
      'cloth',
    );
  }
  if (clothes === 'scarf') {
    p.fill(or(ellipse(CX, 47, 12, 4.5), ellipse(CX + 1, 51, 12, 3.6)), 'trim');
    p.fill(
      and(
        rect(CX + 2, 51, CX + 8, 63),
        not((x, y) => y > 61 && x % 2 === 0),
      ),
      'trim',
      -1,
    );
  }
}
