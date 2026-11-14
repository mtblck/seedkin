import { and, ellipse, not, or, type Pix, rect, type Shape } from '../../../core/portrait/canvas.js';
import { tag } from '../../../core/portrait/motion.js';
import type { RoleGrid } from '../../../core/types.js';
import { Role } from '../../../core/types.js';
import type { Anchor } from '../grid/draw.js';
import { CELLS } from '../grid/mark.js';
import type { SpriteTraits } from '../types.js';
import { type Fit, point } from './trace.js';

const disc = (x: number, y: number, r: number): Shape => ellipse(x, y, r, r);

/**
 * Glancing eyes look one column over (`m`: right, or left on a mirrored
 * Sprite) when both still land on the Sprite, as the avatar's do.
 */
function glance(g: RoleGrid, at: Anchor, m: number): number {
  const ok = (c: number, r: number): boolean => g[r]?.[c] === Role.Body || g[r]?.[c] === Role.Screen;
  return [-1, 1].every((sd) => ok(at.x + sd * at.dx + m, at.y) && ok(at.x + sd * at.dx + m, at.y + 1)) ? m : 0;
}

/** One eye of a kind, centred on avatar column `c`, with its two rows starting at `r`. */
function eye(p: Pix, f: Fit, kind: SpriteTraits['eyes'], c: number, r: number, inward: number): void {
  const s = f.s;
  switch (kind) {
    case 'round': {
      const [x, y] = point(f, c + inward * 0.5, r + 0.5);
      p.fill(disc(x, y, s * 0.95), 'face');
      p.fill(
        rect(Math.round(x - s * 0.4), Math.round(y - s * 0.4), Math.round(x - s * 0.4) + 1, Math.round(y - s * 0.4)),
        'shine',
      );
      return;
    }
    case 'happy': {
      const [x, y] = point(f, c, r + 0.8);
      const r0 = s * 0.95;
      p.fill(
        and(disc(x, y, r0), not(disc(x, y + 0.2, r0 - 1.5)), (_x, yy) => yy < y),
        'face',
      );
      return;
    }
    case 'sleepy': {
      const [x, y] = point(f, c + inward * 0.5, r + 1);
      const r0 = s * 0.95;
      p.fill(
        and(disc(x, y - 1, r0), not(disc(x, y - 2.4, r0)), (_x, yy) => yy >= y - 1),
        'face',
      );
      return;
    }
    case 'tiny': {
      const [x, y] = point(f, c, r + 1);
      p.fill(disc(x, y, 1.6), 'face');
      return;
    }
    default: {
      const [x, y] = point(f, c, r + 0.5);
      p.fill(ellipse(x, y, s * 0.42, s * 0.85), 'face');
      p.fill(rect(Math.round(x - 1), Math.round(y - s * 0.5), Math.round(x - 1), Math.round(y - s * 0.5)), 'shine');
    }
  }
}

/**
 * The avatar's eyes, mouth and cheeks, drawn smooth at the portrait's size.
 * `g` and `at` are already mirrored for a mirrored Sprite; the avatar draws its
 * face before mirroring, so a wink, a glance and a smirk turn the other way too.
 */
export function face(p: Pix, g: RoleGrid, at: Anchor, t: SpriteTraits, f: Fit, blinks = false): void {
  const { x, dx, y } = at;
  const m = t.isMirrored ? -1 : 1;
  const inner = Math.max(dx - 1, 1);
  const shift = t.eyes === 'glance' ? glance(g, at, m) : 0;
  const eyes = (): void => {
    for (const sd of [-1, 1]) {
      const kind = t.eyes === 'wink' ? (sd * m < 0 ? 'dots' : 'sleepy') : t.eyes;
      const col = kind === 'close' || kind === 'round' || kind === 'sleepy' ? inner : dx;
      // Round and sleepy eyes are two cells wide, so their middles sit half a cell further out.
      eye(p, f, kind === 'close' ? 'dots' : kind, x + sd * col + shift, y, sd);
    }
  };
  // A still Sprite's eyes blink, so it still looks alive.
  if (blinks) tag(p, 'eyes', eyes);
  else eyes();
  mouth(p, t, f, x, y + 3 + (at.mouthDy ?? 0), m);
  if (t.hasBlush)
    for (const sd of [-1, 1]) {
      const [bx, by] = point(f, x + sd * (dx + 2), y + 2);
      // Kept on the body, so a narrow crystal's cheeks don't stick out past its edge.
      p.over(ellipse(bx, by, f.s * 0.6, f.s * 0.32), 'blush', ['body', 'shade', 'screen']);
    }
}

function mouth(q: Pix, t: SpriteTraits, f: Fit, c: number, r: number, m: number): void {
  const [x, y] = point(f, c, r);
  const s = f.s;
  // A mouth over a bright core is filled in dark, or the glow shows through it.
  const glow = (shape: Shape): boolean => {
    for (let yy = 0; yy < q.h; yy++)
      for (let xx = 0; xx < q.w; xx++) if (shape(xx, yy) && q.get(xx, yy) === 'screen') return true;
    return false;
  };
  const p = { fill: (shape: Shape, mat: string): void => q.fill(shape, glow(shape) ? 'ink' : mat) };
  const smile =
    (w: number, deep: number, tilt = 0): Shape =>
    (cx, cy) => {
      const dx = cx + 0.5 - x;
      const top = y - s * 0.3 + tilt * dx;
      const curve = top + deep * (1 - (dx / w) ** 2);
      const line = Math.abs(dx) <= w && Math.abs(cy + 0.5 - curve) <= 0.9;
      // Over the core the whole smile is filled, from its corners down to the curve.
      return line || (filled && Math.abs(dx) <= w && cy + 0.5 >= top && cy + 0.5 <= curve);
    };
  let filled = false;
  filled = glow(smile(s * 1.5, s * 0.9));
  switch (t.mouth) {
    case 'dot':
      p.fill(disc(x, y, 1.3), 'face');
      return;
    case 'smile':
      p.fill(smile(s * 1.2, s * 0.9), 'face');
      return;
    case 'grin':
      p.fill(smile(s * 1.5, s * 0.35), 'face');
      return;
    case 'open':
      p.fill(
        and(ellipse(x, y, s * 1.3, s * 1.2), (_x, cy) => cy + 0.5 >= y - s * 0.2),
        'face',
      );
      return;
    case 'smirk':
      p.fill(smile(s * 1.2, s * 0.4, -0.3 * m), 'face');
      return;
    case 'oh':
      p.fill(ellipse(x, y + s * 0.5, s * 0.55, s * 0.85), 'face');
      return;
    default:
      return;
  }
}

/** The forehead mark, where the avatar puts it: two rows over the eyes, raised until it fits every frame. */
export function mark(
  p: Pix,
  frames: readonly { g: RoleGrid; at: Anchor }[],
  at: Anchor,
  t: SpriteTraits,
  f: Fit,
): void {
  const cells = CELLS[t.mark];
  if (cells.length === 0) return;
  const lift = [0, 1, 2].find((n) =>
    frames.every((fr) => cells.every(([mx, my]) => fr.g[fr.at.y - 2 - n + my]?.[fr.at.x + mx] === Role.Body)),
  );
  if (lift === undefined) return;
  const pts = cells.map(([mx, my]) => point(f, at.x + mx, at.y - 2 - lift + my));
  // Joined into one smooth mark: each cell a dot, neighbours bridged.
  const parts: Shape[] = pts.map(([px, py]) => disc(px, py, f.s * 0.45));
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const [a, b] = [pts[i] as [number, number], pts[j] as [number, number]];
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) > f.s * 1.5) continue;
      parts.push((cx, cy) => {
        const [qx, qy] = [cx + 0.5 - a[0], cy + 0.5 - a[1]];
        const [vx, vy] = [b[0] - a[0], b[1] - a[1]];
        const k = Math.max(0, Math.min(1, (qx * vx + qy * vy) / (vx * vx + vy * vy)));
        return Math.hypot(qx - k * vx, qy - k * vy) <= f.s * 0.4;
      });
    }
  p.fill(or(...parts), 'mark');
}
