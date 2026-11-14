// The playground's portrait card: the seed drawn as a portrait, with its code and downloads.
// The style's portrait code loads on first draw, so a visitor who never scrolls down still
// pays for it only once; the card stays hidden if it can't load. Drawn as an image, since the
// CSP blocks the <style> inside an inlined SVG.
import { highlight } from '/highlight.js';
import { portraitOptions, portraitSnippet } from '/snippet.js';
import { track } from '/track.js';

const $ = (id) => document.getElementById(id);

/**
 * Starts the portrait card for a style.
 *
 * @param {string} name - The style's name, such as snoot
 * @param {() => { seed: string, palette: string, motion?: string }} state - The playground's current state
 * @returns {() => void} Redraws the card, a moment after the last call, as a portrait takes up to 50ms
 */
export function portraitPlay(name, state) {
  const card = $('portrait');
  if (!card) return () => {};
  const lib = import(`/lib/styles/${name}/portrait/index.js`);
  let timer;
  let statusTimer;
  const say = (text) => {
    $('portrait-status').textContent = text;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => ($('portrait-status').textContent = ''), 2500);
  };

  function redraw() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const { portraitDataUri } = await lib;
        const s = state();
        $('portrait-img').src = portraitDataUri(s.seed, portraitOptions(s, { size: 256, title: null }));
        $('portrait-img').alt = `The ${name} for "${s.seed}" as a portrait`;
        $('portrait-code').innerHTML = highlight(portraitSnippet(s, name), 'js');
        card.hidden = false;
      } catch {
        card.hidden = true;
      }
    }, 200);
  }

  $('copy-portrait').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(portraitSnippet(state(), name));
      say('Code copied');
      track('copied');
    } catch {
      say("Couldn't copy the code; select it and copy instead");
    }
  });
  // The SVG as drawn; a PNG is the still portrait at 512px.
  $('portrait-downloads').addEventListener('click', async (e) => {
    const format = e.target.closest('button[data-format]')?.dataset.format;
    if (!format) return;
    const s = state();
    try {
      const { portrait } = await lib;
      let blob;
      if (format === 'svg') blob = new Blob([portrait(s.seed, portraitOptions(s))], { type: 'image/svg+xml' });
      else {
        const svg = portrait(s.seed, { ...portraitOptions(s, { size: 512, title: null }), animate: false });
        const { still } = await import('/export.js');
        blob = await still(svg, 512, 'png');
      }
      const url = URL.createObjectURL(blob);
      const file = `${name}-portrait-${s.seed.slice(0, 40) || name}.${format}`;
      Object.assign(document.createElement('a'), { href: url, download: file }).click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      say(`${format.toUpperCase()} downloaded`);
      track('downloaded');
    } catch {
      say(`Couldn't make the ${format.toUpperCase()}`);
    }
  });
  return redraw;
}
