import { describe, expect, it } from 'vitest';
import { avatarResponse, CACHE_FOREVER } from '../server/avatar.js';
import { MAX_QUERY, parseQuery } from '../server/query.js';
import { botling } from '../src/styles/botling/index.js';
import { HOLIDAY_PALETTES, noggin } from '../src/styles/noggin/index.js';
import { snoot } from '../src/styles/snoot/index.js';
import { sprite } from '../src/styles/sprite/index.js';

const get = (url: string) => avatarResponse('GET', url);

describe('avatar API', () => {
  it('draws exactly what the package draws, cached for good', () => {
    const res = get('https://seedkin.dev/api/2.x/botling/svg?seed=jolly-sprocket-65&size=48&look=sticker');
    expect(res.status).toBe(200);
    expect(res.body).toBe(botling('jolly-sprocket-65', { size: 48, look: 'sticker' }));
    expect(res.headers['Content-Type']).toBe('image/svg+xml; charset=utf-8');
    expect(res.headers['Cache-Control']).toBe(CACHE_FOREVER);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('reads every common option', () => {
    const q = 'seed=a%20b&size=200&shape=circle&palette=3&frame=squircle&look=gapped&detail=full';
    const res = get(`/api/2.x/snoot/svg?${q}&background=false&grid=false&animate=true&title=Sam`);
    expect(res.body).toBe(
      snoot('a b', {
        size: 200,
        shape: 'circle',
        palette: 3,
        frame: 'squircle',
        look: 'gapped',
        detail: 'full',
        background: false,
        showGrid: false,
        animate: true,
        title: 'Sam',
      }),
    );
    expect(get('/api/2.x/snoot/svg?seed=x&grid=auto&title=').body).toBe(snoot('x', { showGrid: 'auto', title: null }));
  });

  it('takes holiday palettes by name and each style its own options', () => {
    expect(get('/api/2.x/noggin/svg?seed=x&palette=halloween&skin=2').body).toBe(
      noggin('x', { palette: HOLIDAY_PALETTES.halloween, skin: 2 }),
    );
    expect(get('/api/2.x/sprite/svg?seed=x&element=water').body).toBe(sprite('x', { element: 'water' }));
    expect(get('/api/2.x/beastie/svg?seed=x').status).toBe(200);
  });

  it('ignores the style Vercel adds from the path, but not a different one', () => {
    expect(get('/api/2.x/botling/svg?seed=x&style=botling').body).toBe(botling('x'));
    expect(get('/api/2.x/botling/svg?seed=x&style=snoot').status).toBe(400);
  });

  it('answers HEAD without a body', () => {
    const res = avatarResponse('HEAD', '/api/2.x/botling/svg?seed=x');
    expect([res.status, res.body]).toEqual([200, null]);
  });

  it.each([
    ['/api/2.x/botling/svg', 400, 'seed is required'],
    ['/api/2.x/botling/svg?seed=', 400, 'seed is required'],
    [`/api/2.x/botling/svg?seed=${'x'.repeat(201)}`, 400, 'seed must be at most'],
    ['/api/2.x/botling/svg?seed=x&seed=y', 400, 'more than once'],
    ['/api/2.x/botling/svg?seed=x&colour=red', 400, 'unknown option colour'],
    ['/api/2.x/botling/svg?seed=x&element=fire', 400, 'unknown option element'],
    ['/api/2.x/botling/svg?seed=x&size=4', 400, 'size must be a whole number from 8 to 1024'],
    ['/api/2.x/botling/svg?seed=x&size=1e3', 400, 'size must be'],
    ['/api/2.x/botling/svg?seed=x&size=48.5', 400, 'size must be'],
    ['/api/2.x/botling/svg?seed=x&animate=yes', 400, 'animate must be true or false'],
    ['/api/2.x/botling/svg?seed=x&palette=99', 400, 'botling: palette must be an integer'],
    ['/api/2.x/botling/svg?seed=x&palette=toString', 400, 'palette must be a palette number or a holiday'],
    ['/api/2.x/botling/svg?seed=x&shape=hexagon', 400, 'botling: unknown shape "hexagon"'],
    ['/api/2.x/botling/svg?seed=%E0%A4%A', 400, 'malformed'],
    [`/api/2.x/botling/svg?seed=x&title=${'t'.repeat(65)}`, 400, 'title must be at most 64'],
    [`/api/2.x/botling/svg?seed=x&z=${'z'.repeat(MAX_QUERY)}`, 414, 'longer than'],
    ['/api/2.x/robot/svg?seed=x', 404, 'no such style'],
    ['/api/2.x/__proto__/svg?seed=x', 404, 'no such style'],
    ['/api/2.x/botling/png?seed=x', 404, 'no such style'],
  ])('refuses %s with %i', (url, status, reason) => {
    const res = get(url);
    expect(res.status).toBe(status);
    expect(res.body).toContain(reason);
    expect(res.headers['Content-Type']).toBe('text/plain; charset=utf-8');
    expect(res.headers['Cache-Control']).not.toContain('immutable');
  });

  it('serves only GET and HEAD', () => {
    const res = avatarResponse('POST', '/api/2.x/botling/svg?seed=x');
    expect([res.status, res.headers.Allow]).toEqual([405, 'GET, HEAD']);
  });

  it('reads + as a space and a bare name as empty', () => {
    expect(parseQuery('seed=a+b&title&&x=%26')).toEqual(
      new Map([
        ['seed', 'a b'],
        ['title', ''],
        ['x', '&'],
      ]),
    );
  });
});
