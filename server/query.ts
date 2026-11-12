// Reads an avatar URL's query string into renderer options. Kept apart from any runtime's
// Request or URLSearchParams, so the API's rules are plain functions that tests call directly.

/** A request the API turns away, with the status and the reason it sends back. */
export class BadRequest extends Error {
  /**
   * @param message - Plain-text reason, shown to the caller
   * @param status - HTTP status, 400 unless said otherwise
   */
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

/** The longest query string read, and the longest seed and value within it. */
export const MAX_QUERY = 4096;
export const MAX_SEED = 200;
export const MAX_VALUE = 64;
/** Bounds on `size`, in pixels. The SVG scales, so this only sets its width and height. */
export const MIN_SIZE = 8;
export const MAX_SIZE = 1024;

const decode = (s: string): string => {
  try {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  } catch {
    throw new BadRequest('the query has a malformed percent escape');
  }
};

/**
 * Splits a query string into names and values, refusing a name given twice so a URL has
 * one meaning (and one cache entry per picture, near enough).
 *
 * @param query - The part after `?`, without it
 * @returns Each name once, with its decoded value
 */
export function parseQuery(query: string): Map<string, string> {
  if (query.length > MAX_QUERY) throw new BadRequest(`the query is longer than ${MAX_QUERY} characters`, 414);
  const params = new Map<string, string>();
  for (const pair of query.split('&')) {
    if (pair === '') continue;
    const at = pair.indexOf('=');
    const name = decode(at === -1 ? pair : pair.slice(0, at));
    const value = at === -1 ? '' : decode(pair.slice(at + 1));
    if (params.has(name)) throw new BadRequest(`${name} is given more than once`);
    params.set(name, value);
  }
  return params;
}

const BOOLEANS: Record<string, boolean> = { true: true, false: false };

const bool = (name: string, value: string): boolean => {
  const b = BOOLEANS[value];
  if (b === undefined) throw new BadRequest(`${name} must be true or false`);
  return b;
};

const int = (name: string, value: string, min: number, max: number): number => {
  const n = /^\d{1,5}$/.test(value) ? Number(value) : Number.NaN;
  if (!(n >= min && n <= max)) throw new BadRequest(`${name} must be a whole number from ${min} to ${max}`);
  return n;
};

/** What one style takes beyond the common options: its holiday palettes and its own options. */
export interface StyleRules {
  /** Holiday palette names, such as `halloween`, each accepted as a `palette` value. */
  holidays: Readonly<Record<string, object>>;
  /** The style's own options, read as strings and checked by its renderer: `element` for Sprite. */
  strings?: readonly string[];
  /** The style's own whole-number options: `skin` for Noggin. */
  ints?: readonly string[];
}

// Options every style takes. Names the renderer checks itself (shape, frame, look, detail)
// pass through as strings; a bad one comes back from it as a RangeError.
const STRINGS = new Set(['shape', 'frame', 'look', 'detail']);

/**
 * Turns a query into a seed and renderer options. Unknown names are refused rather than
 * ignored, so adding an option later can't change what an existing URL draws.
 *
 * @param params - From {@link parseQuery}
 * @param rules - The style's extras
 * @returns The seed and options for the style's renderer
 */
export function readOptions(params: Map<string, string>, rules: StyleRules): [string, Record<string, unknown>] {
  const seed = params.get('seed');
  if (seed === undefined || seed === '') throw new BadRequest('seed is required, such as ?seed=jolly-sprocket-65');
  if (seed.length > MAX_SEED) throw new BadRequest(`seed must be at most ${MAX_SEED} characters`);
  const opts: Record<string, unknown> = {};
  for (const [name, value] of params) {
    if (name === 'seed') continue;
    if (value.length > MAX_VALUE) throw new BadRequest(`${name} must be at most ${MAX_VALUE} characters`);
    if (name === 'size') opts.size = int(name, value, MIN_SIZE, MAX_SIZE);
    else if (name === 'background' || name === 'animate') opts[name] = bool(name, value);
    else if (name === 'grid') opts.showGrid = value === 'auto' ? 'auto' : bool(name, value);
    else if (name === 'title') opts.title = title(value);
    else if (name === 'palette') opts.palette = palette(value, rules);
    else if (rules.ints?.includes(name)) opts[name] = int(name, value, 0, 99);
    else if (STRINGS.has(name) || rules.strings?.includes(name)) opts[name] = value;
    else throw new BadRequest(`unknown option ${name}`);
  }
  return [seed, opts];
}

const palette = (value: string, rules: StyleRules): number | object => {
  if (/^\d+$/.test(value)) return int('palette', value, 0, 999);
  if (Object.keys(rules.holidays).includes(value)) return rules.holidays[value] as object;
  const names = Object.keys(rules.holidays).join(', ');
  throw new BadRequest(`palette must be a palette number or a holiday: ${names}`);
};

// XML has no place for most control characters, so one in the title would break the SVG.
const title = (value: string): string | null => {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: matching them is the point
  if (/[\u0000-\u001f\u007f]/.test(value)) throw new BadRequest('title must not contain control characters');
  return value === '' ? null : value;
};
