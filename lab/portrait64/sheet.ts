/**
 * Contact sheet for one style's portraits: each seed's avatar beside its
 * portrait, then two duets. Run with
 * `npx tsx lab/portrait64/sheet.ts <style> out.html [count] [size] [animate] [holiday]`.
 */
import { writeFileSync } from 'node:fs';
import type { Holiday } from '../../src/core/types.js';
import * as beastie from '../../src/styles/beastie/index.js';
import * as botling from '../../src/styles/botling/index.js';
import * as noggin from '../../src/styles/noggin/index.js';
import * as snoot from '../../src/styles/snoot/index.js';
import * as sprite from '../../src/styles/sprite/index.js';

const STYLES = {
  beastie: { avatar: beastie.beastie, ...beastie },
  botling: { avatar: botling.botling, ...botling },
  noggin: { avatar: noggin.noggin, ...noggin },
  snoot: { avatar: snoot.snoot, ...snoot },
  sprite: { avatar: sprite.sprite, ...sprite },
};
const name = (process.argv[2] ?? 'noggin') as keyof typeof STYLES;
const style = STYLES[name];
const out = process.argv[3] ?? `${name}-portraits.html`;
const count = Number(process.argv[4] ?? 12);
const size = Number(process.argv[5] ?? 256);
const animate = process.argv[6] === 'animate';
const holiday = process.argv[7] as Holiday | undefined;
const opts = { size, animate, ...(holiday ? { holiday } : {}) };
const seeds = Array.from({ length: count }, (_, i) => `${name}-${i + 1}`);

const cards = seeds
  .map(
    (s) =>
      `<figure>${style.avatar(s, { size: 64, look: 'flat' })}${style.portrait(s, opts)}<figcaption>${s}</figcaption></figure>`,
  )
  .join('');
const html = `<!doctype html><meta charset="utf-8"><title>${name} portraits</title>
<style>body{margin:0;padding:24px;background:#141018;color:#e8e0d8;font:14px system-ui}
.grid{display:grid;grid-template-columns:repeat(3,max-content);gap:24px}figure{margin:0;display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}
figcaption{width:100%;font-size:12px;color:#8a7e8a}.duets{display:flex;flex-direction:column;gap:20px;margin-top:28px}svg{display:block;border-radius:6px}</style>
<div class="grid">${cards}</div>
<div class="duets">${style.duet(seeds[2] ?? 'a', seeds[7] ?? 'b', opts)}${style.duet(seeds[1] ?? 'c', seeds[9] ?? 'd', opts)}</div>`;
writeFileSync(out, html);
console.log(`wrote ${out}`);
