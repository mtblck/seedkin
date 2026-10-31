// What search engines and AI assistants read, built from the pages themselves by site.mjs:
// sitemap.xml, robots.txt, llms.txt and the home page's JSON-LD. Pure functions, tested in
// test/seo.test.ts.

const ORIGIN = 'https://seedkin.dev';

const attr = (html, re) => re.exec(html)?.[1];
const decodeEntities = (s) =>
  s.replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[e]);

/**
 * A page's canonical URL, title and description, from its head.
 *
 * @param {string} html - The page source
 * @returns {{ url: string | undefined, title: string | undefined, description: string | undefined, noindex: boolean }}
 *   What it says about itself
 */
export function pageInfo(html) {
  const title = attr(html, /<title>([^<]*)<\/title>/);
  const description = attr(html, /<meta name="description" content="([^"]*)"/);
  return {
    url: attr(html, /<link rel="canonical" href="([^"]+)"/),
    title: title && decodeEntities(title),
    description: description && decodeEntities(description),
    noindex: /<meta name="robots" content="[^"]*noindex/.test(html),
  };
}

/**
 * sitemap.xml for every indexable page.
 *
 * @param {string[]} urls - Canonical URLs
 * @returns {string} XML
 */
export function sitemap(urls) {
  const entries = [...urls]
    .sort()
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

/**
 * robots.txt: everything may be crawled, and here is the sitemap.
 *
 * @returns {string} Text
 */
export function robots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`;
}

/**
 * llms.txt (llmstxt.org): what Seedkin is, how to use it, and every page worth reading.
 *
 * @param {{ version: string, sections: { name: string, pages: { url: string, title: string, description: string }[] }[] }} site
 *   The package version and the pages, grouped
 * @returns {string} Markdown
 */
export function llms({ version, sections }) {
  const groups = sections
    .map(
      ({ name, pages }) => `## ${name}\n\n${pages.map((p) => `- [${p.title}](${p.url}): ${p.description}`).join('\n')}`,
    )
    .join('\n\n');
  return `# Seedkin

> Seedkin turns any string, such as a user id, into a small pixel avatar as an SVG string: robots (Botling), animals (Snoot), people (Noggin), monsters (Beastie) and elemental spirits (Sprite). The same seed always draws the same avatar within a major version. Zero runtime dependencies, no network requests, ESM with TypeScript types, MIT licensed with the art included. Current version: ${version}.

Install with \`npm install seedkin\`. Each style has its own entry point, and each exports a function that returns an SVG string and one that returns a data: URI:

\`\`\`ts
import { botling, botlingDataUri } from 'seedkin/botling';

const svg = botling(user.id);                         // inline SVG string
const src = botlingDataUri(user.id, { size: 40 });    // for <img src>
\`\`\`

The other styles follow the same pattern: \`snoot\`/\`snootDataUri\` from \`seedkin/snoot\`, \`noggin\`/\`nogginDataUri\` from \`seedkin/noggin\`, \`beastie\`/\`beastieDataUri\` from \`seedkin/beastie\`, \`sprite\`/\`spriteDataUri\` from \`seedkin/sprite\`. Common options: \`size\`, \`shape\`, \`palette\`, \`look\`, \`frame\`, \`detail\`, \`showGrid\`, \`background\`, \`title\`, \`animate\`. Below 40px each style draws a simpler 9x9 version so small avatars keep a face. Seed with an opaque, stable id rather than an email address. Botling, Snoot, Noggin and Beastie are stable: a seed draws the same picture in every release of a major version. Sprite is a Preview style, so its pictures can still change in a minor version.

${groups}
`;
}

/**
 * The home page's structured data, as a JSON-LD block. It's data, not script, so the CSP
 * doesn't run it and hosting:check allows it.
 *
 * @param {{ version: string, description: string }} pkg - The package version and description
 * @returns {string} A script element of type application/ld+json
 */
export function jsonLd({ version, description }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'Seedkin',
    description,
    url: `${ORIGIN}/`,
    codeRepository: 'https://github.com/mtblck/seedkin',
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'JavaScript',
    license: 'https://opensource.org/license/mit',
    version,
    author: { '@type': 'Person', name: 'Matt Black', url: 'https://mattblack.space' },
  };
  // "<" is escaped so no string in the data can close the element early.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}
