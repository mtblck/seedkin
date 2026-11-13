/**
 * Contact sheet: each seed's shipped Noggin avatar beside its prototype
 * portrait, plus two visual-novel duets. Run with
 * `npx tsx lab/portrait/sheet.ts out.html [count] [scale]`.
 */
import { writeFileSync } from 'node:fs';
import { noggin } from '../../src/styles/noggin/index.js';
import { duet, portrait } from './noggin.js';

const out = process.argv[2] ?? 'portraits.html';
const scale = Number(process.argv[4] ?? 6);
const count = Number(process.argv[3] ?? 12);
const seeds = Array.from({ length: count }, (_, i) => `portrait-${i + 1}`);

const cards = seeds
  .map(
    (s) =>
      `<figure><div class="pair">${noggin(s, { size: 96, look: 'flat', shape: 'square' })}${portrait(s, scale)}</div><figcaption>${s}</figcaption></figure>`,
  )
  .join('');

const html = `<!doctype html><meta charset="utf-8"><title>Noggin portraits</title>
<style>
body{margin:0;padding:24px;background:#141018;color:#e8e0d8;font:14px system-ui}
h1{font-size:18px;margin:0 0 4px}p{margin:0 0 20px;color:#a89ca8}
.grid{display:grid;grid-template-columns:repeat(4,max-content);gap:20px}
figure{margin:0}.pair{display:flex;gap:8px;align-items:flex-end}
figcaption{font-size:12px;color:#8a7e8a;margin-top:4px}
.duets{display:flex;gap:20px;margin-top:28px}
svg{display:block;border-radius:6px}
</style>
<h1>Noggin portraits (lab prototype)</h1>
<p>Left: today's 15x15 avatar for the seed. Right: a 32x32 portrait from the same traits, with seeded clothes and scene.</p>
<div class="grid">${cards}</div>
<div class="duets">${duet('portrait-3', 'portrait-8', scale)}${duet('portrait-2', 'portrait-10', scale)}</div>`;

writeFileSync(out, html);
console.log(`wrote ${out}`);
