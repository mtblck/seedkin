import { describe, expect, it } from 'vitest';
import { periods } from '../site/motion.js';
import { botling } from '../src/styles/botling/index.js';
import {
  ELEMENTS,
  EYES,
  FORMS,
  FRAME_COUNT,
  FRAMES,
  GRID_SIZE,
  grid,
  MARKS,
  MOUTHS,
  PALETTE_GROUPS,
  PALETTES,
  palettesFor,
  resolveTraits,
  SHAPES,
  SMALL_GRID_SIZE,
  smallGrid,
  sprite,
  spriteDataUri,
  traits,
} from '../src/styles/sprite/index.js';

const seeds = Array.from({ length: 400 }, (_, i) => `sprite-${i}`);

describe('sprite', () => {
  it('is stable for a seed, and nearly always differs between seeds', () => {
    expect(sprite('mtblck')).toBe(sprite('mtblck'));
    expect(new Set(seeds.slice(0, 200).map((s) => sprite(s))).size).toBeGreaterThanOrEqual(194);
  });

  it.each(ELEMENTS)('draws a known %s seed', (element) => {
    // Sprite is Stable (ADR 0014): a change here is a major version.
    expect(sprite('sprite', { element })).toMatchSnapshot();
  });

  it('salts the seed after it, so neighbouring seeds spread out', () => {
    expect(sprite('x')).not.toContain(botling('x').slice(200, 260));
    const pairs = Array.from({ length: 100 }, (_, i) => [traits(`user-${2 * i}`), traits(`user-${2 * i + 1}`)]);
    const same = pairs.filter(([a, b]) => JSON.stringify(a) === JSON.stringify(b));
    expect(same).toHaveLength(0);
  });

  it('picks every trait from its lists, and reaches every element, form and face', () => {
    const all = seeds.map((s) => traits(s));
    for (const t of all) {
      expect(FORMS[t.element]).toContain(t.form);
      expect(palettesFor(t.element, t.form)).toContain(t.palette);
      expect(t.beats).toHaveLength(FRAME_COUNT);
    }
    expect(new Set(all.map((t) => t.element)).size).toBe(ELEMENTS.length);
    expect(new Set(all.map((t) => t.form)).size).toBe(Object.values(FORMS).flat().length);
    expect(new Set(all.map((t) => t.eyes)).size).toBe(EYES.length);
    expect(new Set(all.map((t) => t.mouth)).size).toBe(MOUTHS.length);
    expect(new Set(all.map((t) => t.mark)).size).toBe(MARKS.length);
  });

  it('gives every palette to some form, and keeps gems for crystals and stones for boulders', () => {
    const used = new Set(ELEMENTS.flatMap((e) => FORMS[e].flatMap((f) => palettesFor(e, f))));
    expect(used.size).toBe(PALETTES.length);
    const names = (e: 'earth', f: 'boulder' | 'crystal'): string[] =>
      palettesFor(e, f).map((i) => PALETTES[i]?.name ?? '');
    expect(names('earth', 'crystal')).toContain('Amethyst');
    expect(names('earth', 'crystal')).not.toContain('Clay');
    expect(names('earth', 'boulder')).toContain('Clay');
  });

  it('groups every palette once, nine for every form', () => {
    expect(PALETTE_GROUPS.flatMap((g) => g.palettes)).toEqual(PALETTES.map((_, i) => i));
    for (const e of ELEMENTS) for (const f of FORMS[e]) expect(palettesFor(e, f)).toHaveLength(9);
  });

  it('lets the caller pick the element without changing the rest of the seed', () => {
    for (const element of ELEMENTS) {
      expect(resolveTraits('ada', { element }).element).toBe(element);
      expect(resolveTraits('ada', { element }).eyes).toBe(traits('ada').eyes);
    }
  });

  it('draws 15x15 and 9x9 grids for every frame', () => {
    for (const s of seeds.slice(0, 100)) {
      const t = traits(s);
      for (let f = 0; f < FRAME_COUNT; f++) {
        expect(grid(t, f)).toHaveLength(GRID_SIZE);
        for (const row of grid(t, f)) expect(row).toHaveLength(GRID_SIZE);
        expect(smallGrid(t, f)).toHaveLength(SMALL_GRID_SIZE);
        for (const row of smallGrid(t, f)) expect(row).toHaveLength(SMALL_GRID_SIZE);
      }
    }
  });

  it('switches to the small Sprite below 40px, and on request', () => {
    expect(sprite('x', { size: 24 })).toContain('viewBox="-0.5 -0.5 10 10"');
    expect(sprite('x', { size: 96 })).toContain('viewBox="-0.5 -0.5 16 16"');
    expect(sprite('x', { detail: 'small' })).toContain('viewBox="-0.5 -0.5 10 10"');
  });

  it('draws every shape and frame at both sizes', () => {
    for (const shape of SHAPES)
      for (const frame of FRAMES)
        for (const size of [24, 96]) expect(sprite(`${shape}-${frame}`, { shape, frame, size })).toMatch(/^<svg /);
  });

  it('animates by swapping frames, holding the still frame for reduced motion', () => {
    const svg = sprite('x', { animate: true });
    expect(svg).toContain('<style>@media (prefers-reduced-motion:no-preference){');
    expect(svg.match(/<g class="sprite-f/g)).toHaveLength(FRAME_COUNT);
    expect(svg.match(/visibility="hidden"/g)).toHaveLength(FRAME_COUNT - 1);
    // The playground's GIF export finds every frame's timing.
    expect(periods(svg)).toHaveLength(FRAME_COUNT);
    // The still Sprite is the first frame, drawn the same.
    const still = sprite('x', { showGrid: false });
    const firstFrame = still.slice(still.indexOf('<path'), still.lastIndexOf('</svg>'));
    expect(svg).toContain(firstFrame.slice(firstFrame.indexOf('<path', 1)));
  });

  it('applies overrides and the shared options', () => {
    const svg = sprite('x', { size: 40, palette: 2, shape: 'circle', showGrid: false, background: false });
    expect(svg).toContain('width="40" height="40"');
    expect(svg).not.toContain(`fill="${PALETTES[2]?.bg}"`);
    expect(svg).toContain(`"${PALETTES[2]?.body}"`);
    const custom = { ...PALETTES[0], body: '#123456' } as (typeof PALETTES)[number];
    expect(sprite('x', { palette: custom, element: 'fire' })).toContain('#123456');
  });

  it('names the image, or hides it from screen readers', () => {
    expect(sprite('x')).toContain('role="img" aria-label="Sprite avatar"');
    expect(sprite('x', { title: null })).toContain('aria-hidden="true"');
  });

  it('returns a data URI', () => {
    expect(spriteDataUri('x')).toBe(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(sprite('x'))}`);
  });

  it.each([
    [{ element: 'lightning' }, 'unknown element'],
    [{ shape: 'hexagon' }, 'unknown shape'],
    [{ palette: PALETTES.length }, `palette must be an integer from 0 to ${PALETTES.length - 1}`],
    [{ palette: null }, 'palette must be an index'],
    [{ size: 0 }, 'size must be a positive'],
  ])('rejects %j', (opts, message) => {
    expect(() => sprite('x', opts as never)).toThrow(new RegExp(`^sprite: ${message}`));
  });
});
