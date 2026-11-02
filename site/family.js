// The family pages: the landing page's seed box, which grows one seed in every style, and
// the style strips on /styles/. Packaged styles come from the package build (/lib); the
// lab ones from lab/preview.ts, bundled to /preview.js. Seeds stay in the URL hash.

import { beastie, beastieDataUri } from '/lib/styles/beastie/index.js';
import { botling, botlingDataUri, randomSeed } from '/lib/styles/botling/index.js';
import { noggin, nogginDataUri } from '/lib/styles/noggin/index.js';
import { snoot, snootDataUri } from '/lib/styles/snoot/index.js';
import { sprite, spriteDataUri } from '/lib/styles/sprite/index.js';
import { PREVIEWS } from '/preview.js';

// The landing page's Animate button, on by default (its aria-pressed in the HTML) unless the
// visitor asks for reduced motion. It moves the seed box's row only; fixed-seed avatars and the
// /styles/ strips stay still. An animated avatar goes in an <img>, because the CSP's style-src
// 'self' would block the <style> inside an inlined SVG. The SVG also holds still for reduced
// motion, but not every browser passes that preference into an <img>, so the default checks too.
let animate = false;
// Its Sticker button, off by default, draws the row with square cells and the sticker look,
// and the kin's links carry that to the playground. Lab previews have neither option.
let sticker = false;
const STICKER = { shape: 'square', look: 'sticker' };
/** Draws a style still, inline, or animated, as an image, as a sticker when that's on. */
const drawer = (draw, dataUri) => (seed, size, frame) => {
  const opts = { size, frame, ...(sticker && STICKER), title: null };
  return animate
    ? `<img src="${dataUri(seed, { ...opts, animate: true })}" alt="" width="${size}" height="${size}">`
    : draw(seed, opts);
};
const DRAW = {
  botling: drawer(botling, botlingDataUri),
  snoot: drawer(snoot, snootDataUri),
  noggin: drawer(noggin, nogginDataUri),
  beastie: drawer(beastie, beastieDataUri),
  sprite: drawer(sprite, spriteDataUri),
  ...Object.fromEntries(
    PREVIEWS.map((p) => [p.name.toLowerCase(), (seed, size, frame) => p.render(seed, size, frame, animate)]),
  ),
};
const $ = (id) => document.getElementById(id);

/**
 * Draws [data-avatar] elements: those with a data-seed of their own (drawn once, on load),
 * or by default those without, with this seed. An element can also set its size and frame
 * with data-size and data-frame.
 */
function grow(seed, selector = '[data-avatar]:not([data-seed])') {
  for (const el of document.querySelectorAll(selector)) {
    const { avatar, frame } = el.dataset;
    const size = Number(el.dataset.size) || (el.dataset.seed ? 96 : 128);
    el.innerHTML = DRAW[avatar](el.dataset.seed ?? seed, size, frame);
    // Decorative: the style's name is next to it.
    el.firstElementChild?.setAttribute('aria-hidden', 'true');
  }
  for (const link of document.querySelectorAll('[data-to]')) {
    link.href = `/styles/${link.dataset.to}/#${new URLSearchParams({ seed, ...(sticker && STICKER) })}`;
  }
}

// Safari throttles history calls, so typing updates the hash in a debounce.
let hashTimer;
function saveHash(seed) {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => {
    try {
      history.replaceState(null, '', `#${new URLSearchParams({ seed })}`);
    } catch {
      /* throttled or blocked: only the link lags */
    }
  }, 300);
}

grow('', '[data-avatar][data-seed]');
if (matchMedia('(prefers-reduced-motion: reduce)').matches) $('animate')?.setAttribute('aria-pressed', 'false');
animate = $('animate')?.getAttribute('aria-pressed') === 'true';
const input = $('seed');
if (input) {
  const readHash = () => {
    input.value = new URLSearchParams(location.hash.slice(1)).get('seed')?.replace(/[\r\n]+/g, '') ?? randomSeed();
    grow(input.value);
  };
  input.addEventListener('input', () => {
    grow(input.value);
    saveHash(input.value);
  });
  $('seed-form').addEventListener('submit', (e) => e.preventDefault());
  $('random').addEventListener('click', () => {
    input.value = randomSeed();
    grow(input.value);
    saveHash(input.value);
  });
  $('sticker')?.addEventListener('click', (e) => {
    sticker = !sticker;
    e.currentTarget.setAttribute('aria-pressed', String(sticker));
    grow(input.value);
  });
  $('animate')?.addEventListener('click', (e) => {
    animate = !animate;
    e.currentTarget.setAttribute('aria-pressed', String(animate));
    grow(input.value);
  });
  window.addEventListener('hashchange', readHash);
  readHash();
}

for (const strip of document.querySelectorAll('[data-strip]')) {
  const draw = DRAW[strip.dataset.strip];
  strip.innerHTML = Array.from({ length: 8 }, () => `<li>${draw(randomSeed(), 64)}</li>`).join('');
}
