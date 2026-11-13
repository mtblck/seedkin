import type { Hair } from '../../src/styles/noggin/types.js';
import { and, ellipse, not, or, type Pix, rect, type Shape, sym } from './canvas.js';

/** Where the head is: centre, radii, and its own shape (with a tapered jaw). */
export interface Head {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  shape: Shape;
}

/** A head of half-width `rx`, centred on the 64-wide canvas. */
export function head(rx: number): Head {
  const cx = 32;
  const cy = 27;
  const ry = 15;
  const shape: Shape = (x, y) => {
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    const k = dy > 0 ? 1 - 0.22 * (dy / ry) ** 1.5 : 1;
    return (dx / (rx * k)) ** 2 + (dy / ry) ** 2 <= 1;
  };
  return { cx, cy, rx, ry, shape };
}

const above =
  (y0: number): Shape =>
  (_x, y) =>
    y < y0;
const outer =
  (h: Head, d: number): Shape =>
  (x) =>
    Math.abs(x + 0.5 - h.cx) > h.rx - d;

/** Small round curls along a curve, for curly hair and afros. */
function curls(h: Head, r: number, grow: number, from: number, to: number): Shape {
  const dots: Shape[] = [];
  for (let a = from; a <= to; a += 0.32) {
    dots.push(ellipse(h.cx + (h.rx + grow) * Math.cos(a), h.cy + (h.ry + grow * 0.7) * Math.sin(a), r, r));
  }
  return or(...dots);
}

/**
 * Paints hair behind the head (and behind the shoulders, when long).
 *
 * @param p - Figure canvas
 * @param style - The Noggin's hairstyle
 * @param h - The head
 */
export function backHair(p: Pix, style: Hair, h: Head): void {
  const cap = and(ellipse(h.cx, h.cy - 1, h.rx + 1.6, h.ry + 1), above(h.cy + 4));
  const hair = (s: Shape): void => p.fill(s, 'hair');
  switch (style) {
    case 'short':
    case 'spiky':
    case 'sidepart':
      return hair(cap);
    case 'bun':
      hair(ellipse(h.cx, 9, 5.5, 5));
      return hair(cap);
    case 'mohawk':
      return hair(and(ellipse(h.cx, 20, 3.6, 17), above(22)));
    case 'bob':
      return hair(and(ellipse(h.cx, h.cy, h.rx + 3.2, h.ry + 2), above(44)));
    case 'long':
      return hair(
        or(
          and(ellipse(h.cx, h.cy, h.rx + 3.2, h.ry + 2), above(h.cy)),
          and(rect(h.cx - h.rx - 3.5, h.cy - 1, h.cx + h.rx + 2.5, 60), not(ellipse(h.cx, 63, 8, 6))),
        ),
      );
    case 'curly':
      return hair(or(cap, curls(h, 4, 1.5, Math.PI * 0.85, Math.PI * 2.15)));
    case 'afro':
      return hair((x, y) => {
        const dx = x + 0.5 - h.cx;
        const dy = y + 0.5 - (h.cy - 3);
        const a = Math.atan2(dy, dx);
        return Math.hypot(dx / (h.rx + 9), dy / (h.ry + 6)) <= 1 + 0.06 * Math.sin(a * 9);
      });
    case 'locs':
      hair(cap);
      return hair(
        and(
          (x) => Math.abs(x + 0.5 - h.cx) > h.rx - 3 && (x + 1) % 3 !== 0,
          rect(h.cx - h.rx - 4, h.cy - 4, h.cx + h.rx + 3, 56),
        ),
      );
    default:
      return;
  }
}

/**
 * Paints hair over the head: fringes, partings, sideburns, and strands that
 * fall in front of the shoulders.
 *
 * @param p - Figure canvas
 * @param style - The Noggin's hairstyle
 * @param h - The head
 */
export function frontHair(p: Pix, style: Hair, h: Head): void {
  const onHead = (s: Shape, m = 'hair'): void => p.over(s, m, ['skin']);
  const top = h.cy - h.ry;
  switch (style) {
    case 'buzz':
      return onHead(or(above(top + 7), and(above(h.cy - 1), outer(h, 1.5))), 'buzz');
    case 'short':
    case 'bun':
      return onHead(
        or(
          above(top + 6),
          and(above(top + 8), (x) => x % 6 < 3),
          and(above(h.cy), outer(h, 2)),
        ),
      );
    case 'spiky': {
      onHead(
        or(
          above(top + 6),
          and(above(top + 8), (x) => x % 5 < 2),
          and(above(h.cy - 1), outer(h, 2)),
        ),
      );
      const spikes: Shape[] = [-2, -1, 0, 1, 2].map((i) => {
        const ax = h.cx + i * 5;
        const ay = 5 + Math.abs(i) * 2;
        return (x, y) => y >= ay && y <= top + 4 && Math.abs(x + 0.5 - ax) <= (y - ay) * 0.55 + 0.5;
      });
      return p.fill(or(...spikes), 'hair');
    }
    case 'sidepart':
      return onHead(
        or(above(top + 5), (x, y) => y < top + 11 - (x - (h.cx - h.rx)) * 0.45, and(above(h.cy), outer(h, 2))),
      );
    case 'mohawk':
      onHead(
        and(
          above(top + 8),
          not((x) => Math.abs(x + 0.5 - h.cx) < 4),
        ),
        'buzz',
      );
      return onHead(and(above(top + 7), (x) => Math.abs(x + 0.5 - h.cx) < 4));
    case 'bob':
      return onHead(or(above(top + 9), outer(h, 2.5)));
    case 'long':
      onHead(or((x, y) => y < top + 3 + Math.abs(x + 0.5 - h.cx) * 0.7, outer(h, 2.5)));
      return p.fill(
        sym(and(rect(h.cx - h.rx - 4, 45, h.cx - h.rx + 1, 58), not(ellipse(h.cx - h.rx + 1, 59, 2.5, 2.5)))),
        'hair',
      );
    case 'curly':
      onHead(above(top + 5));
      return p.fill(and(curls(h, 2.6, -3, Math.PI * 1.05, Math.PI * 1.95), above(top + 9)), 'hair');
    case 'afro':
      return onHead((x, y) => y < top + 5 + ((x + 0.5 - h.cx) / h.rx) ** 2 * 5);
    case 'locs':
      onHead(
        or(
          above(top + 4),
          and((x, y) => (x + 1) % 3 !== 0 && y < top + 9 + ((x * 7) % 3), above(top + 12)),
        ),
      );
      return p.fill(sym(and((x) => (x + 1) % 3 !== 0, rect(h.cx - h.rx - 4, 45, h.cx - h.rx + 1, 57))), 'hair');
    default:
      return;
  }
}
