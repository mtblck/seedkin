import type { Traits } from '../../../src/styles/botling/types.js';
import { and, ellipse, not, or, type Pix, rect, rounded, type Shape } from '../canvas.js';
import type { Bot } from './head.js';

/** A stalk from (x, top) up `len` cells, leaning `lean` cells per cell of height. */
const stalk =
  (x: number, base: number, len: number, lean = 0): Shape =>
  (cx, cy) =>
    cy >= base - len && cy <= base && Math.abs(cx + 0.5 - (x + (base - cy) * lean)) < 1;

/** The top piece, drawn behind the head so the head covers its base. */
export function drawTop(p: Pix, t: Traits, b: Bot): void {
  const top = Math.round(b.top);
  const ball = (x: number, y: number): void => p.fill(ellipse(x, y, 2.6, 2.6), 'accent');
  switch (t.top) {
    case 'antenna':
      p.fill(stalk(b.cx, top + 1, 9), 'shade');
      return ball(b.cx, top - 9.5);
    case 'twin':
      p.fill(or(stalk(b.cx - 5, top + 1, 8, 0.3), stalk(b.cx + 5, top + 1, 8, -0.3)), 'shade');
      ball(b.cx - 7.6, top - 8);
      return ball(b.cx + 7.6, top - 8);
    case 'horns':
      return p.fill((x, y) => {
        if (y < top - 7 || y > top + 1) return false;
        const off = b.hx - 4 + (top - y) * 0.5;
        const half = (y - (top - 7)) * 0.35 + 0.4;
        return Math.abs(Math.abs(x + 0.5 - b.cx) - off) <= half;
      }, 'shade');
    case 'fin':
      return p.fill(
        and(ellipse(b.cx, top + 1, 2.6, 9), (_x, y) => y < top + 2),
        'accent',
      );
    case 'bolt':
      p.fill(rect(b.cx - 1, top - 3, b.cx, top + 1), 'shade');
      return p.fill(rounded(b.cx, top - 4, 3.6, 2, 1), 'accent');
    case 'dish':
      p.fill(rect(b.cx - 1, top - 6, b.cx, top + 1), 'shade');
      p.fill(
        and(ellipse(b.cx, top - 7, 6.5, 3.5), (_x, y) => y >= top - 7),
        'shade',
      );
      p.fill(rect(b.cx - 1, top - 11, b.cx, top - 7), 'shade');
      return ball(b.cx, top - 12);
    default:
      return;
  }
}

/** Ears, bolts or handles on both sides, or (`only`) one side. */
export function drawSides(p: Pix, kind: Traits['sides'], b: Bot, only?: -1): void {
  const sides = only ? [only] : [-1, 1];
  for (const s of sides) {
    const x = b.cx + s * (b.hx + 1.5);
    if (kind === 'bolts') {
      p.fill(ellipse(x, b.cy + 1, 2.8, 2.8), 'shade');
      p.fill(ellipse(x + s * 0.5, b.cy + 1, 1, 1), 'accent');
    } else if (kind === 'ears') {
      p.fill(rounded(x + s * 0.5, b.cy, 2.5, 5.5, 1.5), 'shade');
      p.fill(rounded(x + s * 2, b.cy, 1.2, 3, 1), 'accent');
    } else if (kind === 'handles') {
      p.fill(and(rounded(x + s * 1, b.cy, 3.5, 6.5, 2.5), not(rounded(x, b.cy, 2.2, 4.4, 1.5))), 'shade');
    }
  }
}

/** One-sided touches drawn on the head: a dent, a patch, or an off-centre antenna (behind). */
export function drawQuirk(p: Pix, t: Traits, b: Bot, front: boolean): void {
  const top = Math.round(b.top);
  if (!front && t.quirk === 'antenna') {
    p.fill(stalk(b.cx + b.hx - 5, top + 1, 8, -0.35), 'shade');
    p.fill(ellipse(b.cx + b.hx - 2.2, top - 7.5, 2, 2), 'accent');
  }
  if (!front && t.quirk === 'ear') drawSides(p, 'ears', b, -1);
  if (front && t.quirk === 'dent')
    p.over(
      and(ellipse(b.cx + b.hx - 5, top + 4, 2.4, 1.6), not(ellipse(b.cx + b.hx - 5, top + 3.2, 2.4, 1.4))),
      'body',
      ['body', 'shade'],
      -2,
    );
  if (front && t.quirk === 'patch') {
    p.over(rounded(b.cx - b.hx + 5, top + 5, 3, 2.2, 0.5), 'accent', ['body', 'shade']);
    p.over(
      (x, y) => rounded(b.cx - b.hx + 5, top + 5, 3, 2.2, 0.5)(x, y) && (x + y) % 3 === 0,
      'accent',
      ['accent'],
      -2,
    );
  }
}

/** Headphones, a visor, a bow or a cap, over the head. */
export function drawAccessory(p: Pix, t: Traits, b: Bot): void {
  const top = Math.round(b.top);
  switch (t.accessory) {
    case 'headphones':
      p.fill(
        and(
          ellipse(b.cx, b.cy + 1, b.hx + 3.6, b.hy + 4),
          not(ellipse(b.cx, b.cy + 1, b.hx + 1.6, b.hy + 2)),
          (_x, y) => y < b.cy - 2,
        ),
        'accent',
      );
      return p.fill(or(rounded(b.cx - b.hx - 1.5, b.cy, 3, 5, 2), rounded(b.cx + b.hx + 1.5, b.cy, 3, 5, 2)), 'accent');
    case 'visor':
      p.fill(rounded(b.cx, b.eyeY, b.hx + 1, 3.2, 1.5), 'visor');
      return p.fill(rect(b.cx - b.ex - 2, b.eyeY, b.cx + b.ex + 1, b.eyeY), 'glow');
    case 'bow': {
      const x = b.cx + b.hx - 5;
      const lobe =
        (s: number): Shape =>
        (cx, cy) => {
          const dx = (cx + 0.5 - x) * s;
          return dx > 0 && dx < 5.5 && Math.abs(cy + 0.5 - top) <= dx * 0.6 + 0.5;
        };
      p.fill(or(lobe(1), lobe(-1)), 'accent');
      return p.fill(ellipse(x, top, 1.4, 1.4), 'accent', -1);
    }
    case 'cap':
      p.fill(
        and(ellipse(b.cx, top + 6, b.hx + 1.5, 9), (_x, y) => y <= top + 5),
        'accent',
      );
      return p.fill(rect(b.cx, top + 4, b.cx + b.hx + 6, top + 5), 'accent', -1);
    default:
      return;
  }
}
