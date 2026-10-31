// npm run site: builds seedkin.dev into dist-site/ (Vercel runs this). Every index.html
// under site/ is a page, filled in from site/partials/. The package build (dist/) is copied
// to /lib, so the playground always runs exactly what npm ships; the preview styles from
// lab/ are bundled to /preview.js, since they aren't in the package yet. Docs pages also get
// their sidebar, contents and previous/next links from scripts/docs.mjs, and style pages
// their playground and "Use it" section from scripts/styles.mjs.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { buildSync } from 'esbuild';
import { highlightPage } from '../site/highlight.js';
import { changelog } from './changelog.mjs';
import { crumb, DOCS, docsNav, docsSlug, pager, toc } from './docs.mjs';
import { ogImage, styleOgImage } from './og.mjs';
import { searchEntries } from './search.mjs';
import { jsonLd, llms, pageInfo, robots, sitemap } from './seo.mjs';
import { playground, STYLES, styleGuide, styleOf, styleTabs } from './styles.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(ROOT, 'dist-site');
const dist = path.join(ROOT, 'dist');
if (!fs.existsSync(path.join(dist, 'index.js'))) throw new Error('Run npm run build first: dist/index.js is missing');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });

const lib = await import(path.join(dist, 'styles/botling/index.js'));
const { botling, PALETTES } = lib;
// The mark and favicon are a botling: this seed, square cells, Ice palette.
const LOGO_SEED = 'jolly-sprocket-65';
const LOGO = { shape: 'square', palette: PALETTES.findIndex((p) => p.name === 'Ice'), title: null };
const logo = botling(LOGO_SEED, { ...LOGO, size: 32 });
const icon = botling(LOGO_SEED, { ...LOGO, size: 64, detail: 'small' });

// Preload every module of the package, so the browser fetches them together rather than
// finding each import only after the one before it has loaded.
const preloads = fs
  .readdirSync(dist, { recursive: true })
  .filter((f) => f.endsWith('.js'))
  .sort()
  .map((f) => `<link rel="modulepreload" href="/lib/${f.split(path.sep).join('/')}" />`)
  .join('\n  ');
// Figures the pages quote, measured here so they can't drift: the package version, and what
// one style costs an app (its entry point bundled, minified and gzipped).
const { version } = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const kb = (entry) => {
  const { outputFiles } = buildSync({ entryPoints: [entry], bundle: true, minify: true, format: 'esm', write: false });
  return (gzipSync(outputFiles[0].contents).length / 1024).toFixed(1);
};
const styleKb = Object.fromEntries(STYLES.map(({ name }) => [name, kb(path.join(dist, `styles/${name}/index.js`))]));
const figures = { version, 'botling-kb': styleKb.botling };
const styleLibs = Object.fromEntries(
  await Promise.all(STYLES.map(async ({ name }) => [name, await import(path.join(dist, `styles/${name}/index.js`))])),
);

const partials = Object.fromEntries(
  ['head', 'header', 'footer', 'playground'].map((name) => [
    name,
    fs.readFileSync(path.join(ROOT, `site/partials/${name}.html`), 'utf8').trim(),
  ]),
);
const site = path.join(ROOT, 'site');
const pages = fs
  .readdirSync(site, { recursive: true })
  .filter((f) => path.basename(f) === 'index.html' || f === '404.html')
  .sort();
const info = new Map(); // each page's canonical URL, title and description
const search = []; // /search.json, for the site search
for (const file of pages) {
  let page = fs
    .readFileSync(path.join(site, file), 'utf8')
    .replace(/{{(head|header|footer)}}/g, (_, name) => partials[name])
    .replaceAll('{{logo}}', logo)
    .replaceAll('{{preloads}}', preloads)
    .replace(/{{(version|botling-kb)}}/g, (_, name) => figures[name]);
  if (file.split(path.sep).join('/') === 'changelog/index.html') {
    page = page.replace(
      '{{changelog}}',
      () => changelog(fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8')).html,
    );
  }
  if (file === 'index.html') {
    page = page.replace('{{jsonld}}', () => jsonLd({ version, description: pageInfo(page).description ?? '' }));
  }
  const style = styleOf(file);
  if (style) {
    const title = STYLES.find((s) => s.name === style)?.title;
    page = page
      .replace('https://seedkin.dev/og.png', `https://seedkin.dev/og-${style}.png`)
      .replace(/(og:image:alt" content=")[^"]*/, `$1Five ${title} avatars in different colours above the word seedkin`)
      .replace('{{style-tabs}}', () => styleTabs(style))
      .replace('{{playground}}', () => playground(partials.playground, style))
      .replace('{{style-guide}}', () => styleGuide(style, styleLibs[style], styleKb[style]));
  }
  const slug = docsSlug(file);
  if (slug !== undefined) {
    page = page
      .replace('{{docsnav}}', () => docsNav(slug))
      .replace('{{pager}}', () => pager(slug))
      .replace('{{toc}}', () => toc(page))
      .replace(/<h1[\s>]/, (h1) => crumb(slug) + h1);
  }
  if (page.includes('{{')) throw new Error(`site/${file} has a placeholder the build doesn't fill`);
  // After the placeholder check: highlighting decodes the {&#123; that keeps samples from looking like one.
  page = highlightPage(page);
  fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true });
  fs.writeFileSync(path.join(out, file), page);
  const about = pageInfo(page);
  info.set(file.split(path.sep).join('/'), about);
  if (about.url && !about.noindex && about.title) {
    const [from, to] = [page.indexOf('<main'), page.indexOf('</main>')];
    if (from === -1 || to < from) throw new Error(`site/${file} needs one <main> for the search index`);
    const main = page.slice(from, to);
    search.push(
      ...searchEntries({
        path: new URL(about.url).pathname,
        title: about.title.replace(/ · Seedkin( docs)?$/, ''),
        description: about.description ?? '',
        html: main,
      }),
    );
  }
}
fs.writeFileSync(path.join(out, 'search.json'), JSON.stringify(search));
for (const { name } of STYLES) fs.writeFileSync(path.join(out, `og-${name}.png`), styleOgImage(styleLibs[name]));

// For search engines and AI assistants: every page that asks to be indexed, and the docs.
const indexed = [...info.values()].filter((p) => p.url && !p.noindex);
fs.writeFileSync(path.join(out, 'sitemap.xml'), sitemap(indexed.map((p) => p.url)));
fs.writeFileSync(path.join(out, 'robots.txt'), robots());
const listed = (files, titles = []) =>
  files.map((f, i) => {
    const p = info.get(f);
    if (!p?.url || !p.title || !p.description)
      throw new Error(`site/${f} needs a canonical URL, title and description`);
    return { url: p.url, title: titles[i] ?? p.title.replace(/ · Seedkin( docs)?$/, ''), description: p.description };
  });
const sections = [
  ...DOCS.map(({ group, pages: docs }) => ({
    name: group,
    pages: listed(
      docs.map(([slug]) => (slug ? `docs/${slug}/index.html` : 'docs/index.html')),
      docs.map(([, title]) => title),
    ),
  })),
  {
    name: 'Optional',
    pages: listed([...STYLES.map((s) => `styles/${s.name}/index.html`), 'about/index.html', 'changelog/index.html']),
  },
];
fs.writeFileSync(path.join(out, 'llms.txt'), llms({ version, sections }));
fs.writeFileSync(path.join(out, 'icon.svg'), icon);
fs.writeFileSync(path.join(out, 'og.png'), ogImage(lib));
for (const f of fs.readdirSync(site).filter((f) => /\.(js|css)$/.test(f))) {
  fs.copyFileSync(path.join(site, f), path.join(out, f));
}
buildSync({
  entryPoints: [path.join(ROOT, 'lab/preview.ts')],
  outfile: path.join(out, 'preview.js'),
  bundle: true,
  format: 'esm',
  minify: true,
  target: 'es2020',
  legalComments: 'none',
});
fs.cpSync(dist, path.join(out, 'lib'), { recursive: true, filter: (f) => !f.endsWith('.d.ts') && !f.endsWith('.map') });

// Fonts, self-hosted: the CSP allows font-src 'self' only.
const req = createRequire(import.meta.url);
const font = (pkg, file, as) =>
  fs.copyFileSync(
    path.join(path.dirname(req.resolve(`${pkg}/package.json`)), 'files', file),
    path.join(out, 'fonts', as),
  );
font('@fontsource/silkscreen', 'silkscreen-latin-400-normal.woff2', 'silkscreen.woff2');

console.log(`built ${path.relative(ROOT, out)}/`);
