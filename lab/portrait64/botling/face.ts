import type { Traits } from '../../../src/styles/botling/types.js';
import { and, ellipse, not, or, type Pix, rect, type Shape } from '../canvas.js';
import type { Bot } from './head.js';

const disc = (x: number, y: number, r: number): Shape => ellipse(x, y, r, r);
const ring = (x: number, y: number, r: number, hole: number): Shape => and(disc(x, y, r), not(disc(x, y, hole)));
const box = (x: number, y: number, hw: number, hh: number): Shape =>
  rect(Math.round(x - hw), Math.round(y - hh), Math.round(x + hw) - 1, Math.round(y + hh) - 1);

/** One eye of a style, centred at (x, y); `side` is -1 for the left eye, 1 for the right. */
function eye(kind: Traits['eyes'], x: number, y: number, side: number): Shape {
  switch (kind) {
    case 'dot':
      return disc(x, y, 2.3);
    case 'block':
      return box(x, y, 2, 2);
    case 'tall':
      return box(x, y, 1.5, 3.5);
    case 'slit':
      return box(x, y + 1, 3, 1);
    case 'ring':
      return ring(x, y, 3, 1.4);
    case 'cross':
      return (cx, cy) => {
        const dx = Math.abs(cx + 0.5 - x);
        const dy = Math.abs(cy + 0.5 - y);
        return Math.abs(dx - dy) < 0.9 && dx < 3;
      };
    case 'sleepy':
      return and(disc(x, y, 3), (_cx, cy) => cy >= y);
    case 'mismatch':
      return side < 0 ? disc(x, y, 2) : ring(x, y, 3.2, 1.5);
    case 'happy':
      return and(ring(x, y + 1, 3, 1.6), (_cx, cy) => cy < y + 0.5);
    case 'wink':
      return side < 0 ? disc(x, y, 2.3) : and(ring(x, y + 1, 3, 1.6), (_cx, cy) => cy < y + 0.5);
    case 'angry':
      return and(
        box(x, y, 2.5, 2),
        (cx, cy) => cy + 0.5 - (y - 2) >= (side < 0 ? cx + 0.5 - (x - 2.5) : x + 2.5 - (cx + 0.5)) * 0.55,
      );
    case 'surprised':
      return or(ring(x, y, 3.3, 2.1), disc(x, y, 1));
    default:
      return () => false;
  }
}

/** Eyes, mouth and cheeks in the glow colour, from the avatar's own traits. */
export function drawFace(p: Pix, t: Traits, b: Bot): void {
  const y = b.eyeY;
  if (t.eyes === 'visor') p.fill(box(b.cx, y, b.ex + 3, 1.5), 'glow');
  else if (t.eyes === 'cyclops') {
    p.fill(disc(b.cx, y, 3.8), 'glow');
    p.fill(disc(b.cx, y, 1.4), t.hasScreen ? 'screen' : 'body', -2);
  } else p.fill(or(eye(t.eyes, b.cx - b.ex, y, -1), eye(t.eyes, b.cx + b.ex, y, 1)), 'glow');
  p.fill(mouth(t.mouth, b.cx, b.mouthY), 'glow');
  if (t.hasCheeks)
    p.fill(or(ellipse(b.cx - b.ex - 1, y + 4.5, 2, 1), ellipse(b.cx + b.ex + 1, y + 4.5, 2, 1)), 'cheek');
}

function mouth(kind: Traits['mouth'], cx: number, y: number): Shape {
  const span =
    (half: number): Shape =>
    (x) =>
      Math.abs(x + 0.5 - cx) <= half;
  switch (kind) {
    case 'line':
      return and(span(4), rect(0, y, 63, y));
    case 'grille':
      return and(span(5), rect(0, y - 1, 63, y + 1), (x) => x % 2 === 0);
    case 'smile':
      return and(ring(cx, y - 4, 6, 4.8), (_x, yy) => yy >= y - 1);
    case 'frown':
      return and(ring(cx, y + 5, 6, 4.8), (_x, yy) => yy <= y);
    case 'teeth':
      return and(span(5), rect(0, y - 1, 63, y + 1), not(and(rect(0, y, 63, y), (x) => x % 3 === 0)));
    case 'dots':
      return and(rect(0, y, 63, y), (x) => Math.abs(x + 0.5 - cx) <= 6 && Math.floor(x + 0.5 - cx + 6) % 4 < 2);
    case 'speaker':
      return and(
        disc(cx, y, 3.2),
        not((x, yy) => (x + yy) % 2 === 0 && disc(cx, y, 2.2)(x, yy)),
      );
    case 'o':
      return ring(cx, y, 2.6, 1.3);
    case 'grin':
      return and(ellipse(cx, y - 1, 6, 3.5), (_x, yy) => yy >= y - 1, not(and(rect(0, y, 63, y), span(4))));
    case 'zigzag':
      return and(span(5), (x, yy) => yy === y + (Math.floor(x + 0.5 - cx + 6) % 4 < 2 ? 0 : 1));
    default:
      return () => false;
  }
}
