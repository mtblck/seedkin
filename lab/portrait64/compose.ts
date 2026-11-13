import type { Rng } from '../../src/core/random.js';
import { type Colours, createPix, type Pix } from './canvas.js';
import { type Scene, scene } from './scene.js';
import { toSvg } from './svg.js';

/** A drawn character: its canvas, colours, the portrait's generator, its background and the scenes it can stand in. */
export interface Figure {
  p: Pix;
  colours: Colours;
  rng: Rng;
  bg: string;
  scenes: readonly Scene[];
}

/**
 * A figure in its seeded scene, as SVG.
 *
 * @param f - The figure
 * @param px - Pixels per cell
 */
export function single(f: Figure, px = 4): string {
  return toSvg([scene(f.rng, f.bg, 64, f.scenes), { p: f.p, colours: f.colours }], px);
}

/** Two figures facing each other in one 128x64 scene, the left one's; the right one is flipped. */
export function pair(a: Figure, b: Figure, px = 4): string {
  const back = scene(a.rng, a.bg, 128, a.scenes);
  const p = createPix(128, 64);
  const colours: Colours = {};
  for (const [f, dx, flip, k] of [
    [a, 2, false, 'a'],
    [b, 62, true, 'b'],
  ] as const) {
    for (const [m, c] of Object.entries(f.colours)) colours[`${k}${m}`] = c;
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const sx = flip ? 63 - x : x;
        const m = f.p.get(sx, y);
        if (m !== '') p.set(x + dx, y, `${k}${m}`, (f.p.tone[y] as number[])[sx] as number);
      }
    }
  }
  return toSvg([back, { p, colours }], px);
}
