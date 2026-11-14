import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { Holiday } from '../src/core/types.js';
import * as beastie from '../src/styles/beastie/index.js';
import * as botling from '../src/styles/botling/index.js';
import * as noggin from '../src/styles/noggin/index.js';
import * as snoot from '../src/styles/snoot/index.js';
import * as sprite from '../src/styles/sprite/index.js';

const STYLES = { beastie, botling, noggin, snoot, sprite };
const HOLIDAYS: Holiday[] = ['newYear', 'valentines', 'stPatricks', 'fourthOfJuly', 'halloween', 'christmas'];
const digest = (parts: Iterable<string>): string => {
  const h = createHash('sha256');
  for (const part of parts) h.update(part).update('\n');
  return h.digest('hex').slice(0, 16);
};
const fills = (svg: string): Set<string> => new Set([...svg.matchAll(/fill="([^"]+)"/g)].map((m) => m[1] as string));

describe.each(Object.entries(STYLES))('%s portraits', (name, style) => {
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

  it('is named for screen readers, or hidden when decorative', () => {
    expect(style.portrait('a')).toMatch(/role="img" aria-label="[A-Z][a-z]+ portrait"/);
    expect(style.duet('a', 'b')).toMatch(/aria-label="[A-Z][a-z]+ portraits"/);
    expect(style.portrait('a', { title: 'Ada & "Bo"' })).toContain('aria-label="Ada &#38; &#34;Bo&#34;"');
    expect(style.portrait('a', { title: null })).toContain('aria-hidden="true"');
  });

  it('moves only when asked, and holds still for reduced motion', () => {
    expect(style.portrait('a')).not.toContain('@keyframes');
    const moving = style.portrait('a', { animate: true });
    expect(moving).toContain('@media (prefers-reduced-motion:no-preference){');
    expect(moving).toMatch(/<g class="[^"]+">/);
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
    const palette = Object.values(style.HOLIDAY_PALETTES[holiday]).filter((v) => v.startsWith('#'));
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
