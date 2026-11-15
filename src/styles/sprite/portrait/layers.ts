import { and, ellipse, not, type Pix, type Shape } from '../../../core/portrait/canvas.js';
import { Role, type RoleGrid } from '../../../core/types.js';
import type { Anchor } from '../grid/draw.js';
import type { SpriteTraits } from '../types.js';
import { markRow } from './face.js';
import { type Fit, point } from './trace.js';

/**
 * The avatar row a fire Sprite's flame divides at, when it has a bar across
 * its brow: an ember's band of shade, or a bar mark on a flame or a wisp.
 * Below it the flame burns bright; above it, it rises as haze.
 */
export function barRow(
  t: SpriteTraits,
  frames: readonly { g: RoleGrid; at: Anchor }[],
  at: Anchor,
): number | undefined {
  if (t.form === 'ember') {
    const g = (frames[0] as { g: RoleGrid }).g;
    const r = g.findIndex((row) => row.filter((v) => v === Role.Shade).length >= 5);
    return r < 0 ? undefined : r;
  }
  if (['flame', 'wisp'].includes(t.form) && t.mark === 'bar') return markRow(frames, at, t);
  return undefined;
}

/**
 * The bright front of a layered flame: the part of `body` below the bar's
 * middle (`y`), its top edge rising into three short tongues.
 */
export function front(body: Shape, y: number, cx: number): Shape {
  const tongue = (x: number): number => {
    const w = (((x + 0.5 - cx + 5.5) % 11) + 11) % 11;
    return 8 * (1 - Math.abs(w / 5.5 - 1)) ** 1.6;
  };
  return and(body, (x, py) => py + 0.5 >= y - tongue(x));
}

/**
 * Paints the flame above the front as haze: solid, darker than the body,
 * and outlined, so the bright front stands out over it.
 */
export function haze(p: Pix, body: Shape, bright: Shape): void {
  p.fill(and(body, not(bright)), 'haze');
}

/**
 * A plus mark on a fire Sprite, drawn as a flame within the flame: a
 * teardrop with its point up, in the mark's colour, with a brighter tongue
 * inside, and no outline, so it burns as part of the body.
 */
export function tongue(p: Pix, x: number, y: number, s: number): void {
  const drop =
    (cx: number, cy: number, r: number, h: number): Shape =>
    (px, py) => {
      const [dx, dy] = [px + 0.5 - cx, py + 0.5 - cy];
      if (dy >= 0) return ellipse(cx, cy, r, r)(px, py);
      const k = 1 + dy / h;
      return k > 0 && Math.abs(dx) <= r * k ** 1.3;
    };
  p.over(drop(x, y + s * 0.5, s * 1.15, s * 2.2), 'mark', ['body', 'shade', 'screen']);
  p.over(drop(x, y + s * 0.7, s * 0.55, s * 1.3), 'flare', ['mark']);
}

/** Where a plus mark's middle sits on the portrait, or nothing when the Sprite has none. */
export function plusAt(
  t: SpriteTraits,
  frames: readonly { g: RoleGrid; at: Anchor }[],
  at: Anchor,
  f: Fit,
): [number, number] | undefined {
  if (t.mark !== 'plus') return undefined;
  const row = markRow(frames, at, t);
  return row === undefined ? undefined : point(f, at.x, row);
}
