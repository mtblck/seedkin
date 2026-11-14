import type { Rng } from '../random.js';
import type { Holiday } from '../types.js';
import { and, type Colours, ellipse, not, or, type Pix, rect } from './canvas.js';
import { bat, bunting, burst, clover, heart, pumpkin, sky, spots, stars, tree } from './props.js';

/** Every holiday scene's colours; the scene's own names, so they never clash with a figure's. */
export const HOLIDAY_COLOURS: Colours = {
  night: '#121633',
  night2: '#1e2450',
  dusk: '#2a1d48',
  dusk2: '#47306e',
  moon: '#f4e9c0',
  gold: '#f6c945',
  silver: '#e4e8f4',
  red: '#e0404a',
  blue: '#4a7ae0',
  white: '#f4f0e8',
  pink: '#f6b4c8',
  rose: '#e05a86',
  grass: '#4fa34a',
  grass2: '#3a8040',
  sky: '#86c8ec',
  orange: '#f08a2a',
  stem: '#4a7a2a',
  bark: '#5a3a28',
  pine: '#2f7a4a',
  wall: '#5a3a2c',
  floor: '#4a2a22',
  snow: '#f4f8ff',
  bat: '#0c0a16',
};

/**
 * Draws a holiday's backdrop, worn with that holiday's palette: fireworks
 * over a city night for New Year's and the Fourth of July (with bunting),
 * hearts for Valentine's, a rainbow over clover for St Patrick's, a moon,
 * bats and pumpkins for Halloween, and a lit tree by a snowy window for
 * Christmas. Props keep to the sides, out from behind the figure.
 */
export function holidayScene(p: Pix, kind: Holiday, rng: Rng, w: number): void {
  const at = spots(w);
  switch (kind) {
    case 'newYear':
    case 'fourthOfJuly': {
      sky(p, 'night', 'night2');
      stars(p, rng, w);
      const sparks = kind === 'newYear' ? ['gold', 'silver', 'gold'] : ['red', 'white', 'blue'];
      for (const [i, x] of at.entries())
        burst(p, x + (i % 2 ? 2 : -1), 12 + (i % 2) * 8, 6 + (i % 2), sparks[i % 3] as string, rng);
      p.fill((x, y) => y >= 50 - ((Math.floor(x / 5) * 7) % 9), 'night', -1);
      p.fill((x, y) => y >= 50 - ((Math.floor(x / 5) * 7) % 9) + 2 && x % 5 === 2 && y % 3 === 0, 'gold');
      if (kind === 'fourthOfJuly') bunting(p, w, ['red', 'white', 'blue']);
      else
        for (let i = 0; i < w / 3; i++)
          p.set(Math.floor(rng() * w), Math.floor(rng() * 64), rng() < 0.5 ? 'gold' : 'silver');
      return;
    }
    case 'valentines':
      p.fill(() => true, 'pink');
      p.fill(
        (x, y) =>
          heart(
            (Math.floor(x / 10) * 10 + 5 + (Math.floor(y / 10) % 2) * 5) % (w + 5),
            Math.floor(y / 10) * 10 + 5,
            2,
          )(x, y),
        'pink',
        -1,
      );
      for (const x of at) p.fill(heart(x, 14, 4.5), 'rose');
      p.fill((_x, y) => y >= 52, 'rose', -1);
      return;
    case 'stPatricks':
      p.fill(() => true, 'sky');
      for (const [i, m] of ['red', 'orange', 'gold', 'grass', 'blue'].entries())
        p.fill(
          and(
            ellipse(w / 2, 46, w * 0.46 - i * 2.4, 36 - i * 2.4),
            not(ellipse(w / 2, 46, w * 0.46 - (i + 1) * 2.4, 36 - (i + 1) * 2.4)),
          ),
          m,
          1,
        );
      p.fill((x, y) => y >= 44 + 2 * Math.sin(x / 6), 'grass');
      p.fill((x, y) => y >= 52 + Math.sin(x / 4), 'grass2');
      for (const x of at) for (const dx of [-3, 3]) clover(p, x + dx, 56 + (dx > 0 ? 2 : 0));
      return;
    case 'halloween':
      sky(p, 'dusk', 'dusk2');
      stars(p, rng, w, 'moon');
      p.fill(ellipse((at[at.length - 1] as number) - 2, 13, 7, 7), 'moon');
      p.fill(ellipse((at[at.length - 1] as number) - 4, 11, 1.6, 1.4), 'moon', -1);
      bat(p, (at[0] as number) + 2, 10);
      bat(p, (at[0] as number) + 8, 20);
      if (w > 64) bat(p, w / 2 + 6, 8);
      p.fill((x, y) => y >= 50 + Math.sin(x / 5), 'bat');
      for (const x of at) pumpkin(p, x, 60);
      return;
    case 'christmas': {
      p.fill(() => true, 'wall');
      p.fill((x) => x % 6 === 0, 'wall', -1);
      const win = at[0] as number;
      p.fill(rect(win - 6, 10, win + 6, 32), 'floor');
      p.fill(rect(win - 5, 11, win + 5, 31), 'night2');
      p.fill((x, y) => rect(win - 5, 11, win + 5, 31)(x, y) && (x * 7 + y * 3) % 9 === 0, 'snow');
      p.fill((x, y) => rect(win - 5, 28, win + 5, 31)(x, y), 'snow');
      p.fill(or(rect(win, 11, win, 31), rect(win - 5, 21, win + 5, 21)), 'floor');
      // String lights along the top.
      p.fill((x, y) => y === Math.round(4 + Math.abs(Math.sin(x / 6)) * 3), 'bat');
      for (let x = 3; x < w; x += 6)
        p.fill(
          ellipse(x, Math.round(4 + Math.abs(Math.sin(x / 6)) * 3) + 1.5, 1.1, 1.4),
          ['red', 'gold', 'blue', 'pink'][((x / 6) % 4) | 0] as string,
          1,
        );
      p.fill((_x, y) => y >= 52, 'floor');
      tree(p, at[at.length - 1] as number, 58);
      if (w > 64) tree(p, w / 2, 58);
      return;
    }
  }
}
