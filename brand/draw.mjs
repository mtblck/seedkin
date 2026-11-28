// Seedkin's logo, drawn from the package itself: the mark is the site's own favicon robot
// (Botling seed jolly-sprocket-65, square cells, Ice palette, the 9x9 small drawing) on its
// dark tile, and the wordmark is "seedkin" in Silkscreen, the site's display face.
//
//   npm run build
//   node brand/draw.mjs                        (writes the SVGs and brand.json next to this file)
//   node brand/portfolio/draw.mjs              (the two portfolio covers)
//   node $BRAND_KIT/scripts/export.mjs brand/brand.json
//
// BRAND_KIT is the brand-kit plugin's logo skill folder (mtblck/claude-marketplace, brand-kit 1.8.0).

import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = (f) => join(here, f);
const KIT = process.env.BRAND_KIT ?? join(homedir(), '.claude/plugins/cache/mtblck/brand-kit/1.8.0/skills/logo');
const { loadFont, lockup, svg, write } = await import(pathToFileURL(join(KIT, 'scripts/brand.mjs')).href);
const { botling, PALETTES } = await import(pathToFileURL(join(here, '../dist/styles/botling/index.js')).href);

// The site's colours (site/site.css): paper and ink, indigo for actions, seafoam for glow.
const C = {
  indigo: '#3a26c9',
  seafoam: '#7ee8d0',
  paper: '#f6f3ec',
  night: '#14121c',
  ink: '#1d1a16',
  mist: '#ece9f6',
  lilac: '#a99cff',
  tile: '#0f1824',
};

// ── The mark, 256 × 256: the 9x9 robot (10 units with its margin) at 25.6 px a unit ──
const LOGO = { shape: 'square', palette: PALETTES.findIndex((p) => p.name === 'Ice'), title: null, detail: 'small' };
const robot = botling('jolly-sprocket-65', { ...LOGO, background: false, size: 256 });
const paths = [...robot.matchAll(/<path fill="(#[0-9a-f]+)" d="([^"]+)"\/>/g)].map(([, fill, d]) => ({ fill, d }));
const M = 256;
const U = M / 10;
const cells = (only) =>
  `<g transform="scale(${U}) translate(.5 .5)">${paths
    .filter(only)
    .map((p) => `<path fill="${p.fill}" d="${p.d}"/>`)
    .join('')}</g>`;
const tile = `<rect width="${M}" height="${M}" rx="56" fill="${C.tile}"/>`;
const markBody = tile + cells(() => true);
// One colour: every lit cell in black with no tile, so the dark screen becomes the hole the
// eyes and mouth sit in. The export recolours it to white for dark grounds.
const SCREEN = '#081019';
// One path, so the cells' shared edges leave no hairline seams.
const lit = paths
  .filter((p) => p.fill !== SCREEN)
  .map((p) => p.d.replace(/^m/, 'M'))
  .join('');
const blackBody = `<g transform="scale(${U}) translate(.5 .5)"><path fill="#000" d="${lit}"/></g>`;
const mark = { body: markBody, w: M, h: M };
const markBlack = { body: blackBody, w: M, h: M };

write(out('mark.svg'), svg({ w: M, h: M, title: 'Seedkin', body: markBody }));
write(out('mark-black.svg'), svg({ w: M, h: M, title: 'Seedkin', body: blackBody }));
// App-icon art: the robot alone, for the export to place on its own tile with room round it.
write(out('robot.svg'), svg({ w: M, h: M, title: 'Seedkin', body: cells(() => true) }));

// ── Wordmark lockups: lower case, as the site header sets it ──
const font = await loadFont('Silkscreen', 400);
for (const [layout, file] of [
  ['horizontal', 'logo-horizontal'],
  ['stacked', 'logo-stacked'],
]) {
  for (const [suffix, word] of [
    ['', C.night],
    ['-dark', C.mist],
  ]) {
    const l = lockup({
      mark,
      font,
      name: 'seedkin',
      layout,
      color: word,
      capRatio: layout === 'horizontal' ? 0.42 : 0.26,
    });
    write(out(`${file}${suffix}.svg`), svg({ w: l.w, h: l.h, title: 'Seedkin', body: l.body }));
  }
  const capRatio = layout === 'horizontal' ? 0.42 : 0.26;
  const b = lockup({ mark: markBlack, font, name: 'seedkin', layout, color: '#000', capRatio });
  write(out(`${file}-black.svg`), svg({ w: b.w, h: b.h, title: 'Seedkin', body: b.body }));
}

const brand = {
  name: 'Seedkin',
  tagline: 'One seed. A whole family.',
  about:
    'Seedkin turns any string into a pixel avatar, the same one every time, on any machine, with nothing stored: a robot, an animal, a person, a monster or a sprite. It is a zero-dependency TypeScript package that returns an SVG string.\n\nThe mark is the first Seedkin ever drawn: Botling jolly-sprocket-65, the robot from the site header, in its 9x9 small drawing so it keeps a face at 16 px.',
  construction:
    'A 10 × 10 unit tile with corner radius 2.2 units; the robot is the package’s own 9x9 small Botling drawing, one unit a cell, drawn by the library and never by hand.',
  website: 'seedkin.dev',
  colors: [
    {
      name: 'Indigo',
      hex: C.indigo,
      role: 'primary',
      usage: 'Buttons, links and the brand field: anything you can press.',
    },
    {
      name: 'Seafoam',
      hex: C.seafoam,
      role: 'accent',
      usage: 'What glows: the frame round a featured avatar, one highlight per layout.',
    },
    { name: 'Paper', hex: C.paper, role: 'paper', usage: 'The light page, under a faint dot grid.' },
    {
      name: 'Night',
      hex: C.night,
      role: 'dark',
      usage: 'The dark page, the wordmark on paper, and the cover’s ground.',
    },
    { name: 'Lilac', hex: C.lilac, role: 'support', usage: 'Indigo’s stand-in on the dark page.' },
  ],
  type: {
    display: { family: 'Silkscreen', weight: 400 },
    text: { family: 'Inter', weight: 400 },
  },
  logos: {
    mark: { file: 'mark.svg', dark: 'mark.svg', black: 'mark-black.svg', minWidth: 16 },
    horizontal: {
      file: 'logo-horizontal.svg',
      dark: 'logo-horizontal-dark.svg',
      black: 'logo-horizontal-black.svg',
      minWidth: 96,
    },
    stacked: { file: 'logo-stacked.svg', dark: 'logo-stacked-dark.svg', black: 'logo-stacked-black.svg', minWidth: 64 },
  },
  icon: {
    file: 'robot.svg',
    background: C.tile,
    scale: 0.78,
    maskableScale: 0.6,
    favicon: 'mark.svg',
    themeColor: C.night,
  },
  social: { background: C.paper },
  templates: { background: C.night },
  direction: {
    words: ['playful', 'pixel', 'friendly'],
    pairs: { tone: 'playful', era: 'retro', volume: 'between', finish: 'flat' },
    lives: 'web',
    weirdness: 3,
  },
  legal: { owner: 'Matt Black', codeLicense: 'MIT' },
  exports: 'all',
  portfolio: {
    cover: 'portfolio/cover.svg',
    mobile: 'portfolio/cover-mobile.svg',
    alt: 'A wall of pixel avatars from all five styles, robots, animals, people, monsters and elemental sprites, dimmed on a dark dot grid, with one flame sprite lit up large in a seafoam frame in the middle.',
    background: C.night,
  },
  out: 'dist',
};
write(out('brand.json'), `${JSON.stringify(brand, null, 2)}\n`);
