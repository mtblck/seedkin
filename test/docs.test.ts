import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { crumb, DOCS, docsNav, docsSlug, pager, toc } from '../scripts/docs.mjs';
import { STYLES } from '../scripts/styles.mjs';

const slugs = DOCS.flatMap((g) => g.pages.map(([slug]) => slug));
const file = (slug: string): string => path.join('site/docs', slug, 'index.html');

describe('docs pages', () => {
  it("badges each style's page with its status", () => {
    for (const s of STYLES) {
      const badge =
        s.status === 'stable' ? '<span class="badge stable">Stable</span>' : '<span class="badge">Preview</span>';
      expect(fs.readFileSync(file(s.name), 'utf8'), s.name).toContain(`<h1>${s.title} ${badge}</h1>`);
    }
  });

  it('has a page for every entry in the table of contents, and no page without one', () => {
    for (const slug of slugs) expect(fs.existsSync(file(slug)), file(slug)).toBe(true);
    const pages = fs
      .readdirSync('site/docs', { recursive: true })
      .map(String)
      .filter((f) => path.basename(f) === 'index.html');
    expect(pages).toHaveLength(slugs.length);
    for (const page of pages) expect(() => docsSlug(`docs/${page}`)).not.toThrow();
  });

  it('knows a docs page from its path', () => {
    expect(docsSlug('docs/index.html')).toBe('');
    expect(docsSlug('docs/react/index.html')).toBe('react');
    expect(docsSlug('styles/botling/index.html')).toBeUndefined();
    expect(() => docsSlug('docs/nope/index.html')).toThrow(/isn't listed/);
  });

  it('marks the current page in the sidebar', () => {
    const nav = docsNav('vue');
    expect(nav).toContain('<a href="/docs/vue/" aria-current="page">Vue</a>');
    expect(nav.match(/aria-current/g)).toHaveLength(1);
    expect(nav).toContain('Docs: Vue');
  });

  it('puts each page under its group in the breadcrumb', () => {
    expect(crumb('')).toBe('<p class="kicker"><a href="/docs/">Docs</a> / Getting started</p>');
    expect(crumb('noggin')).toContain('/ Styles</p>');
    expect(crumb('versioning')).toContain('/ Reference</p>');
  });

  it("lists a page's headings, without badges or markup", () => {
    const html =
      '<h2 id="a">One <code>x</code></h2><h3 id="b">Two <span class="badge">Preview</span></h3><h2>No id</h2>';
    expect(toc(html)).toContain('<li><a href="#a">One x</a></li><li class="sub"><a href="#b">Two</a></li>');
    expect(toc('<h2 id="a">Only one</h2>')).toBe('');
  });

  it('links the previous and next pages, and nothing past either end', () => {
    expect(pager('')).not.toContain('rel="prev"');
    expect(pager('')).toContain('href="/docs/react/" rel="next"');
    expect(pager('versioning')).not.toContain('rel="next"');
    expect(pager('versioning')).toContain('/edit/main/site/docs/versioning/index.html');
  });

  it('keeps the anchors old links point at', () => {
    const anchors: Record<string, string[]> = {
      '': ['install', 'use'],
      botling: ['random-robots', 'options', 'frames', 'animation', 'holiday-palettes', 'building-a-picker', 'advanced'],
    };
    for (const [slug, ids] of Object.entries(anchors)) {
      const html = fs.readFileSync(file(slug), 'utf8');
      for (const id of ids) expect(html, `${slug}#${id}`).toContain(`id="${id}"`);
    }
  });

  it('only links to docs pages and anchors that exist', () => {
    const ids = new Map(
      slugs.map((slug) => [slug, [...fs.readFileSync(file(slug), 'utf8').matchAll(/ id="([^"]+)"/g)].map((m) => m[1])]),
    );
    for (const slug of slugs) {
      const html = fs.readFileSync(file(slug), 'utf8');
      for (const [, target, hash] of html.matchAll(/href="\/docs\/(?:([a-z-]+)\/)?(?:#([^"]+))?"/g)) {
        const to = target ?? '';
        expect(ids.has(to), `${slug} links to /docs/${to}`).toBe(true);
        if (hash) expect(ids.get(to), `${slug} links to /docs/${to}#${hash}`).toContain(hash);
      }
    }
  });
});
