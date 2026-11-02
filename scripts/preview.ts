/**
 * Writes preview.html: a contact sheet of robots at several sizes and in
 * every cell shape, on light and dark pages and in round and square frames,
 * for eyeballing art changes. Usage: npm run preview [count]
 */
import { writeFileSync } from 'node:fs';
import { botling, SHAPES } from '../src/styles/botling/index.js';

const count = Number(process.argv[2] ?? 24);
const sizes = [24, 32, 48, 96];
const seeds = Array.from({ length: count }, (_, i) => `seed-${i}`);

const sheet = (theme: string): string =>
  `${SHAPES.map((shape) => {
    const bySize = sizes
      .map((size) => `<div class="row">${seeds.map((s) => botling(s, { shape, size })).join('')}</div>`)
      .join('');
    return `<h2>${shape}</h2>${bySize}`;
  }).join('')}<p>${theme}</p>`;

const html = `<!doctype html><meta charset="utf-8"><title>Botling preview</title>
<style>body{font:14px system-ui;margin:0;display:grid;grid-template-columns:1fr 1fr}
section{padding:16px}section.dark{background:#16151c;color:#eee}section.light{background:#fff;color:#222}
.row{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0;align-items:center}
section.light svg{border-radius:50%}section.dark svg{border-radius:20%}h2{margin:16px 0 4px;font-size:15px}</style>
<section class="light">${sheet('Light page, round frames')}</section><section class="dark">${sheet('Dark page, rounded squares')}</section>`;
writeFileSync('preview.html', html);
console.log(`wrote preview.html (${seeds.length} seeds x ${sizes.length} sizes x ${SHAPES.length} shapes)`);
