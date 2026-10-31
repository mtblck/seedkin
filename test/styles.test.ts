import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { playground, STYLES, styleGuide, styleOf, styleTabs } from '../scripts/styles.mjs';
import * as beastie from '../src/styles/beastie/index.js';
import * as botling from '../src/styles/botling/index.js';
import * as noggin from '../src/styles/noggin/index.js';
import * as snoot from '../src/styles/snoot/index.js';
import * as sprite from '../src/styles/sprite/index.js';

const LIBS: Record<string, Record<string, unknown>> = { botling, snoot, noggin, beastie, sprite };

describe('style pages', () => {
  it('has a page and a package entry point for every style, and no page without one', () => {
    const pages = fs.readdirSync('site/styles', { withFileTypes: true }).filter((d) => d.isDirectory());
    expect(pages.map((d) => d.name).sort()).toEqual(STYLES.map((s) => s.name).sort());
    const exports = JSON.parse(fs.readFileSync('package.json', 'utf8')).exports;
    for (const { name } of STYLES) expect(exports[`./${name}`], name).toBeDefined();
  });

  it('knows a style page from its path', () => {
    expect(styleOf('styles/snoot/index.html')).toBe('snoot');
    expect(styleOf('styles/index.html')).toBeUndefined();
    expect(() => styleOf('styles/nope/index.html')).toThrow(/no style/);
  });

  it('marks the current style in the tabs', () => {
    const tabs = styleTabs('noggin');
    expect(tabs).toContain('<a href="/styles/noggin/" data-to="noggin" aria-current="page">Noggin</a>');
    expect(tabs.match(/aria-current/g)).toHaveLength(1);
  });

  it("puts the style's words into the playground", () => {
    const html = playground('<p>{{label}}</p><p>{{small-note}}</p>', 'snoot');
    expect(html).toBe(
      '<p>Snoot</p><p>Below 40px it switches to a simpler version of the same Snoot, and animated, it only blinks and hovers.</p>',
    );
  });

  it('counts parts from what each style exports, leaving out none', () => {
    for (const s of STYLES) expect(() => styleGuide(s.name, LIBS[s.name] ?? {}, '1.0'), s.name).not.toThrow();
    expect(styleGuide('snoot', snoot, '1.0')).toContain(`${snoot.SPECIES.length} species`);
    expect(styleGuide('snoot', snoot, '1.0')).toContain(`${snoot.EXTRAS.filter((e) => e !== 'none').length} extras`);
  });

  it("lists the style's own options and default title", () => {
    expect(styleGuide('noggin', noggin, '1.0')).toContain('<code>skin</code>');
    expect(styleGuide('snoot', snoot, '1.0')).not.toContain('<code>skin</code>');
    expect(styleGuide('beastie', beastie, '1.0')).toContain("'Monster avatar'");
    expect(styleGuide('sprite', sprite, '1.0')).toContain('<code>element</code>');
    expect(styleGuide('sprite', sprite, '1.0')).toContain('<span class="badge stable">Stable</span>');
  });

  it('lists animate for every style, with what it does', () => {
    for (const s of STYLES) {
      const html = styleGuide(s.name, LIBS[s.name] ?? {}, '1.0');
      expect(html, s.name).toContain('<code>animate</code>');
      expect(html, s.name).toContain(s.moves);
    }
  });

  it('gives the default title each style really draws', () => {
    const draw: Record<string, (seed: string) => string> = {
      botling: botling.botling,
      snoot: snoot.snoot,
      noggin: noggin.noggin,
      beastie: beastie.beastie,
      sprite: sprite.sprite,
    };
    for (const s of STYLES) expect(draw[s.name]?.('ada'), s.name).toContain(`aria-label="${s.defaultTitle}"`);
  });

  it('links the next style, and no further than the last', () => {
    expect(styleGuide('botling', botling, '1.0')).not.toContain('rel="prev"');
    expect(styleGuide('botling', botling, '1.0')).toContain('href="/styles/snoot/" rel="next"');
    expect(styleGuide('beastie', beastie, '1.0')).toContain('href="/styles/sprite/" rel="next"');
    expect(styleGuide('sprite', sprite, '1.0')).not.toContain('rel="next"');
  });
});
