import { and, ellipse, not, or, type Pix, rect, sym } from './canvas.js';

export type Clothes = 'tee' | 'vneck' | 'hoodie' | 'jacket' | 'turtleneck' | 'scarf' | 'apron';
export const CLOTHES: readonly Clothes[] = ['tee', 'vneck', 'hoodie', 'jacket', 'turtleneck', 'scarf', 'apron'];

const CX = 32;
const ax = (x: number): number => Math.abs(x + 0.5 - CX);

/** Neck and shoulders, with what's worn on them. Collars that cover the neck come in {@link collar}. */
export function body(p: Pix, clothes: Clothes): void {
  p.fill(rect(CX - 5, 36, CX + 4, 50), 'skin');
  p.fill(rect(CX - 5, 36, CX + 4, 44), 'skin', -1);
  if (clothes === 'hoodie') p.fill(and(ellipse(CX, 50, 15, 6), not(ellipse(CX, 48.5, 6.5, 3.5))), 'cloth', 1);
  p.fill(ellipse(CX, 67, 29, 19), 'cloth');
  switch (clothes) {
    case 'tee':
      p.fill(ellipse(CX, 48, 6.5, 3), 'skin', -1);
      return;
    case 'vneck':
      p.fill((x, y) => y >= 47 && ax(x) <= (56 - y) * 0.75, 'skin', -1);
      p.fill(
        and(
          (x, y) => y >= 47 && ax(x) <= (56 - y) * 0.75 + 1.4,
          not((x, y) => ax(x) <= (56 - y) * 0.75),
        ),
        'trim',
      );
      return;
    case 'hoodie':
      p.fill(ellipse(CX, 51, 13, 4), 'cloth', 1);
      p.fill(ellipse(CX, 49.5, 6, 2.6), 'skin', -1);
      p.fill(sym(rect(CX - 4, 53, CX - 4, 59)), 'trim');
      return;
    case 'jacket':
      p.fill((x, y) => y >= 47 && ax(x) <= 3 + (y - 47) * 0.3, 'shirt');
      p.fill(
        and(
          (x, y) => y >= 47 && y <= 60 && ax(x) <= 6 + (y - 47) * 0.3,
          not((x, y) => ax(x) <= 3 + (y - 47) * 0.3),
        ),
        'cloth',
        1,
      );
      p.fill(
        or(ellipse(CX, 50, 2, 1.6), (x, y) => y >= 51 && y <= 61 && ax(x) <= 1 + (y - 51) * 0.08),
        'trim',
      );
      return;
    case 'apron':
      p.fill(ellipse(CX, 48, 6, 3), 'shirt');
      p.fill(and(rect(CX - 8, 52, CX + 7, 63), not(ellipse(CX, 50, 4, 2))), 'apron');
      p.fill(sym(rect(CX - 8, 47, CX - 7, 52)), 'apron');
      p.fill(
        or(
          sym((x, y) => y >= 47 && y <= 51 && CX - x - 0.5 > 0 && CX - x - 0.5 <= 1 + Math.abs(y - 49) * 1.6),
          ellipse(CX, 49.5, 1, 1),
        ),
        'trim',
      );
      return;
    default:
      return;
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
