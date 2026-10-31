import { spawnSync } from 'node:child_process';
import { describe, expect, it, vi } from 'vitest';
import { pickAcross } from '../site/pick.js';
import { options, type PlaygroundState, snippet } from '../site/snippet.js';
import { arrival, body, HOST, track } from '../site/track.js';
import { botling, HOLIDAY_PALETTES } from '../src/styles/botling/index.js';

const auto = { shape: 'auto', palette: 'auto', grid: 'auto' };

/** Runs a copied snippet the way a developer would paste it. */
const run = (code: string): string =>
  new Function('botling', 'HOLIDAY_PALETTES', `return ${code}`)(botling, HOLIDAY_PALETTES);

describe('playground snippet', () => {
  it('leaves out options on auto', () => {
    expect(snippet({ seed: 'abc', ...auto })).toBe("botling('abc')");
    expect(options(auto, { size: 24 })).toEqual({ size: 24 });
  });

  it.each(['', "it's", 'a"b', 'back\\slash\\', "'\\'", 'line\nbreak', 'sep arator', 'emoji 🤖', '+&=#%'])(
    'copies code that draws the robot on screen for %j',
    (seed) => {
      const state: PlaygroundState = { seed, shape: 'triangle', palette: '3', grid: 'off' };
      expect(run(snippet(state))).toBe(botling(seed, options(state)));
    },
  );

  it("passes a style's own options through", () => {
    expect(snippet({ seed: 'abc', ...auto, skin: '3' }, 'noggin')).toBe("noggin('abc', { skin: 3 })");
    expect(options({ ...auto, skin: 'auto' })).toEqual({});
  });

  it("names the style's function", () => {
    expect(snippet({ seed: 'abc', ...auto, palette: '2' }, 'snoot')).toBe("snoot('abc', { palette: 2 })");
  });

  it('copies the frame unless it is the default square', () => {
    expect(snippet({ seed: 'abc', ...auto, frame: 'square' })).toBe("botling('abc')");
    const state: PlaygroundState = { seed: 'abc', ...auto, shape: 'diamond', frame: 'circle' };
    expect(snippet(state)).toBe("botling('abc', { shape: 'diamond', frame: 'circle' })");
    expect(run(snippet(state))).toBe(botling('abc', options(state)));
  });

  it('copies animate: true only when the robot is animated', () => {
    expect(snippet({ seed: 'abc', ...auto, motion: 'on' })).toBe("botling('abc', { animate: true })");
    expect(snippet({ seed: 'abc', ...auto, motion: 'off' })).toBe("botling('abc')");
  });
});

describe('playground holiday palettes', () => {
  it.each(Object.keys(HOLIDAY_PALETTES))('copies code for %s that draws the robot on screen', (holiday) => {
    for (const [shape, frame] of [
      ['auto', 'square'],
      ['circle', 'squircle'],
      ['auto', 'circle'],
    ] as const) {
      const state: PlaygroundState = { seed: 'mtblck', shape, frame, palette: holiday, grid: 'auto' };
      const code = snippet(state);
      expect(code).toContain(`palette: HOLIDAY_PALETTES.${holiday}`);
      expect(run(code)).toBe(botling('mtblck', options(state, {}, HOLIDAY_PALETTES)));
    }
  });

  it('passes a look other than gapped, and copies code that draws it', () => {
    expect(options({ ...auto, look: 'gapped' })).toEqual({});
    const state: PlaygroundState = {
      seed: 'mtblck',
      ...auto,
      look: 'soft-inked',
      palette: 'halloween',
      frame: 'circle',
    };
    const code = snippet(state);
    expect(code).toBe(
      "botling('mtblck', { frame: 'circle', palette: HOLIDAY_PALETTES.halloween, look: 'soft-inked' })",
    );
    expect(run(code)).toBe(botling('mtblck', options(state, {}, HOLIDAY_PALETTES)));
  });

  it('leaves an unknown holiday out rather than passing undefined', () => {
    expect(options({ shape: 'auto', palette: 'arbor-day', grid: 'auto' }, {}, HOLIDAY_PALETTES)).toEqual({});
  });
});

describe('hosting:check', () => {
  const check = (dir: string) => spawnSync(process.execPath, ['scripts/check-hosting.mjs', dir], { encoding: 'utf8' });

  it('passes on the repo', () => {
    expect(check('.').status).toBe(0);
  });

  it('fails on inline scripts, handlers, style attributes, unsafe-inline and a missing events rewrite', () => {
    const result = check('test/fixtures/bad-hosting');
    expect(result.status).toBe(1);
    for (const problem of [
      'unsafe-inline',
      'inline script',
      'inline event handler',
      'style attribute in site/app.js',
      'rewrite /_mb/events',
    ]) {
      expect(result.stderr).toContain(problem);
    }
  });
});

describe('playground analytics', () => {
  it('counts an arrival from another site as a visit, with only its hostname', () => {
    expect(arrival('https://www.google.com/search?q=robot+avatars', HOST)).toEqual({
      visit: true,
      ref: 'www.google.com',
    });
    expect(arrival('', HOST)).toEqual({ visit: true, ref: '' });
    expect(arrival('not a url', HOST)).toEqual({ visit: true, ref: '' });
    expect(arrival(`https://${HOST}/#seed=matt`, HOST)).toEqual({});
  });

  it('sends the project and event name, and never a seed', () => {
    expect(JSON.parse(body('copied'))).toEqual({ project: 'botling', event: 'copied' });
    const view = body('pageview', arrival('https://news.ycombinator.com/item?id=1#seed=x', HOST));
    expect(JSON.parse(view)).toEqual({
      visit: true,
      ref: 'news.ycombinator.com',
      project: 'botling',
      event: 'pageview',
    });
    expect(view).not.toContain('seed');
    // Extra fields can't relabel the beacon.
    expect(JSON.parse(body('copied', { project: 'other', event: 'x' }))).toMatchObject({
      project: 'botling',
      event: 'copied',
    });
  });

  it('sends beacons only from botling.me', () => {
    const sendBeacon = vi.fn(() => true);
    vi.stubGlobal('navigator', { sendBeacon });
    try {
      vi.stubGlobal('location', { hostname: 'localhost' });
      track('copied');
      expect(sendBeacon).not.toHaveBeenCalled();
      vi.stubGlobal('location', { hostname: HOST });
      track('downloaded');
      expect(sendBeacon).toHaveBeenCalledWith('/_mb/events', '{"project":"botling","event":"downloaded"}');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('pickAcross', () => {
  // A fixed sequence of "random" numbers: the first picks the group, the second the value.
  const seq =
    (...ns: number[]) =>
    () =>
      ns.shift() ?? 0;
  const everyday = { all: ['0', '1', '2', '3', '4', '5'], from: ['4', '5'] };
  const holiday = { all: ['xmas', 'halloween'], from: ['xmas', 'halloween'] };

  it('gives each group its share of all the choices, even when narrowed', () => {
    expect(pickAcross([everyday, holiday], seq(0.74, 0))).toBe('4');
    expect(pickAcross([everyday, holiday], seq(0.76, 0.9))).toBe('halloween');
  });

  it('picks only from the narrowed values', () => {
    expect(pickAcross([everyday], seq(0, 0.99))).toBe('5');
  });

  it('returns undefined with nothing to pick', () => {
    expect(pickAcross([])).toBeUndefined();
  });
});
