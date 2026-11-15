import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Holiday } from '../src/core/types.js';
import { HOLIDAY_PALETTES as beastieHolidays } from '../src/styles/beastie/index.js';
import * as beastie from '../src/styles/beastie/portrait/index.js';
import { HOLIDAY_PALETTES as botlingHolidays } from '../src/styles/botling/index.js';
import * as botling from '../src/styles/botling/portrait/index.js';
import { HOLIDAY_PALETTES as nogginHolidays } from '../src/styles/noggin/index.js';
import * as noggin from '../src/styles/noggin/portrait/index.js';
import { traits as nogginTraits } from '../src/styles/noggin/traits.js';
import { HOLIDAY_PALETTES as snootHolidays } from '../src/styles/snoot/index.js';
import * as snoot from '../src/styles/snoot/portrait/index.js';
import { HOLIDAY_PALETTES as spriteHolidays } from '../src/styles/sprite/index.js';
import * as sprite from '../src/styles/sprite/portrait/index.js';
import { traits as spriteTraits } from '../src/styles/sprite/traits.js';

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

  it('keeps two portraits on one page from restyling each other', () => {
    // Every class a page could share must mean the same rule in both portraits.
    const rules = (svg: string): Map<string, string> =>
      new Map(
        [...svg.matchAll(/@keyframes ([\w-]+)\{((?:[^{}]|\{[^{}]*\})*)\}/g)].map((m) => [
          m[1] as string,
          m[2] as string,
        ]),
      );
    const seeds = Array.from({ length: 8 }, (_, i) => `page-${i}`);
    const seen = new Map<string, string>();
    for (const x of seeds)
      for (const [name, body] of rules(style.portrait(x, { animate: true }))) {
        if (seen.has(name)) expect(body, name).toBe(seen.get(name));
        seen.set(name, body);
      }
    expect(seen.size).toBeGreaterThan(0);
  });

  it('gives the two figures of a duet classes of their own', () => {
    const [x, y] = ['a', 'b', 'c', 'd', 'e', 'f'].filter((z) =>
      style.portrait(z, { animate: true }).includes('<g class'),
    );
    const svg = style.duet(x as string, y as string, { animate: true });
    const classes = [...svg.matchAll(/class="([^"]+)"/g)].map((m) => m[1] as string);
    expect(classes.some((c) => c.startsWith('pa-'))).toBe(true);
    expect(classes.some((c) => c.startsWith('pb-'))).toBe(true);
    expect(classes.every((c) => c.startsWith('pa-') || c.startsWith('pb-'))).toBe(true);
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
    expect(() => style.portrait('a', { palette: 99 })).toThrow(RangeError);
    expect(() => style.portrait('a', { palette: {} as unknown as number })).toThrow(RangeError);
  });

  it("wears one of the avatar's palettes when asked, as the avatar does", () => {
    const own = style.portrait('a');
    const others = [0, 1].map((palette) => style.portrait('a', { palette }));
    expect(others.some((svg) => svg !== own)).toBe(true);
  });
});

describe("portraits take the avatar's own character options", () => {
  it("draws a Sprite of the element asked for, and the seed's own by default", () => {
    const own = spriteTraits('a').element;
    expect(sprite.portrait('a', { element: own })).toBe(sprite.portrait('a'));
    expect(sprite.portrait('a', { element: own === 'fire' ? 'water' : 'fire' })).not.toBe(sprite.portrait('a'));
    expect(() => sprite.portrait('a', { element: 'ice' as 'fire' })).toThrow(RangeError);
  });

  it('draws a Noggin with the skin asked for', () => {
    const own = nogginTraits('a').skin;
    expect(noggin.portrait('a', { skin: own })).toBe(noggin.portrait('a'));
    expect(noggin.portrait('a', { skin: (own + 2) % 6 })).not.toBe(noggin.portrait('a'));
  });
});

// Portraits are a Preview: the picture may change in a minor. This digest only
// makes a change deliberate: update it when you mean to redraw them. Drawing 60
// animated portraits takes a few seconds on a slow CI runner, hence the timeout.
describe('portrait corpus', () => {
  it('draws what it drew', () => {
    const seeds = Array.from({ length: 12 }, (_, i) => `corpus-${i}`);
    expect(
      Object.fromEntries(
        Object.entries(STYLES).map(([name, s]) => [name, digest(seeds.map((x) => s.portrait(x, { animate: true })))]),
      ),
    ).toMatchSnapshot();
  }, 30_000);
});
