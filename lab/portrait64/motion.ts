import { createRng } from '../../src/core/random.js';
import { clocks, SPECS } from '../../src/core/render/motion.js';
import type { Pix } from './canvas.js';

/** How a portrait's part moves: the avatar's four, a tail's wag, wings' flap, or a float. */
export type Move = 'blink' | 'talk' | 'wobble' | 'twitch' | 'wag' | 'flap' | 'hover';

/** One moving part's rule: keyframes, period and start in tenths of a second, and its pivot. */
export interface Rule {
  keyframes: string;
  period: number;
  offset: number;
  origin: string;
  timing: string;
}

/** What moves in one figure, by part name, plus a rule for the whole figure. */
export interface Motion {
  parts: Record<string, Rule>;
  whole?: Rule;
}

const EXTRA: Record<'wag' | 'flap', { keyframes: string; period: [number, number] }> = {
  wag: {
    keyframes: '0%,50%,100%{transform:none}8%,24%{transform:rotate(-12deg)}16%,32%{transform:rotate(9deg)}',
    period: [24, 36],
  },
  flap: {
    keyframes: '0%,70%,100%{transform:none}78%,92%{transform:scaleX(.82)}85%{transform:scaleX(1.04)}',
    period: [26, 40],
  },
};

/** Draws `fn` as part `name`: its cells move together, and what they cover is kept to show beneath. */
export function tag(p: Pix, name: string, fn: () => void): void {
  const was = p.current;
  p.current = name;
  fn();
  p.current = was;
}

/**
 * Times a figure's moving parts. Blinks, talks, wobbles and twitches take the
 * avatar's own clock (`styleSeed` is the avatar's salted seed), so a portrait
 * blinks when its avatar does; wags, flaps and floats have their own.
 *
 * @param styleSeed - The seed the avatar animates from, e.g. `snoot:abc`
 * @param parts - Each part's move and pivot (CSS transform-origin in its box)
 * @param whole - A move for the whole figure, if it floats
 */
export function motion(styleSeed: string, parts: Record<string, [Move, string]>, whole?: Move): Motion {
  const clock = clocks(createRng(`${styleSeed}\u0000animate`));
  const own = createRng(`${styleSeed}\u0000portrait-motion`);
  const rule = (m: Move, origin: string): Rule => {
    if (m === 'wag' || m === 'flap') {
      const [lo, hi] = EXTRA[m].period;
      const period = lo + Math.floor(own() * (hi - lo));
      return {
        keyframes: EXTRA[m].keyframes,
        period,
        offset: Math.floor(own() * period),
        origin,
        timing: ' ease-in-out',
      };
    }
    const c = clock[m];
    // Avatars hover by .4 of a 1-unit cell; a portrait floats by one of its own.
    // The avatar's hover and twitch move a fraction of its big cell; a portrait's move one of its own.
    const keyframes =
      m === 'hover'
        ? '50%{transform:translateY(-1px)}'
        : m === 'twitch'
          ? '0%,88%,93%,100%{transform:none}90%,96%{transform:translateY(-1px)}'
          : SPECS[c.name].keyframes;
    return { keyframes, period: c.period, offset: c.offset, origin, timing: SPECS[c.name].timing ?? '' };
  };
  const out: Motion = { parts: {} };
  for (const [name, [m, origin]] of Object.entries(parts)) out.parts[name] = rule(m, origin);
  if (whole) out.whole = rule(whole, 'center');
  return out;
}

/** A short stable hash, for class names. */
const hash = (s: string): string => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h.toString(36);
};

/** Flips a pivot left to right, for a figure drawn facing the other way. */
export const flipOrigin = (o: string): string => o.replace(/^(\d+)%/, (_m, x: string) => `${100 - Number(x)}%`);

/**
 * Class names and the `<style>` for a figure's moving parts. Names carry the
 * rule itself, so two figures in one picture, or two portraits on one page,
 * each keep their own clocks.
 */
export function css(
  m: Motion,
  id: string,
  flipped: boolean,
): { cls: Record<string, string>; whole: string; style: string } {
  const cls: Record<string, string> = {};
  let style = '';
  const add = (name: string, r: Rule): string => {
    const origin = flipped ? flipOrigin(r.origin) : r.origin;
    // Named for everything in the rule, so portraits on one page never restyle each other.
    const c = `${id}-${name}-${hash(r.keyframes + origin + r.timing)}-${r.period}-${r.offset}`;
    style += `@keyframes ${c}{${r.keyframes}}.${c}{transform-box:fill-box;transform-origin:${origin};animation:${c} ${r.period / 10}s${r.timing} ${-r.offset / 10}s infinite}`;
    return c;
  };
  for (const [name, r] of Object.entries(m.parts)) cls[name] = add(name, r);
  const whole = m.whole ? add('whole', m.whole) : '';
  return { cls, whole, style };
}
