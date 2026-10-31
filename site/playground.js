// The playground every style page shares: the avatar, its sizes, code and downloads in one
// column, and the options beside it. A style page passes its functions and option groups
// (site/botling.js, site/snoot.js). State lives in the URL hash, which never reaches the
// server or analytics: seeds stay in the browser.
import { highlight } from '/highlight.js';
import { pickAcross } from '/pick.js';
import { options as optionsFor, snippet as snippetFor } from '/snippet.js';
import { track } from '/track.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const title = (s) => s[0].toUpperCase() + s.slice(1).replaceAll('-', ' ');

/**
 * The option groups every style has: cells, look, frame and background grid.
 *
 * @param {{ SHAPES: readonly string[], FRAMES: readonly string[], LOOKS: readonly string[] }} style - The style's exports
 * @returns {{ cells: object, look: object, frame: object, grid: object }} Groups for playground()
 */
export function sharedGroups({ SHAPES, FRAMES, LOOKS }) {
  return {
    cells: { name: 'shape', legend: 'Cells', choices: [['auto', 'Seed picks'], ...SHAPES.map((s) => [s, title(s)])] },
    look: { name: 'look', legend: 'Look', choices: LOOKS.map((l) => [l, title(l)]) },
    frame: { name: 'frame', legend: 'Frame', choices: FRAMES.map((f) => [f, title(f)]) },
    grid: {
      name: 'grid',
      legend: 'Background grid',
      choices: [
        ['auto', 'Auto'],
        ['on', 'On'],
        ['off', 'Off'],
      ],
    },
    // Motion is the Animate button beside Random rather than a row in the options panel.
    motion: {
      name: 'motion',
      legend: 'Motion',
      button: true,
      choices: [
        ['off', 'Still'],
        ['on', 'Animated'],
      ],
    },
  };
}

/**
 * Starts the playground.
 *
 * @param {object} style - The style's name (its function's name), noun ('robot'), draw and
 *   dataUri functions, randomSeed, holidays (HOLIDAY_PALETTES or {}), describe(seed, options)
 *   for screen readers, swatch(palette) giving its four colours, and groups: option groups
 *   as { name, legend, choices: [[value, label, swatch?]] }, the first choice the default; a
 *   swatch is a palette or an array of colours. A style's own groups start with 'auto', which
 *   snippet.js leaves out of the code.
 *   Two groups may share a name (everyday and holiday palettes): picking in one clears the other.
 *   A group with many choices can add sections ([{ label, values }]), othersLabel and
 *   featured(seed, options) giving the values to name for this avatar; the rest fold away as tiles.
 *   A group with button: true (Motion) isn't drawn in the panel: a button stands for it.
 */
export function playground(style) {
  const { name, noun, draw: drawStyle, dataUri, randomSeed, holidays = {}, groups } = style;
  const DEFAULTS = {};
  for (const g of groups) DEFAULTS[g.name] ??= g.choices[0][0];
  const KEYS = Object.keys(DEFAULTS);
  const state = { seed: '', ...DEFAULTS };
  const options = (extra) => optionsFor(state, extra, holidays);
  const snippet = () => snippetFor(state, name);

  // Safari throttles history calls (about 100 per 30s), so typing updates the hash in a debounce.
  let hashTimer;
  function saveHash() {
    clearTimeout(hashTimer);
    hashTimer = setTimeout(() => {
      const hash = new URLSearchParams({ seed: state.seed });
      for (const k of KEYS) if (state[k] !== DEFAULTS[k]) hash.set(k, state[k]);
      try {
        history.replaceState(null, '', `#${hash}`);
      } catch {
        /* throttled or blocked: the avatar still draws, only the link lags */
      }
    }, 300);
  }

  /**
   * The avatar at a size. An animated one goes in an <img>: the CSP's style-src 'self'
   * would block the <style> inside an inlined SVG, but an image is its own document.
   */
  function avatar(size) {
    const opts = options({ size, title: null });
    if (!opts.animate) return drawStyle(state.seed, opts);
    return `<img src="${dataUri(state.seed, opts)}" alt="" width="${size}" height="${size}">`;
  }

  function draw() {
    $('big').innerHTML = avatar(240);
    $('big').setAttribute('aria-label', style.describe(state.seed, options()));
    $('sizes').innerHTML = [96, 48, 32, 24].map((size) => `<li>${avatar(size)}<span>${size}px</span></li>`).join('');
    $('code').innerHTML = highlight(snippet(), 'js');
    arrange();
    $('animate').setAttribute('aria-pressed', String(state.motion === 'on'));
    for (const input of document.querySelectorAll('.choices input')) input.checked = state[input.name] === input.value;
    for (const link of document.querySelectorAll('[data-to]')) {
      link.href = `/styles/${link.dataset.to}/#${new URLSearchParams({ seed: state.seed })}`;
    }
    saveHash();
  }

  // The option groups, as radio buttons styled as segments or swatches.
  // A choice's swatch: a palette (through style.swatch) or a list of colours, such as a skin tone.
  const swatch = (p) =>
    `<i class="sw" aria-hidden="true">${(Array.isArray(p) ? p : style.swatch(p)).map((c) => `<b data-c="${c}"></b>`).join('')}</i>`;
  const choice = (i, g, [value, label, p]) => {
    const id = `opt-${i}-${value}`;
    return `<input type="radio" name="${g.name}" id="${id}" value="${value}"><label for="${id}">${p ? swatch(p) : ''}<span>${label}</span></label>`;
  };
  // A group with sections (Sprite's 81 palettes) names a few choices and folds the rest
  // away as small tiles, one row per section; draw() moves each choice to where it belongs.
  function sectioned(i, g) {
    const [first, ...rest] = g.choices;
    const sections = g.sections
      .map((s) => {
        const tiles = rest
          .filter(([v]) => s.values.includes(v))
          .map((c) => choice(i, g, c))
          .join('');
        return `<div class="section"><p class="sub">${s.label}</p><div class="choices swatches tiles">${tiles}</div></div>`;
      })
      .join('');
    return `<div class="choices swatches" data-featured>${choice(i, g, first)}</div><details class="others"><summary>${g.othersLabel} <span data-count></span></summary>${sections}</details>`;
  }
  // The palette groups get a card of their own under the options, titled by the first one;
  // its legend still names the fieldset for screen readers.
  const inCard = (g) => g.name === 'palette';
  const cardGroups = groups.filter(inCard);
  const picked = (g, i) => (g.sections ? `<span class="picked" id="picked-${i}" aria-hidden="true"></span>` : '');
  function fieldset(g, i) {
    const kind = g.choices.some(([, , p]) => p) ? 'swatches' : 'segments';
    const body = g.sections
      ? sectioned(i, g)
      : `<div class="choices ${kind}">${g.choices.map((c) => choice(i, g, c)).join('')}</div>`;
    const titled = g === cardGroups[0];
    const legend = titled
      ? `<legend class="sr-only">${g.legend}</legend>`
      : `<legend>${g.legend}${picked(g, i)}</legend>`;
    return `<fieldset class="group" data-group="${i}">${legend}${body}</fieldset>`;
  }
  const html = (want) => groups.map((g, i) => (!g.button && inCard(g) === want ? fieldset(g, i) : '')).join('');
  $('options').insertAdjacentHTML('beforeend', html(false));
  if (cardGroups.length) {
    const first = groups.indexOf(cardGroups[0]);
    $('colours-h').innerHTML = `${cardGroups[0].legend}${picked(cardGroups[0], first)}`;
    $('colours').insertAdjacentHTML('beforeend', html(true));
    $('colours').hidden = false;
  }
  // Each sectioned group's choices, with the tile row each one goes back to.
  const placed = groups.flatMap((g, i) => {
    if (!g.sections) return [];
    const set = document.querySelector(`[data-group="${i}"]`);
    // A choice in no section isn't drawn, so it is left out rather than breaking the page.
    const items = g.choices.slice(1).flatMap(([value, label]) => {
      const input = set.querySelector(`input[value="${CSS.escape(value)}"]`);
      return input ? [{ value, label, input, tag: input.nextElementSibling, home: input.parentElement }] : [];
    });
    return [{ g, set, items, key: '', picked: $(`picked-${i}`) }];
  });
  /** Moves the choices a sectioned group names for this avatar out of the fold, and the rest back. */
  function arrange() {
    for (const entry of placed) {
      const picked = entry.items.find((it) => it.value === state[entry.g.name]);
      entry.picked.textContent = picked ? `: ${picked.label}` : '';
      const featured = new Set(entry.g.featured(state.seed, options()));
      const key = [...featured].join();
      if (key !== entry.key) {
        entry.key = key;
        const top = entry.set.querySelector('[data-featured]');
        // Appended in order, so each row keeps its order. A tile is named on hover; a chip shows its name.
        for (const it of entry.items) {
          const named = featured.has(it.value);
          (named ? top : it.home).append(it.input, it.tag);
          if (named) it.tag.removeAttribute('title');
          else it.tag.title = it.label;
        }
        for (const s of entry.set.querySelectorAll('.section')) s.hidden = !s.querySelector('input');
        entry.set.querySelector('[data-count]').textContent = `(${entry.items.length - featured.size})`;
      }
      // A new pick in the fold opens it, so it stays in view and Tab can reach the group; closing
      // the fold afterwards sticks until the pick changes.
      const outside = picked && !featured.has(picked.value) ? picked.value : '';
      if (outside && outside !== entry.opened) entry.set.querySelector('.others').open = true;
      entry.opened = outside;
    }
  }
  // Swatch colours go in through the CSSOM, which the CSP allows, rather than style attributes.
  for (const b of document.querySelectorAll('.sw b')) b.style.background = b.dataset.c;
  const pick = (e) => {
    state[e.target.name] = e.target.value;
    draw();
    gallery();
  };
  $('options').addEventListener('change', pick);
  $('colours').addEventListener('change', pick);
  $('reset').addEventListener('click', () => {
    // Motion is the Animate button, not an option in the panel, so Reset leaves it be.
    for (const g of groups) if (!g.button) state[g.name] = DEFAULTS[g.name];
    draw();
    gallery();
    say('Options reset to what the seed picks');
  });

  let statusTimer;
  function say(text) {
    $('status').textContent = text;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => ($('status').textContent = ''), 2500);
  }
  async function copy(text, what) {
    try {
      await navigator.clipboard.writeText(text);
      say(`${what} copied`);
      track('copied');
    } catch {
      say(`Couldn't copy the ${what.toLowerCase()}; select it and copy instead`);
    }
  }

  // More seeds, drawn with the options on screen, so a change shows on many avatars at once.
  // Redrawn when an option changes, not on every keystroke in the seed box.
  let seeds = [];
  const shuffle = () => (seeds = Array.from({ length: 24 }, () => randomSeed()));
  function gallery() {
    $('gallery').innerHTML = seeds
      .map(
        (s) =>
          `<li><button type="button" data-seed="${s}" aria-label="Try ${s}"><img src="${dataUri(s, options({ size: 64, title: null }))}" alt="" width="64" height="64"></button></li>`,
      )
      .join('');
  }

  $('seed').addEventListener('input', (e) => {
    state.seed = e.target.value;
    draw();
  });
  $('seed-form').addEventListener('submit', (e) => e.preventDefault());
  // A new seed, cells and palette (everyday or holiday). Look, frame, grid and motion stay as they are.
  $('random').addEventListener('click', () => {
    state.seed = $('seed').value = randomSeed();
    for (const key of ['shape', 'palette']) {
      // Everyday and holiday groups keep their shares; Sprite's narrows to the form's nine.
      const pool = groups
        .filter((g) => g.name === key)
        .map((g) => {
          const all = g.choices.map(([v]) => v).filter((v) => v !== 'auto');
          return { all, from: g.featured ? g.featured(state.seed, options()) : all };
        });
      const value = pickAcross(pool);
      if (value) state[key] = value;
    }
    draw();
    gallery();
  });
  // The Animate button beside Random is the Motion option (a group with button: true).
  $('animate').addEventListener('click', () => {
    state.motion = state.motion === 'on' ? 'off' : 'on';
    draw();
    gallery();
  });
  $('shuffle').addEventListener('click', () => {
    shuffle();
    gallery();
    say('New seeds, with the same options');
  });
  $('gallery').addEventListener('click', (e) => {
    const button = e.target.closest('button[data-seed]');
    if (!button) return;
    state.seed = $('seed').value = button.dataset.seed;
    draw();
    // Move focus with the view, so keyboard and screen-reader users land on the new avatar too.
    $('seed').focus({ preventScroll: true });
    $('seed').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
    say(`Showing ${button.dataset.seed}`);
  });
  $('copy-code').addEventListener('click', () => copy(snippet(), 'Code'));
  $('copy-svg').addEventListener('click', () => copy(drawStyle(state.seed, options()), 'SVG'));

  function save(blob, file) {
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: file }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  /**
   * The image as a file. PNG and JPG are the still avatar at 512px; a 256px GIF moves if
   * Motion is on. Their code loads on first use, so the page doesn't carry a GIF encoder
   * for everyone.
   */
  async function image(format) {
    if (format === 'svg') return new Blob([drawStyle(state.seed, options())], { type: 'image/svg+xml' });
    // Drawn before the import, so the file is the avatar on screen when the button was pressed.
    const size = format === 'gif' ? 256 : 512;
    const svg = drawStyle(state.seed, {
      ...options({ size, title: null }),
      ...(format !== 'gif' && { animate: false }),
    });
    const { gif, still } = await import('/export.js');
    return format === 'gif' ? gif(svg, size) : still(svg, size, format);
  }
  let busy = false;
  $('downloads').addEventListener('click', async (e) => {
    const format = e.target.closest('button[data-format]')?.dataset.format;
    if (!format || busy) return;
    const label =
      format === 'gif' && state.motion === 'on' ? 'Animated GIF' : format === 'jpeg' ? 'JPG' : format.toUpperCase();
    // Named now: the seed can change while a GIF is being made.
    const file = `${name}-${state.seed.slice(0, 40) || noun}.${format === 'jpeg' ? 'jpg' : format}`;
    busy = true;
    $('downloads').setAttribute('aria-busy', 'true');
    if (format !== 'svg') say(`Making the ${label}…`);
    try {
      save(await image(format), file);
      say(`${label} downloaded`);
      track('downloaded');
    } catch {
      say(`Couldn't make the ${label}; try the SVG instead`);
    } finally {
      busy = false;
      $('downloads').removeAttribute('aria-busy');
    }
  });

  /** Loads the state from the URL hash: on load, and when a shared link is opened in this tab. */
  function readHash() {
    const fromHash = new URLSearchParams(location.hash.slice(1));
    // A text input can't hold a line break, so drop them rather than draw an avatar the box can't show.
    state.seed = fromHash.get('seed')?.replace(/[\r\n]+/g, '') ?? randomSeed();
    for (const k of KEYS) {
      const v = fromHash.get(k);
      const known = groups.some((g) => g.name === k && g.choices.some(([value]) => value === v));
      state[k] = known ? v : DEFAULTS[k];
    }
    $('seed').value = state.seed;
    draw();
    gallery();
  }
  // replaceState doesn't fire hashchange, so this only runs for real navigations.
  window.addEventListener('hashchange', readHash);
  shuffle();
  readHash();
}
