// The avatar API's one route, /api/2.x/<style>/svg?seed=..., as a pure function from a
// method and URL to a response, so it runs the same on Vercel, in npm run serve and in tests.
import { HOLIDAY_PALETTES as BEASTIE_HOLIDAYS, beastie } from '../src/styles/beastie/index.js';
import { HOLIDAY_PALETTES as BOTLING_HOLIDAYS, botling } from '../src/styles/botling/index.js';
import { HOLIDAY_PALETTES as NOGGIN_HOLIDAYS, noggin } from '../src/styles/noggin/index.js';
import { HOLIDAY_PALETTES as SNOOT_HOLIDAYS, snoot } from '../src/styles/snoot/index.js';
import { HOLIDAY_PALETTES as SPRITE_HOLIDAYS, sprite } from '../src/styles/sprite/index.js';
import { BadRequest, parseQuery, readOptions, type StyleRules } from './query.js';

type Draw = (seed: string, opts: Record<string, unknown>) => string;

/** The styles the API draws, each with its renderer and query rules. */
export const API_STYLES: Readonly<Record<string, StyleRules & { draw: Draw }>> = Object.freeze({
  botling: { draw: botling as Draw, holidays: BOTLING_HOLIDAYS },
  snoot: { draw: snoot as Draw, holidays: SNOOT_HOLIDAYS },
  noggin: { draw: noggin as Draw, holidays: NOGGIN_HOLIDAYS, ints: ['skin'] },
  beastie: { draw: beastie as Draw, holidays: BEASTIE_HOLIDAYS },
  sprite: { draw: sprite as Draw, holidays: SPRITE_HOLIDAYS, strings: ['element'] },
});

/** A response, in plain values any runtime can wrap. `body` is null for HEAD. */
export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: string | null;
}

// Every response may be read from any site, and an SVG opened on its own runs nothing:
// the only inline style it needs is the animation's <style>.
const SHARED = {
  'Access-Control-Allow-Origin': '*',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  'X-Content-Type-Options': 'nosniff',
};
/** A seed's picture is fixed for the major version in the path, so it caches for good. */
export const CACHE_FOREVER = 'public, max-age=31536000, s-maxage=31536000, immutable';
// A refusal is as fixed as a picture, but a later release may come to accept it.
const CACHE_ERROR = 'public, max-age=300, s-maxage=86400';

const PATH = /^\/api\/2\.x\/([^/]+)\/svg\/?$/;

/**
 * Answers one request to the avatar API.
 *
 * @param method - The HTTP method; GET and HEAD are served
 * @param url - The request URL, absolute or from the path on
 * @returns The status, headers and body to send
 */
export function avatarResponse(method: string, url: string): ApiResponse {
  const head = method === 'HEAD';
  try {
    if (method !== 'GET' && !head) throw new BadRequest('only GET and HEAD are served', 405);
    const path = url.replace(/^[a-z]+:\/\/[^/]+/i, '');
    const at = path.indexOf('?');
    const style = PATH.exec(at === -1 ? path : path.slice(0, at))?.[1] ?? '';
    const rules = Object.keys(API_STYLES).includes(style) ? API_STYLES[style] : undefined;
    if (!rules) throw new BadRequest(`no such style; try ${Object.keys(API_STYLES).join(', ')}`, 404);
    const params = parseQuery(at === -1 ? '' : path.slice(at + 1));
    // Vercel passes the [style] path segment on as ?style=, which the path has already said.
    if (params.get('style') === style) params.delete('style');
    const [seed, opts] = readOptions(params, rules);
    const svg = rules.draw(seed, opts);
    const headers = { ...SHARED, 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': CACHE_FOREVER };
    return { status: 200, headers, body: head ? null : svg };
  } catch (err) {
    // The renderers throw a RangeError for a value they don't know, naming the option.
    if (!(err instanceof BadRequest) && !(err instanceof RangeError)) throw err;
    const status = err instanceof BadRequest ? err.status : 400;
    const headers: Record<string, string> = {
      ...SHARED,
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': CACHE_ERROR,
    };
    if (status === 405) headers.Allow = 'GET, HEAD';
    return { status, headers, body: head ? null : `${err.message}\n` };
  }
}
