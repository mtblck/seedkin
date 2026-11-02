import { describe, expect, it } from 'vitest';
import { Role } from '../src/core/types.js';
import { drawGrid } from '../src/styles/beastie/grid/full.js';
import { drawSmallGrid } from '../src/styles/beastie/grid/small.js';
import {
  BODIES,
  beastie,
  beastieDataUri,
  EYES,
  FRAMES,
  GRID_SIZE,
  grid,
  MOUTHS,
  PALETTES,
  resolveTraits,
  SHAPES,
  SIDES,
  SMALL_GRID_SIZE,
  smallGrid,
  TOPS,
  traits,
} from '../src/styles/beastie/index.js';
import { botling } from '../src/styles/botling/index.js';

const seeds = Array.from({ length: 400 }, (_, i) => `beastie-${i}`);

describe('beastie', () => {
  it('is stable for a seed, and nearly always differs between seeds', () => {
    expect(beastie('mtblck')).toBe(beastie('mtblck'));
    expect(new Set(seeds.slice(0, 200).map((s) => beastie(s))).size).toBeGreaterThanOrEqual(199);
  });

  it.each(SHAPES)('draws a known seed with %s cells', (shape) => {
    // Beastie is a Preview style: these may change in a minor, but only on purpose.
    expect(beastie('beastie', { shape })).toMatchSnapshot();
  });

  it('salts the seed, so a Beastie shares nothing with its Botling', () => {
    expect(beastie('x')).not.toContain(botling('x').slice(200, 260));
    expect(traits('x')).not.toEqual(traits('y'));
  });

  it('picks every trait from its list, and reaches every body and eye', () => {
    const all = seeds.map((s) => traits(s));
    for (const t of all) {
      expect(BODIES).toContain(t.body);
      expect(EYES).toContain(t.eyes);
      expect(MOUTHS).toContain(t.mouth);
      expect(TOPS).toContain(t.top);
      expect(SIDES).toContain(t.sides);
      expect(PALETTES[t.palette]).toBeDefined();
    }
    expect(new Set(all.map((t) => t.body)).size).toBe(BODIES.length);
    expect(new Set(all.map((t) => t.eyes)).size).toBe(EYES.length);
  });

  it('draws 15x15 and 9x9 grids that stay inside the canvas', () => {
    for (const s of seeds.slice(0, 100)) {
      const t = traits(s);
      expect(grid(t)).toHaveLength(GRID_SIZE);
      expect(smallGrid(t)).toHaveLength(SMALL_GRID_SIZE);
      for (const row of smallGrid(t)) expect(row).toHaveLength(SMALL_GRID_SIZE);
    }
  });

  it('switches to the small Beastie below 40px, and on request', () => {
    expect(beastie('x', { size: 24, shape: 'square' })).toContain('viewBox="-0.5 -0.5 10 10"');
    expect(beastie('x', { size: 96, shape: 'square' })).toContain('viewBox="-0.5 -0.5 16 16"');
    expect(beastie('x', { detail: 'small', shape: 'square' })).toContain('viewBox="-0.5 -0.5 10 10"');
    expect(beastie('x', { size: 24, detail: 'full', shape: 'square' })).toContain('viewBox="-0.5 -0.5 16 16"');
  });

  it('draws every shape and frame at both sizes', () => {
    for (const shape of SHAPES)
      for (const frame of FRAMES)
        for (const size of [24, 96]) expect(beastie(`${shape}-${frame}`, { shape, frame, size })).toMatch(/^<svg /);
  });

  it('applies overrides and the shared options', () => {
    const svg = beastie('x', { size: 40, palette: 2, shape: 'circle', showGrid: false, background: false });
    expect(svg).toContain('width="40" height="40"');
    expect(svg).not.toContain(`fill="${PALETTES[2]?.bg}"`);
    expect(svg).toContain(`"${PALETTES[2]?.body}"`);
    expect(resolveTraits('x', { palette: 2, shape: 'circle' })).toMatchObject({ palette: 2, shape: 'circle' });
    const custom = { ...PALETTES[0], body: '#123456' } as (typeof PALETTES)[number];
    expect(beastie('x', { palette: custom })).toContain('#123456');
  });

  it('names the image, or hides it from screen readers', () => {
    expect(beastie('x')).toContain('role="img" aria-label="Monster avatar"');
    expect(beastie('x', { title: 'Ada & "co"' })).toContain('aria-label="Ada &#38; &#34;co&#34;"');
    expect(beastie('x', { title: null })).toContain('aria-hidden="true"');
  });

  it('returns a data URI', () => {
    expect(beastieDataUri('x')).toBe(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(beastie('x'))}`);
  });

  it.each([
    [{ shape: 'hexagon' }, 'unknown shape'],
    [{ palette: 8 }, 'palette must be an integer from 0 to 7'],
    [{ palette: 1.5 }, 'palette must be an integer'],
    [{ palette: null }, 'palette must be an index'],
    [{ palette: { ...PALETTES[0], body: 'red' } }, 'palette.body must be a hex colour'],
    [{ size: 0 }, 'size must be a positive'],
    [{ detail: 'tiny' }, 'unknown detail'],
    [{ frame: 'star' }, 'unknown frame'],
  ])('rejects %j', (opts, message) => {
    expect(() => beastie('x', opts as never)).toThrow(new RegExp(`^beastie: ${message}`));
  });

  it('blinks eyes on stalks without uncovering anything behind them', () => {
    // bouncy-socket-123 has eyes on stalks over its antennae.
    const c = drawGrid(resolveTraits('bouncy-socket-123'));
    const eyes = c.parts.flatMap((row, y) => row.flatMap((p, x) => (p === 'eyes' && y < 4 ? [{ x, y }] : [])));
    expect(eyes.length).toBeGreaterThan(0);
    // Above the head there is nothing behind an eye, so a blink shows the background.
    for (const { x, y } of eyes) expect(c.under[y]?.[x]).toBe(Role.Empty);
    // The stalks hold still.
    for (const [y, x] of [
      [2, c.center - 2],
      [3, c.center + 2],
    ] as const) {
      expect(c.cells[y]?.[x]).toBe(Role.Body);
      expect(c.parts[y]?.[x]).toBeNull();
    }
  });

  it('never hides a spot or a horn under a blink or a talk', () => {
    // bouncy-spark-642 had a spot under its mouth; seed-21's small eye stalks sat on its horn tips.
    const seeds = ['bouncy-spark-642', 'seed-21', ...Array.from({ length: 300 }, (_, i) => `seed-${i}`)];
    for (const seed of seeds)
      for (const c of [drawGrid(resolveTraits(seed)), drawSmallGrid(resolveTraits(seed))])
        for (const [y, row] of c.under.entries())
          for (const [x, role] of row.entries())
            if (c.parts[y]?.[x]) expect(role, `${seed} ${x},${y}`).not.toBe(Role.Accent);
  });
});
