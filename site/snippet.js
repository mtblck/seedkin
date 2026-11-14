// Pure helpers behind the playground's controls, kept apart from the DOM so
// test/site.test.ts can check that the copied code draws the same robot. A palette is
// either a PALETTES index ('0'-'11') or a HOLIDAY_PALETTES key ('halloween').

/**
 * Options for botling() from the playground state, leaving out anything on auto.
 *
 * @param {{ shape: string, look?: string, frame?: string, palette: string, grid: string, motion?: string }} state - The playground's choices
 * @param {object} [extra] - Options to add, such as size
 * @param {Record<string, object>} [holidays] - HOLIDAY_PALETTES, to look holiday keys up in
 * @returns {object} botling() options
 */
export function options(state, extra = {}, holidays = {}) {
  const o = { ...extra };
  if (state.shape !== 'auto') o.shape = state.shape;
  if (state.frame && state.frame !== 'square') o.frame = state.frame;
  if (isHoliday(state.palette)) {
    if (holidays[state.palette]) o.palette = holidays[state.palette];
  } else if (state.palette !== 'auto') o.palette = Number(state.palette);
  if (state.grid !== 'auto') o.showGrid = state.grid === 'on';
  if (state.look && state.look !== 'gapped') o.look = state.look;
  if (state.motion === 'on') o.animate = true;
  // A style's own options, such as Noggin's skin: numbers stay numbers.
  for (const [k, v] of Object.entries(state)) {
    if (!SHARED.has(k) && v !== undefined && v !== 'auto') o[k] = /^\d+$/.test(v) ? Number(v) : v;
  }
  return o;
}

/** State every style shares, mapped to options above; anything else passes straight through. */
const SHARED = new Set(['seed', 'shape', 'look', 'frame', 'palette', 'grid', 'motion']);

/**
 * The call a developer would write for the avatar on screen.
 *
 * @param {{ seed: string, shape: string, look?: string, frame?: string, palette: string, grid: string, motion?: string }} state - The playground's choices
 * @param {string} [name] - The style's function, such as snoot
 * @returns {string} A botling(...) call, or the style's, in single-quoted JavaScript
 */
export function snippet(state, name = 'botling') {
  const opts = options(state);
  const args = Object.entries(opts).map(([k, v]) => `${k}: ${JSON.stringify(v).replaceAll('"', "'")}`);
  // The object would print as a wall of hex; name it the way a developer would.
  if (isHoliday(state.palette))
    args.splice(Number('shape' in opts) + Number('frame' in opts), 0, `palette: HOLIDAY_PALETTES.${state.palette}`);
  const seed = JSON.stringify(state.seed).replaceAll("'", "\\'").replace(/^"|"$/g, "'");
  return `${name}(${seed}${args.length ? `, { ${args.join(', ')} }` : ''})`;
}

/** Holiday keys are names; built-in palettes are numbers. */
const isHoliday = (palette) => palette !== 'auto' && !/^\d+$/.test(palette);

/** A style's own options that change who the character is, so a portrait takes them too. */
const CHARACTER = ['element', 'skin'];

/**
 * Options for a portrait from the playground state: motion, the palette (a holiday's
 * as `holiday`) and the character options carry over; shape, look and grid are the avatar's.
 *
 * @param {{ palette: string, motion?: string, element?: string, skin?: string }} state - The playground's choices
 * @param {object} [extra] - Options to add, such as size
 * @returns {object} portrait() options
 */
export function portraitOptions(state, extra = {}) {
  const o = { ...extra };
  if (isHoliday(state.palette)) o.holiday = state.palette;
  else if (state.palette !== 'auto') o.palette = Number(state.palette);
  for (const k of CHARACTER) {
    const v = state[k];
    if (v !== undefined && v !== 'auto') o[k] = /^\d+$/.test(v) ? Number(v) : v;
  }
  if (state.motion === 'on') o.animate = true;
  return o;
}

/**
 * The call a developer would write for the portrait on screen.
 *
 * @param {{ seed: string, palette: string, motion?: string }} state - The playground's choices
 * @param {string} [name] - The style's name, such as snoot
 * @returns {string} An import and a portrait(...) call, in single-quoted JavaScript
 */
export function portraitSnippet(state, name = 'botling') {
  const args = Object.entries(portraitOptions(state)).map(
    ([k, v]) => `${k}: ${JSON.stringify(v).replaceAll('"', "'")}`,
  );
  const seed = JSON.stringify(state.seed).replaceAll("'", "\\'").replace(/^"|"$/g, "'");
  return `import { portrait } from 'seedkin/${name}/portrait';\n\nportrait(${seed}${args.length ? `, { ${args.join(', ')} }` : ''})`;
}
