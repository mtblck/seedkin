import type { BeastieTraits } from '../../../src/styles/beastie/types.js';
import { and, ellipse, or, type Pix, rect, rounded, tri } from '../canvas.js';
import type { Beast } from './body.js';

/** The middle of avatar row `r` (counted from the body's top row) and column `c` (from the centre). */
const at = (b: Beast, c: number, r: number): [number, number] => [b.cx + c * b.s, b.top + (r + 0.5) * b.s];

/** An eye: a white with its pupil low in it, looking down as the avatar's do, and a glint. */
function eye(p: Pix, x: number, y: number, r: number): void {
  p.fill(ellipse(x, y, r, r * 1.05), 'white');
  const pr = r * 0.5;
  p.fill(ellipse(x, y + r - pr - 0.6, pr, pr), 'pupil');
  p.fill(
    rect(
      Math.round(x - pr * 0.4),
      Math.round(y + r - pr * 1.6),
      Math.round(x - pr * 0.4),
      Math.round(y + r - pr * 1.6),
    ),
    'shine',
  );
}

/** Eyes of the avatar's kind, where the avatar puts them; stalks hold theirs up above the body. */
export function eyes(p: Pix, t: BeastieTraits, b: Beast): void {
  const two = b.s * 1.05;
  switch (t.eyes) {
    case 'one':
      return eye(p, ...at(b, 0, 2), b.s * 1.55);
    case 'two':
      eye(p, ...at(b, -2.5, 2.5), two);
      return eye(p, ...at(b, 2.5, 2.5), two);
    case 'three':
      eye(p, ...at(b, -3.5, 2.5), two * 0.9);
      eye(p, ...at(b, 0, 1.5), two);
      return eye(p, ...at(b, 3.5, 2.5), two * 0.9);
    case 'tiny': {
      const c = Math.min(2, t.halfWidth - 2);
      for (const sd of [-1, 1]) {
        const [x, y] = at(b, sd * c, 3);
        // The avatar's tiny eyes are single white cells: small whites with a dot of pupil.
        p.fill(ellipse(x, y, 2.2, 2.4), 'white');
        p.fill(rect(Math.round(x - 0.5), Math.round(y), Math.round(x - 0.5), Math.round(y + 1)), 'pupil');
      }
      return;
    }
    case 'stalks':
      for (const sd of [-1, 1]) {
        const [x, y] = at(b, sd * 2.5, -3.5);
        p.fill(
          (cx, cy) => cy >= y && cy <= b.top + 4 && Math.abs(cx + 0.5 - (x - sd * (cy - y) * 0.12)) <= 1.4,
          'body',
        );
        eye(p, x, y, b.s * 1.05);
        // The avatar's two small glints low on the face.
        const [gx, gy] = at(b, sd, 3);
        p.fill(ellipse(gx, gy, 1.3, 1.3), 'white');
      }
      return;
  }
}

/** The mouth: dark, with white teeth or fangs, or an accent tongue. */
export function mouth(p: Pix, t: BeastieTraits, b: Beast): void {
  const w = (Math.min(t.halfWidth - 1, 3) + 0.5) * b.s;
  const [cx, y] = at(b, 0, 5);
  switch (t.mouth) {
    case 'fangs':
      p.fill(rounded(cx, y, w, 1.8, 1.8), 'mouth');
      for (const sd of [-1, 1]) {
        const fx = cx + sd * (w - b.s * 1.1);
        p.fill(tri(fx - 1.8, y + 1, fx + 1.8, y + 1, fx, y + 5.5), 'white');
      }
      return;
    case 'toothy': {
      const m = and(ellipse(cx, y - 1, w, 7), (_x, cy) => cy >= y - 2);
      p.fill(m, 'mouth');
      p.fill(
        and(m, (x, cy) => cy <= y && Math.abs(((x + 0.5 - cx) % 4) + 4) % 4 < 2.4),
        'white',
      );
      p.fill(
        and(m, (x, cy) => cy >= y + 3 && Math.abs(((x + 0.5 - cx + 2) % 4) + 4) % 4 < 2.4 && cy <= y + 4),
        'white',
      );
      return;
    }
    case 'grin': {
      const r = w * 1.1;
      p.fill(
        and(ellipse(cx, y - r * 0.55, r, r * 0.9), (x, cy) => !ellipse(cx, y - r * 0.55 - 2.4, r, r * 0.9)(x, cy)),
        'mouth',
      );
      return;
    }
    case 'o':
      p.fill(ellipse(cx, y + 1.5, b.s * 1.3, b.s * 1.4), 'mouth');
      p.fill(ellipse(cx, y + 3, b.s * 0.7, b.s * 0.5), 'tongue');
      return;
    case 'tongue':
      p.fill(rounded(cx, y, w - b.s, 1.6, 1.6), 'mouth');
      p.fill(or(rounded(cx + b.s, y + 3.5, 2.6, 3.2, 2.4)), 'tongue');
      p.fill(rect(Math.round(cx + b.s) - 0, Math.round(y + 2), Math.round(cx + b.s), Math.round(y + 4)), 'tongue', -1);
      return;
  }
}
