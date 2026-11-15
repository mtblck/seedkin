import { describe, expect, it } from 'vitest';
import { flipKeyframes } from '../src/core/portrait/motion.js';
import * as botling from '../src/styles/botling/portrait/index.js';
import { traits as botlingTraits } from '../src/styles/botling/traits.js';
import * as noggin from '../src/styles/noggin/portrait/index.js';
import { traits as nogginTraits } from '../src/styles/noggin/traits.js';
import * as snoot from '../src/styles/snoot/portrait/index.js';
import { traits as snootTraits } from '../src/styles/snoot/traits.js';
import * as sprite from '../src/styles/sprite/portrait/index.js';

describe('portrait motion matches the avatar', () => {
  const seeds = Array.from({ length: 60 }, (_, i) => `still-${i}`);
  const blinks = (svg: string): boolean => /class="p-eyes-/.test(svg);

  it("doesn't blink eyes that are shut or behind shades, or talk through a beard", () => {
    const never = (svgs: [boolean, string][]): void => {
      for (const [shut, svg] of svgs) if (shut) expect(blinks(svg)).toBe(false);
      expect(svgs.some(([, svg]) => blinks(svg))).toBe(true);
    };
    never(
      seeds.map((x) => [
        ['closed'].includes(nogginTraits(x).eyes) || nogginTraits(x).eyewear === 'shades',
        noggin.portrait(x, { animate: true }),
      ]),
    );
    never(seeds.map((x) => [botlingTraits(x).eyes === 'sleepy', botling.portrait(x, { animate: true })]));
    never(seeds.map((x) => [snootTraits(x).eyes === 'sleepy', snoot.portrait(x, { animate: true })]));
    for (const x of seeds) {
      if (nogginTraits(x).facial === 'beard')
        expect(/class="p-mouth-/.test(noggin.portrait(x, { animate: true })), x).toBe(false);
    }
  }, 30_000);

  it('wags the flipped figure of a duet the mirrored way', () => {
    // A Snoot with a wagging tail, on both sides of a duet.
    const seed = Array.from({ length: 40 }, (_, i) => `wag-${i}`).find((x) =>
      /-tail-/.test(snoot.portrait(x, { animate: true })),
    ) as string;
    const svg = snoot.duet(seed, seed, { animate: true });
    const tail = (id: string): string =>
      new RegExp(`@keyframes ${id}-tail-[\\w-]+\\{([^@]*?)\\}\\.`).exec(svg)?.[1] ?? '';
    expect(tail('pa')).toContain('rotate(-12deg)');
    expect(tail('pb')).toContain('rotate(12deg)');
    expect(tail('pb')).not.toContain('rotate(-12deg)');
  });

  it('turns each of two antennae on its own base, the right one mirrored as the avatar does', () => {
    const tops = (svg: string): string[] => [...svg.matchAll(/<g class="(p-top-[^"]+)"/g)].map((m) => m[1] as string);
    const svg = botling.portrait('jolly-sprocket-65', { animate: true });
    const [left, right] = tops(svg);
    expect(tops(svg)).toHaveLength(2);
    expect(left).not.toBe(right);
    const body = (c: string): string => new RegExp(`@keyframes ${c}\\{([^@]*?)\\}\\.`).exec(svg)?.[1] ?? '';
    expect(body(left as string)).toContain('rotate(-18deg)');
    expect(body(right as string)).toContain('rotate(18deg)');
  });

  it('draws a still Sprite once, and an animated one in four frames', () => {
    const frames = (svg: string): number => new Set(svg.match(/p-f\d/g)).size;
    expect(frames(sprite.portrait('a'))).toBe(0);
    expect(frames(sprite.portrait('a', { animate: true }))).toBe(4);
  });

  it('holds a boulder and a crystal still, and moves only their eyes, sprouts, sparkles and rocks', () => {
    for (const seed of ['boulder-9', 'crystal-4'])
      expect(sprite.portrait(seed, { animate: true }), seed).not.toMatch(/p-f\d/);
    expect(sprite.portrait('boulder-9', { animate: true })).toMatch(/class="p-rocks-/);
    expect(sprite.portrait('crystal-4', { animate: true })).toMatch(/class="p-motes-/);
  });

  it('squashes a bubble and sways a treetop smoothly, rather than swapping traced shapes', () => {
    const bubble = sprite.portrait('bubble-5', { animate: true });
    const tree = sprite.portrait('tree-6', { animate: true });
    for (const svg of [bubble, tree]) expect(svg).not.toMatch(/p-f\d/);
    expect(bubble).toMatch(/class="p-whole-/);
    expect(tree).toMatch(/class="p-crown-/);
    expect(tree).toMatch(/class="p-leaves-/);
  });

  it('hovers a planet gently, as it has no other move of its own', () => {
    expect(sprite.portrait('p14', { animate: true })).toMatch(
      /@keyframes p-whole-[\w-]+\{50%\{transform:translateY\(-1px\)\}\}/,
    );
    expect(sprite.portrait('p14')).not.toMatch(/p-whole-/);
  });

  it('draws the sparkles round a drop or a bubble as little bubbles, with see-through middles', () => {
    for (const seed of ['drop-4', 'bubble-5']) expect(sprite.portrait(seed), seed).toMatch(/fill="#[0-9a-f]{6}55"/);
    expect(sprite.portrait('crystal-4')).not.toMatch(/fill="#[0-9a-f]{6}55"/);
  });

  it("keeps a swaying Sprite's sparkles in place between frames, so they twinkle rather than jump", () => {
    const svg = sprite.portrait('drop-4', { animate: true });
    const motes = [...svg.matchAll(/<g class="p-motes-[^"]+">(.*?)<\/g>/g)].map((m) => m[1]);
    // One copy in each of the four frames, all alike.
    expect(motes.length % 4).toBe(0);
    expect(new Set(motes).size).toBe(motes.length / 4);
  });

  it('turns rotations the other way for the flipped figure in a duet', () => {
    expect(flipKeyframes('8%{transform:rotate(-12deg)}16%{transform:rotate(9deg) translateX(1px)}')).toBe(
      '8%{transform:rotate(12deg)}16%{transform:rotate(-9deg) translateX(-1px)}',
    );
    expect(flipKeyframes('50%{transform:translateY(-1px) scaleX(.8)}')).toBe(
      '50%{transform:translateY(-1px) scaleX(.8)}',
    );
  });

  it('sends drifting, rising and falling pieces the other way on the flipped figure', () => {
    expect(flipKeyframes('30%{transform:translate(3px,6px) rotate(25deg)}100%{transform:translate(-2px,-20px)}')).toBe(
      '30%{transform:translate(-3px,6px) rotate(-25deg)}100%{transform:translate(2px,-20px)}',
    );
  });

  it("sweeps a scanline down a Botling's screen, as its avatar does, and hides it at rest", () => {
    const seeds = Array.from({ length: 40 }, (_, i) => `scan-${i}`);
    for (const seed of seeds) {
      const screen = botlingTraits(seed).hasScreen;
      const svg = botling.portrait(seed, { animate: true });
      expect(svg.includes('class="p-scan0-'), seed).toBe(screen);
      expect(botling.portrait(seed)).not.toContain('scan');
      if (!screen) continue;
      // Each band starts a tenth of a second after the one above, and every band is hidden without motion.
      const starts = [...svg.matchAll(/\.p-scan(\d+)-[a-z0-9]+-(\d+)-(\d+)\{opacity:0\}/g)].map((m) => [
        Number(m[1]),
        Number(m[2]),
        Number(m[3]),
      ]);
      expect(starts.length).toBeGreaterThan(2);
      for (const [band, period, start] of starts)
        expect(start).toBe(
          ((starts[0]?.[2] as number) - (band as number) + (period as number) * 2) % (period as number),
        );
    }
  });
});
