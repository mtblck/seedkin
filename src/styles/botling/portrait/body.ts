import { and, ellipse, not, or, type Pix, rect, rounded } from '../../../core/portrait/canvas.js';

/** What a robot can wear. */
export type Gear = 'bare' | 'scarf' | 'bowtie' | 'hoodie' | 'straps';
const CX = 32;

/** A segmented neck, a torso with arms, and what the robot wears on it. */
export function body(p: Pix, gear: Gear, light: boolean, neckTop: number): void {
  const chassis = rounded(CX, 64, 25, 16, 6);
  const hole = ellipse(CX, 47.5, 5.6, 2.6);
  if (gear === 'hoodie')
    p.fill(
      and(ellipse(CX, 50, 15, 6.5), (_x, y) => y <= 52),
      'fabric',
      1,
    );
  p.fill(rect(CX - 4, Math.floor(neckTop) - 2, CX + 3, 50), 'shade');
  p.fill(
    and(rect(CX - 4, Math.floor(neckTop), CX + 3, 50), (_x, y) => y % 3 === 0),
    'shade',
    -1,
  );
  if (gear === 'hoodie') {
    p.fill(and(chassis, not(hole)), 'fabric');
    p.fill(or(rect(CX - 4, 51, CX - 4, 58), rect(CX + 3, 51, CX + 3, 58)), 'accent');
    return;
  }
  // Arms hang from ball joints beside a narrower torso, splayed a little so
  // the background shows between, and ringed like the neck.
  const arm =
    (s: number) =>
    (x: number, y: number): boolean =>
      y >= 50 && Math.abs(x + 0.5 - (CX + s * (20 + (y - 50) * 0.5))) <= 3.4;
  const arms = or(arm(-1), arm(1));
  p.fill(arms, 'body');
  p.fill(
    and(arms, (_x, y) => y % 3 === 1 && y > 54),
    'shade',
    -1,
  );
  p.fill(rounded(CX, 64, 15, 16, 5), 'body');
  p.fill(or(ellipse(CX - 18, 51.5, 4.4, 4.4), ellipse(CX + 18, 51.5, 4.4, 4.4)), 'shade');
  p.fill(rounded(CX, 57, 9, 5, 2), 'panel');
  if (light) {
    p.fill(ellipse(CX, 57, 2.8, 2.8), 'accent');
    p.fill(rect(CX - 2, 55, CX - 2, 55), 'light');
  } else
    p.fill(
      and(rect(CX - 6, 55, CX + 5, 59), (_x, y) => y % 2 === 1),
      'screen',
    );
  if (gear === 'scarf') {
    p.fill(or(ellipse(CX, 48, 12, 4), ellipse(CX + 1, 51, 11, 3.5)), 'fabric');
    p.fill(
      and(
        rect(CX + 3, 51, CX + 8, 63),
        not((x, y) => y > 61 && x % 2 === 0),
      ),
      'fabric',
      -1,
    );
  } else if (gear === 'bowtie') {
    const wing = (s: number) => (x: number, y: number) => {
      const dx = (x + 0.5 - CX) * s;
      return dx > 0 && dx < 5 && Math.abs(y + 0.5 - 49) <= dx * 0.55 + 0.6;
    };
    p.fill(or(wing(1), wing(-1)), 'fabric');
    p.fill(ellipse(CX, 49, 1.3, 1.3), 'fabric', -1);
  } else if (gear === 'straps') {
    p.fill(or(rect(CX - 9, 48, CX - 7, 63), rect(CX + 6, 48, CX + 8, 63), rect(CX - 9, 58, CX + 8, 63)), 'fabric');
    p.fill(or(ellipse(CX - 7.5, 58.5, 1, 1), ellipse(CX + 7.5, 58.5, 1, 1)), 'accent');
  }
}
