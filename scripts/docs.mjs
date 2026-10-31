// The docs' table of contents and the navigation built from it: the sidebar, the "On this
// page" list, previous and next links, and the edit link. Pure functions, so site.mjs fills
// each docs page with them and test/docs.test.ts checks them without a build.

/** Every docs page in reading order, by group: [slug, title]. The slug '' is /docs/. */
export const DOCS = [
  {
    group: 'Getting started',
    pages: [
      ['', 'Introduction'],
      ['react', 'React'],
      ['vue', 'Vue'],
      ['svelte', 'Svelte'],
      ['html', 'Plain HTML'],
      ['server', 'On the server'],
      ['fallback', 'Profile photo fallback'],
    ],
  },
  {
    group: 'Styles',
    pages: [
      ['botling', 'Botling'],
      ['snoot', 'Snoot'],
      ['noggin', 'Noggin'],
      ['beastie', 'Beastie'],
      ['sprite', 'Sprite'],
    ],
  },
  {
    group: 'Reference',
    pages: [
      ['how-it-works', 'How it works'],
      ['versioning', 'Versioning'],
    ],
  },
];

const PAGES = DOCS.flatMap((g) => g.pages);
const href = (slug) => (slug ? `/docs/${slug}/` : '/docs/');
const REPO = 'https://github.com/mtblck/seedkin';

/**
 * The docs page a site file is, from its path under site/.
 *
 * @param {string} file - Such as 'docs/index.html' or 'docs/react/index.html'
 * @returns {string | undefined} Its slug, or undefined if it isn't a docs page
 */
export function docsSlug(file) {
  const m = /^docs\/(?:([a-z-]+)\/)?index\.html$/.exec(file.split('\\').join('/'));
  if (!m) return undefined;
  const slug = m[1] ?? '';
  if (!PAGES.some(([s]) => s === slug)) throw new Error(`site/${file} isn't listed in scripts/docs.mjs`);
  return slug;
}

/**
 * The sidebar: every group and page, the current one marked.
 *
 * @param {string} slug - The current page
 * @returns {string} HTML
 */
export function docsNav(slug) {
  const groups = DOCS.map(({ group, pages }) => {
    const links = pages
      .map(([s, title]) => {
        const current = s === slug ? ' aria-current="page"' : '';
        return `<li><a href="${href(s)}"${current}>${title}</a></li>`;
      })
      .join('');
    return `<p class="docs-nav-h">${group}</p><ul>${links}</ul>`;
  }).join('');
  const title = PAGES.find(([s]) => s === slug)?.[1];
  return `<nav class="docs-nav" aria-label="Docs pages"><button type="button" class="docs-nav-btn" aria-expanded="false" aria-controls="docs-nav-list">Docs: ${title}</button><div id="docs-nav-list" class="docs-nav-list">${groups}</div></nav>`;
}

/**
 * The "On this page" list, from the page's h2 and h3 headings that have ids.
 *
 * @param {string} html - The page
 * @returns {string} HTML, or '' for a page with fewer than two headings
 */
export function toc(html) {
  const heads = [...html.matchAll(/<h([23]) id="([^"]+)">(.*?)<\/h\1>/g)].map(([, level, id, inner]) => ({
    level,
    id,
    text: inner
      .replace(/<span class="badge">.*?<\/span>/g, '')
      .replace(/<[^>]+>/g, '')
      .trim(),
  }));
  if (heads.length < 2) return '';
  const items = heads
    .map(({ level, id, text }) => `<li${level === '3' ? ' class="sub"' : ''}><a href="#${id}">${text}</a></li>`)
    .join('');
  return `<nav class="toc" aria-label="On this page"><p class="toc-h">On this page</p><ul>${items}</ul></nav>`;
}

/**
 * The foot of a page: the previous and next pages, and a link to edit this one.
 *
 * @param {string} slug - The current page
 * @returns {string} HTML
 */
export function pager(slug) {
  const i = PAGES.findIndex(([s]) => s === slug);
  const link = (page, rel, label) =>
    page ? `<a class="${rel}" href="${href(page[0])}" rel="${rel}"><span>${label}</span>${page[1]}</a>` : '';
  const file = slug ? `site/docs/${slug}/index.html` : 'site/docs/index.html';
  return `<footer class="docs-foot"><nav class="pager" aria-label="Previous and next">${link(PAGES[i - 1], 'prev', 'Previous')}${link(PAGES[i + 1], 'next', 'Next')}</nav><p class="edit"><a href="${REPO}/edit/main/${file}">Edit this page on GitHub</a></p></footer>`;
}

/**
 * The breadcrumb over a page's heading: Docs, then its group.
 *
 * @param {string} slug - The current page
 * @returns {string} HTML
 */
export function crumb(slug) {
  const { group } = DOCS.find((g) => g.pages.some(([s]) => s === slug));
  return `<p class="kicker"><a href="/docs/">Docs</a> / ${group}</p>`;
}
