import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { flipKeyframes } from '../src/core/portrait/motion.js';
import type { Holiday } from '../src/core/types.js';
import { HOLIDAY_PALETTES as beastieHolidays } from '../src/styles/beastie/index.js';
import * as beastie from '../src/styles/beastie/portrait/index.js';
import { HOLIDAY_PALETTES as botlingHolidays } from '../src/styles/botling/index.js';
import * as botling from '../src/styles/botling/portrait/index.js';
import { traits as botlingTraits } from '../src/styles/botling/traits.js';
import { HOLIDAY_PALETTES as nogginHolidays } from '../src/styles/noggin/index.js';
import * as noggin from '../src/styles/noggin/portrait/index.js';
import { traits as nogginTraits } from '../src/styles/noggin/traits.js';
import { HOLIDAY_PALETTES as snootHolidays } from '../src/styles/snoot/index.js';
import * as snoot from '../src/styles/snoot/portrait/index.js';
import { traits as snootTraits } from '../src/styles/snoot/traits.js';
import { HOLIDAY_PALETTES as spriteHolidays } from '../src/styles/sprite/index.js';
import * as sprite from '../src/styles/sprite/portrait/index.js';

const STYLES = { beastie, botling, noggin, snoot, sprite };
const PALETTES = {
  beastie: beastieHolidays,
  botling: botlingHolidays,
  noggin: nogginHolidays,
  snoot: snootHolidays,
  sprite: spriteHolidays,
};
const HOLIDAYS: Holiday[] = ['newYear', 'valentines', 'stPatricks', 'fourthOfJuly', 'halloween', 'christmas'];
const digest = (parts: Iterable<string>): string => {
  const h = createHash('sha256');
  for (const part of parts) h.update(part).update('\n');
  return h.digest('hex').slice(0, 16);
};
const fills = (svg: string): Set<string> => new Set([...svg.matchAll(/fill="([^"]+)"/g)].map((m) => m[1] as string));

describe.each(Object.entries(STYLES))('%s portraits', (name, style) => {
  it('has an entry point of its own, so apps drawing only avatars never load it', () => {
    const exports = JSON.parse(fs.readFileSync('package.json', 'utf8')).exports;
    expect(exports[`./${name}/portrait`].default).toBe(`./dist/styles/${name}/portrait/index.js`);
    expect(fs.readFileSync(`src/styles/${name}/index.ts`, 'utf8')).not.toContain('portrait');
  });

  it('draws the same portrait for a seed every time, and another for another seed', () => {
    expect(style.portrait('mtblck')).toBe(style.portrait('mtblck'));
    expect(style.portrait('mtblck')).not.toBe(style.portrait('botcollector'));
  });

  it('is a 64-cell SVG at the size asked, 256px by default', () => {
    const svg = style.portrait('a');
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 64 64" width="256" height="256"/);
    expect(style.portrait('a', { size: 128 })).toContain('width="128" height="128"');
    expect(style.duet('a', 'b', { size: 128 })).toContain('viewBox="0 0 128 64" width="256" height="128"');
  });

  it('is self-contained: no scripts, links or outside references', () => {
    for (const svg of [style.portrait('a', { animate: true }), style.duet('a', 'b', { animate: true })]) {
      expect(svg).not.toMatch(/<script|href|url\(|@import/i);
      expect(svg.match(/http/g)).toHaveLength(1);
    }
  });

  it('comes as a data: URI too, for an <img src>', () => {
    expect(
      decodeURIComponent(style.portraitDataUri('a', { size: 64 }).replace(/^data:image\/svg\+xml;charset=utf-8,/, '')),
    ).toBe(style.portrait('a', { size: 64 }));
  });

  it('is named for screen readers, or hidden when decorative', () => {
    expect(style.portrait('a')).toMatch(/role="img" aria-label="[A-Z][a-z]+ portrait"/);
    expect(style.duet('a', 'b')).toMatch(/aria-label="[A-Z][a-z]+ portraits"/);
    expect(style.portrait('a', { title: 'Ada & "Bo"' })).toContain('aria-label="Ada &#38; &#34;Bo&#34;"');
    expect(style.portrait('a', { title: null })).toContain('aria-hidden="true"');
  });

  it('moves only when asked, and holds still for reduced motion', () => {
    expect(style.portrait('a')).not.toContain('@keyframes');
    // Some seeds hold still where their avatar does (shut eyes, a beard), but not every one.
    const moving = ['a', 'b', 'c', 'd']
      .map((x) => style.portrait(x, { animate: true }))
      .find((svg) => svg.includes('<g class'));
    expect(moving).toContain('@media (prefers-reduced-motion:no-preference){');
  });

  it('keeps two portraits on one page from sharing animation classes', () => {
    const classes = (svg: string): Set<string> =>
      new Set([...svg.matchAll(/class="([^"]+)"/g)].map((m) => m[1] as string));
    const a = classes(style.portrait('a', { animate: true }));
    const b = [...classes(style.portrait('b', { animate: true }))];
    // Shared names are fine only where both define the same rule; names are hashed from their rules.
    for (const c of b.filter((x) => a.has(x))) expect(c).toMatch(/-[0-9a-z]+$/);
  });

  it.each(HOLIDAYS)('dresses for %s with that palette and scene', (holiday) => {
    const svg = style.portrait('a', { holiday });
    expect(svg).not.toBe(style.portrait('a'));
    const used = fills(svg);
    const palette = Object.values(PALETTES[name as keyof typeof PALETTES][holiday] as Record<string, string>).filter(
      (v) => v.startsWith('#'),
    );
    expect(palette.some((c) => used.has(c))).toBe(true);
  });

  it('rejects options that would otherwise fail quietly', () => {
    for (const size of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, '96' as unknown as number]) {
      expect(() => style.portrait('a', { size })).toThrow(RangeError);
    }
    expect(() => style.portrait('a', { animate: 'yes' as unknown as boolean })).toThrow(RangeError);
    expect(() => style.portrait('a', { holiday: 'easter' as Holiday })).toThrow(`${name}: unknown holiday "easter"`);
    expect(() => style.duet('a', 'b', { title: 3 as unknown as string })).toThrow(RangeError);
  });
});

// Portraits are a Preview: the picture may change in a minor. This digest only
// makes a change deliberate: update it when you mean to redraw them.
describe('portrait corpus', () => {
  it('draws what it drew', () => {
    const seeds = Array.from({ length: 12 }, (_, i) => `corpus-${i}`);
    expect(
      Object.fromEntries(
        Object.entries(STYLES).map(([name, s]) => [name, digest(seeds.map((x) => s.portrait(x, { animate: true })))]),
      ),
    ).toMatchSnapshot();
  });
});

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
  });

  it('turns rotations the other way for the flipped figure in a duet', () => {
    expect(flipKeyframes('8%{transform:rotate(-12deg)}16%{transform:rotate(9deg) translateX(1px)}')).toBe(
      '8%{transform:rotate(12deg)}16%{transform:rotate(-9deg) translateX(-1px)}',
    );
    expect(flipKeyframes('50%{transform:translateY(-1px) scaleX(.8)}')).toBe(
      '50%{transform:translateY(-1px) scaleX(.8)}',
    );
  });
});
