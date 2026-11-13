/**
 * Contact sheet for the 64x64 portraits: each seed's avatar, its portrait,
 * and the portrait shrunk to 128px and 64px; then two duets. Run with
 * `npx tsx lab/portrait64/sheet.ts out.html [count] [px]`.
 */
import { writeFileSync } from 'node:fs';
import { noggin } from '../../src/styles/noggin/index.js';
import { duet, portrait } from './noggin.js';

const out = process.argv[2] ?? 'portraits64.html';
const count = Number(process.argv[3] ?? 12);
const px = Number(process.argv[4] ?? 4);
const seeds = Array.from({ length: count }, (_, i) => `portrait-${i + 1}`);

const cards = seeds
  .map((s) => {
    const svg = portrait(s, px);
    const small = (n: number): string => svg.replace(/width="\d+" height="\d+"/, `width="${n}" height="${n}"`);
    return `<figure><div class="pair">${noggin(s, { size: 64, look: 'flat', shape: 'square' })}${svg}<div class="small">${small(128)}${small(64)}</div></div><figcaption>${s}</figcaption></figure>`;
  })
  .join('');

const html = `<!doctype html><meta charset="utf-8"><title>Noggin portraits 64</title>
<style>
body{margin:0;padding:24px;background:#141018;color:#e8e0d8;font:14px system-ui}
h1{font-size:18px;margin:0 0 4px}p{margin:0 0 20px;color:#a89ca8}
.grid{display:grid;grid-template-columns:repeat(3,max-content);gap:24px}
figure{margin:0}.pair{display:flex;gap:8px;align-items:flex-end}.small{display:flex;flex-direction:column;gap:8px}
figcaption{font-size:12px;color:#8a7e8a;margin-top:4px}
.duets{display:flex;flex-direction:column;gap:20px;margin-top:28px}
svg{display:block;border-radius:6px}
</style>
<h1>Noggin portraits, 64x64 (lab prototype)</h1>
<p>Each row: today's avatar for the seed, its 64x64 portrait at ${px * 64}px, then the same portrait at 128px and 64px.</p>
<div class="grid">${cards}</div>
<div class="duets">${duet('portrait-3', 'portrait-8', px)}${duet('portrait-2', 'portrait-10', px)}</div>`;

writeFileSync(out, html);
console.log(`wrote ${out}`);
