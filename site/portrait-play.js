// The playground's portrait card: the seed drawn as a portrait, with its code and downloads.
// The style's portrait code loads on first draw, a moment after the page, and the card stays
// hidden if it can't load. Drawn as an image, since the CSP blocks the <style> inside an
// inlined SVG.
import { highlight } from '/highlight.js';
import { save, sayer } from '/save.js';
import { portraitOptions, portraitSnippet } from '/snippet.js';
import { track } from '/track.js';

const $ = (id) => document.getElementById(id);

/**
 * Starts the portrait card for a style.
 *
 * @param {string} name - The style's name, such as snoot
 * @param {() => { seed: string, palette: string, motion?: string }} state - The playground's current state
 * @returns {() => void} Redraws the card, a moment after the last call, as a portrait can take 100ms
 */
export function portraitPlay(name, state) {
  const card = $('portrait');
  if (!card) return () => {};
  let lib;
  const load = () => (lib ??= import(`/lib/styles/${name}/portrait/index.js`));
  const say = sayer($('portrait-status'));
  let timer;
  let drawn;

  function redraw() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const s = state();
      const code = portraitSnippet(s, name);
      // Only the seed, holiday and motion reach the portrait; other options leave it as it is.
      if (code === drawn) return;
      try {
        const { portraitDataUri } = await load();
        $('portrait-img').src = portraitDataUri(s.seed, portraitOptions(s, { size: 256, title: null }));
        $('portrait-img').alt = `The ${name} for "${s.seed}" as a portrait`;
        $('portrait-code').innerHTML = highlight(code, 'js');
        drawn = code;
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
  let busy = false;
  $('portrait-downloads').addEventListener('click', async (e) => {
    const format = e.target.closest('button[data-format]')?.dataset.format;
    if (!format || busy) return;
    // Copied now: the seed can change while the PNG is being made.
    const s = { ...state() };
    const file = `${name}-portrait-${s.seed.slice(0, 40) || name}.${format}`;
    busy = true;
    $('portrait-downloads').setAttribute('aria-busy', 'true');
    try {
      const { portrait } = await load();
      let blob;
      if (format === 'svg') blob = new Blob([portrait(s.seed, portraitOptions(s))], { type: 'image/svg+xml' });
      else {
        const svg = portrait(s.seed, { ...portraitOptions(s, { size: 512, title: null }), animate: false });
        const { still } = await import('/export.js');
        blob = await still(svg, 512, 'png');
      }
      save(blob, file);
      say(`${format.toUpperCase()} downloaded`);
      track('downloaded');
    } catch {
      say(`Couldn't make the ${format.toUpperCase()}`);
    } finally {
      busy = false;
      $('portrait-downloads').removeAttribute('aria-busy');
    }
  });
  return redraw;
}
