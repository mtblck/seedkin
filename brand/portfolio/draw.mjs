// The portfolio covers: the wall of avatars from the original 1600 × 1000 cover
// (wall-source.svg, from mb-portfolio), re-laid at 2400 × 800 and 1000 × 800 with the
// flame sprite in its seafoam frame in the middle, and without the logo and npm pills.
// The tiles from the original keep their places around the flame; the wider cover's
// extra columns are new avatars drawn by the package with fixed seeds.
//
//   npm run build && node brand/portfolio/draw.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const lib = (s) => import(pathToFileURL(join(here, `../../dist/styles/${s}/index.js`)).href);
const STYLES = ['botling', 'snoot', 'noggin', 'beastie', 'sprite'];
const draw = Object.fromEntries(await Promise.all(STYLES.map(async (s) => [s, (await lib(s))[s]])));

const src = readFileSync(join(here, 'wall-source.svg'), 'utf8');
const NIGHT = '#14121c';
const DOT = '#2a2738';
const SEAFOAM = '#7ee8d0';
// The original grid: 248 px tiles 28 px apart, columns from x -14 and rows from y -88;
// the flame fills columns 2-3 and rows 1-2 inside a 14 px seafoam frame.
const TILE = 248;
const GAP = 28;
const STEP = TILE + GAP;

/** The original's tiles by grid place, as their inner <svg> with x/y/size stripped. */
const tiles = new Map();
for (const m of src.matchAll(
  /<g clip-path="url\(#r\)" opacity="\.55"><svg x="(-?[\d.]+)" y="(-?[\d.]+)" width="248" height="248" (.*?<\/svg>)<\/g>/g,
)) {
  const col = Math.round((Number(m[1]) + 14) / STEP) - 2;
  const row = Math.round((Number(m[2]) + 88) / STEP) - 1;
  tiles.set(`${col},${row}`, m[3]);
}
const hero = src.match(/<g clip-path="url\(#r\)"><svg x="538" y="188" width="524" height="524" (.*?<\/svg>)<\/g>/)[1];
if (tiles.size !== 20) throw new Error(`expected 20 tiles in wall-source.svg, found ${tiles.size}`);

/** A tile for a grid place the original didn't have: a new avatar from a fixed seed. */
function fresh(col, row) {
  const style = STYLES[(((col * 3 + row * 2) % 5) + 5) % 5];
  // Most of the original wall sits on dark grounds, so new tiles skip pale backgrounds.
  let s;
  for (let n = 0; ; n++) {
    s = draw[style](`cover-${col}-${row}${n ? `-${n}` : ''}`, { size: TILE, title: null });
    if (luma(s.match(/<rect[^>]*fill="(#[0-9a-f]{6})"/)[1]) < 0.3) break;
  }
  return s
    .replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" /, '')
    .replace(/ width="248" height="248" aria-hidden="true"/, '');
}

/** Relative luminance of a hex colour, roughly. */
function luma(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Tiles that cross the outer edge are dimmer, so the corners the page rounds stay quiet. */
const EDGE = 80;

/**
 * One cover: the flame centred at (cx, cy) at scale s, the wall around it out to the edges.
 * @param {number} W @param {number} H @param {number} s @param {number} cy share of H
 */
function cover(W, H, s, cyShare, alt) {
  const t = TILE * s;
  const step = STEP * s;
  const big = (2 * TILE + GAP) * s;
  const x0 = W / 2 - big / 2; // column 0's left edge
  const y0 = H * cyShare - big / 2; // row 0's top edge
  const parts = [];
  for (let row = Math.floor(-y0 / step) - 1; y0 + row * step < H; row++) {
    for (let col = Math.floor(-x0 / step) - 1; x0 + col * step < W; col++) {
      const x = x0 + col * step;
      const y = y0 + row * step;
      if (x + t <= 0 || y + t <= 0) continue;
      if ((col === 0 || col === 1) && (row === 0 || row === 1)) continue;
      const inner = tiles.get(`${col},${row}`) ?? fresh(col, row);
      const edge = x < EDGE * (W / 2400) || x + t > W - EDGE * (W / 2400);
      parts.push(
        `<g clip-path="url(#r)" opacity="${edge ? '.3' : '.55'}"><svg x="${r(x)}" y="${r(y)}" width="${r(t)}" height="${r(t)}" ${inner}</g>`,
      );
    }
  }
  const f = 14 * s;
  parts.push(
    `<rect x="${r(x0 - f)}" y="${r(y0 - f)}" width="${r(big + 2 * f)}" height="${r(big + 2 * f)}" rx="${r(50 * s)}" fill="${SEAFOAM}"/>`,
    `<g clip-path="url(#r)"><svg x="${r(x0)}" y="${r(y0)}" width="${r(big)}" height="${r(big)}" ${hero}</g>`,
  );
  const d = 28 * s;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><title>${alt}</title><defs><clipPath id="r" clipPathUnits="objectBoundingBox"><rect width="1" height="1" rx=".09"/></clipPath><pattern id="dots" width="${r(d)}" height="${r(d)}" patternUnits="userSpaceOnUse" x="${r(x0 - GAP * s + 4 * s)}" y="${r(y0 - GAP * s + 4 * s)}"><rect width="${r(4 * s)}" height="${r(4 * s)}" fill="${DOT}"/></pattern></defs><rect width="${W}" height="${H}" fill="${NIGHT}"/><rect width="${W}" height="${H}" fill="url(#dots)"/>${parts.join('')}</svg>\n`;
}
const r = (n) => Math.round(n * 10) / 10;

const { portfolio } = JSON.parse(readFileSync(join(here, '../brand.json'), 'utf8'));
for (const [file, W, H, s, cy] of [
  ['cover.svg', 2400, 800, 0.8, 0.48],
  ['cover-mobile.svg', 1000, 800, 0.9, 0.48],
]) {
  writeFileSync(join(here, file), cover(W, H, s, cy, portfolio.alt));
  console.log(join(here, file));
}
