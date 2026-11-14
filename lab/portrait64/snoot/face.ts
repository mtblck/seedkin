import type { SnootTraits } from '../../../src/styles/snoot/types.js';
import { and, ellipse, not, or, type Pix, rect, type Shape } from '../canvas.js';
import { tag } from '../motion.js';
import type { Head } from './head.js';

const disc = (x: number, y: number, r: number): Shape => ellipse(x, y, r, r);
const arc = (x: number, y: number, r: number, up: boolean): Shape =>
  and(disc(x, y, r), not(disc(x, y, r - 1.2)), (_cx, cy) => (up ? cy < y : cy >= y));
const both = (s: (x: number) => Shape, h: Head): Shape => or(s(h.cx - h.ex), s(h.cx + h.ex));

/** Markings in the shade colour: panda patches, a mask, stripes, a patch or spots. */
export function markings(p: Pix, t: SnootTraits, h: Head): void {
  const fur = ['body'];
  if (t.species === 'panda' || t.marking === 'mask')
    p.over(
      both((x) => ellipse(x, h.eyeY + 0.5, 4.6 * h.k, 3.6 * h.k), h),
      'shade',
      fur,
    );
  if (t.marking === 'mask') p.over(rect(0, Math.round(h.eyeY) - 1, 63, Math.round(h.eyeY) + 1), 'shade', fur);
  else if (t.marking === 'stripes') {
    p.over(
      or(
        rect(h.cx - 1, h.top, h.cx, h.top + 4),
        rect(h.cx - 5, h.top + 1, h.cx - 4, h.top + 3),
        rect(h.cx + 3, h.top + 1, h.cx + 4, h.top + 3),
      ),
      'shade',
      fur,
    );
    for (const s of [-1, 1])
      for (const dy of [3, 6])
        p.over(
          rect(
            Math.round(h.cx + s * (h.hx - 3)) - 1,
            Math.round(h.eyeY + dy),
            Math.round(h.cx + s * (h.hx - 3)) + 1,
            Math.round(h.eyeY + dy),
          ),
          'shade',
          fur,
        );
  } else if (t.marking === 'patch' && t.species !== 'panda') p.over(ellipse(h.cx - h.ex, h.eyeY, 5, 4.5), 'shade', fur);
  else if (t.marking === 'spots')
    p.over(
      or(disc(h.cx + 2.5, h.top + 3, 1.6), disc(h.cx - h.hx + 4, h.eyeY + 5, 1.8), disc(h.cx + 7, h.top + 1.5, 1.4)),
      'shade',
      fur,
    );
}

/** One eye of the avatar's kind, centred at (x, y). */
function eye(kind: SnootTraits['eyes'], x: number, y: number): Shape {
  switch (kind) {
    case 'dot':
      return disc(x, y, 2);
    case 'tall':
      return ellipse(x, y + 0.5, 1.6, 3);
    case 'shine':
      return disc(x, y, 2.7);
    case 'sleepy':
      return arc(x, y, 2.6, false);
    case 'happy':
      return arc(x, y + 1.5, 2.6, true);
    default:
      return () => false;
  }
}

/** Eyes (with an owl's discs and a frog's whites), then the muzzle, nose, mouth and cheeks. */
export function face(p: Pix, t: SnootTraits, h: Head): void {
  const frog = t.species === 'frog';
  // The eyes are one part, so they blink together, as the avatar's do.
  tag(p, 'eyes', () => {
    if (t.species === 'owl')
      p.fill(
        both((x) => disc(x, h.eyeY, 4.6 * h.k), h),
        'white',
      );
    if (frog)
      p.fill(
        both((x) => disc(x, h.eyeY, 4.2 * h.k), h),
        'white',
      );
    p.fill(
      both((x) => eye(t.eyes, x, h.eyeY), h),
      'glow',
    );
    if (t.eyes === 'shine' || t.eyes === 'dot')
      p.fill(
        both((x) => rect(Math.floor(x) - 1, Math.floor(h.eyeY) - 1, Math.floor(x) - 1, Math.floor(h.eyeY) - 1), h),
        'shine',
      );
  });
  muzzle(p, t, h);
  if (t.hasCheeks && t.species !== 'owl')
    p.fill(
      both((x) => ellipse(x + (x < h.cx ? -1.5 : 1.5), h.mY + 0.5, 2.2, 1.2), h),
      'cheek',
    );
}

function muzzle(p: Pix, t: SnootTraits, h: Head): void {
  const { cx, mY } = h;
  const open = t.mouth !== 'smile';
  const tongue = t.mouth === 'tongue';
  switch (t.species) {
    case 'owl':
      return p.fill(
        and(
          (x, y) => y >= mY - 4 && Math.abs(x + 0.5 - cx) <= (mY + 1 - y) * 0.45,
          (_x, y) => y <= mY + 1,
        ),
        'accent',
      );
    case 'pig':
      p.fill(ellipse(cx, mY, 4.6 * h.k, 3.2 * h.k), 'accent');
      p.fill(or(rect(cx - 3, mY - 1, cx - 2, mY), rect(cx + 1, mY - 1, cx + 2, mY)), 'glow');
      if (open) p.fill(ellipse(cx, mY + 5, 2, 1.2), tongue ? 'tongue' : 'glow');
      return;
    case 'frog':
      p.fill(
        and(arc(cx, mY - 6 * h.k, 9 * h.k, false), (x) => Math.abs(x + 0.5 - cx) < 8 * h.k),
        'glow',
      );
      if (tongue) p.fill(ellipse(cx, mY + 3.5, 1.6, 1.6), 'tongue');
      return;
    case 'fox':
      p.over(
        or(
          ellipse(cx, mY + 2 * h.k, 7 * h.k, 5 * h.k),
          ellipse(cx - h.hx + 3 * h.k, mY + h.k, 4 * h.k, 5 * h.k),
          ellipse(cx + h.hx - 3 * h.k, mY + h.k, 4 * h.k, 5 * h.k),
        ),
        'screen',
        ['body', 'shade'],
      );
      break;
    default:
      p.fill(ellipse(cx, mY + 0.5, 6 * h.k, 4.4 * h.k), 'screen');
  }
  p.fill(or(ellipse(cx, mY - 2, 2.2, 1.4)), 'glow');
  p.fill(rect(cx - 1, mY - 1, cx, mY), 'glow');
  if (open) {
    p.fill(ellipse(cx, mY + 2.2, 2.4, 1.8), 'glow');
    if (tongue) p.fill(ellipse(cx, mY + 3, 1.6, 1.4), 'tongue');
  } else p.fill(or(arc(cx - 2, mY, 2.2, false), arc(cx + 2, mY, 2.2, false)), 'glow');
}

/** The avatar's extra: a bow by one ear, a flower by the other, or whiskers. */
export function extra(p: Pix, t: SnootTraits, h: Head): void {
  if (t.extra === 'bow') {
    const x = h.cx - h.hx + 2;
    const y = h.top + 1;
    const lobe =
      (s: number): Shape =>
      (cx, cy) => {
        const dx = (cx + 0.5 - x) * s;
        return dx > 0 && dx < 5 && Math.abs(cy + 0.5 - y) <= dx * 0.6 + 0.5;
      };
    p.fill(or(lobe(1), lobe(-1)), 'accent');
    p.fill(disc(x, y, 1.3), 'accent', -1);
  } else if (t.extra === 'flower') {
    const x = h.cx + h.hx - 2;
    const y = h.top + 1;
    p.fill(or(disc(x - 2, y, 1.9), disc(x + 2, y, 1.9), disc(x, y - 2, 1.9), disc(x, y + 2, 1.9)), 'accent');
    p.fill(disc(x, y, 1.3), 'screen');
  } else if (t.extra === 'whiskers' && t.species !== 'frog') {
    for (const s of [-1, 1]) {
      for (const dy of [-1, 1.5]) {
        p.fill((x, y) => {
          const d = (x + 0.5 - (h.cx + s * 5)) * s;
          return d > 0 && d < h.hx + 1 && Math.abs(y + 0.5 - (h.mY + dy + d * 0.08 * dy)) < 0.5;
        }, 'whisker');
      }
    }
  }
}
