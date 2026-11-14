import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { highlight, highlightPage } from '../site/highlight.js';

const text = (html: string): string =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&(lt|gt|quot|amp);/g, (_, e: string) => ({ lt: '<', gt: '>', quot: '"', amp: '&' })[e] ?? '');
const spans = (html: string, cls: string): string[] =>
  [...html.matchAll(new RegExp(`<span class="tok-${cls}">([^<]*)</span>`, 'g'))].map((m) => text(m[1] ?? ''));

describe('highlight', () => {
  it('keeps the code: only spans are added, and everything is escaped', () => {
    const code = `const a = "<b>" + '&' + \`x\`; // <i>`;
    for (const lang of ['ts', 'tsx', 'html', 'sh', 'text']) {
      const html = highlight(code, lang);
      expect(text(html)).toBe(code);
      expect(html).not.toMatch(/<(?!\/?span)/);
    }
  });

  it('marks keywords, strings, comments, numbers and calls', () => {
    const html = highlight(`import { a } from 'x';\nconst n = f(40); // done`, 'ts');
    expect(spans(html, 'k')).toEqual(['import', 'from', 'const']);
    expect(spans(html, 's')).toEqual(["'x'"]);
    expect(spans(html, 'c')).toEqual(['// done']);
    expect(spans(html, 'n')).toEqual(['40']);
    expect(spans(html, 'f')).toEqual(['f']);
  });

  it('tells JSX tags from generics and comparisons', () => {
    const html = highlight(
      `const p: Promise<{ id: string }> = f(1 < 2);\nreturn <img src={a > b ? x : y} alt="" />;`,
      'tsx',
    );
    expect(spans(html, 't')).toEqual(['img']);
    expect(spans(html, 'a')).toEqual(['src', 'alt']);
  });

  it('reads HTML with its script as code', () => {
    const html = highlight(
      `<img data-seed="ada">\n<script type="module">\n  import { a } from 'x';\n</script>`,
      'html',
    );
    expect(spans(html, 't')).toEqual(['img', 'script', 'script']);
    expect(spans(html, 'a')).toEqual(['data-seed', 'type']);
    expect(spans(html, 'k')).toEqual(['import', 'from']);
  });

  it('marks the command and flags in shell', () => {
    const html = highlight('npm install seedkin --save-dev', 'sh');
    expect(spans(html, 'f')).toEqual(['npm']);
    expect(spans(html, 'a')).toEqual(['--save-dev']);
  });
});

describe('highlightPage', () => {
  it('highlights code with a language and leaves the rest', () => {
    const page = '<pre><code class="language-ts">const a = &#123;};</code></pre><pre><code>const b;</code></pre>';
    expect(highlightPage(page)).toBe(
      '<pre><code class="language-ts"><span class="tok-k">const</span> a = {};</code></pre><pre><code>const b;</code></pre>',
    );
  });

  it('gives every sample on the site a language', () => {
    const files = fs.readdirSync('site', { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.html'));
    for (const file of [...files.map((f) => path.join('site', f)), 'scripts/styles.mjs']) {
      for (const [tag] of fs.readFileSync(file, 'utf8').matchAll(/<pre\b[^>]*>\s*<code\b[^>]*>/g)) {
        if (/id="(portrait-)?code"/.test(tag)) continue; // the playground's, highlighted as it's written
        expect(tag, file).toMatch(/class="language-/);
      }
    }
  });
});
