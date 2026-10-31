import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import * as beastie from '../src/styles/beastie/index.js';
import * as noggin from '../src/styles/noggin/index.js';
import * as snoot from '../src/styles/snoot/index.js';
import * as sprite from '../src/styles/sprite/index.js';

// The Stable freeze for Snoot, Noggin and Beastie (ADR 0011) and Sprite (ADR 0014), as Botling's
// corpus does it (ADR 0006). A change to a picture digest below means a seed
// draws a different avatar: a major version. Markup digests pin the SVG too,
// so SVG that draws the same picture moves only those: look at the preview
// before calling that a minor.
const SEEDS = Array.from({ length: 500 }, (_, i) => `corpus-${i}`);

const digest = (parts: Iterable<string>): string => {
  const h = createHash('sha256');
  for (const part of parts) h.update(part).update('\n');
  return h.digest('hex').slice(0, 16);
};

const rows = (cells: readonly (readonly number[])[]): string => cells.map((row) => row.join('')).join('/');

/** What each style needs to be pinned: how to draw it and which parts a seed must reach. */
interface Style {
  // biome-ignore lint/suspicious/noExplicitAny: each style has its own traits type.
  resolveTraits: (seed: string) => any;
  // biome-ignore lint/suspicious/noExplicitAny: as above.
  grid: (t: any) => readonly (readonly number[])[];
  // biome-ignore lint/suspicious/noExplicitAny: as above.
  smallGrid: (t: any) => readonly (readonly number[])[];
  draw: (seed: string, opts: { size: number; animate: boolean }) => string;
  colours: unknown;
  parts: Record<string, readonly unknown[]>;
}

const STYLES: Record<string, Style> = {
  snoot: {
    ...snoot,
    draw: snoot.snoot,
    colours: snoot.PALETTES,
    parts: {
      species: snoot.SPECIES,
      eyes: snoot.EYES,
      marking: snoot.MARKINGS,
      extra: snoot.EXTRAS,
      mouth: snoot.MOUTHS,
    },
  },
  noggin: {
    ...noggin,
    draw: noggin.noggin,
    colours: [noggin.PALETTES, noggin.SKIN_TONES, noggin.HAIR_COLOURS],
    parts: {
      hair: noggin.HAIRS,
      eyes: noggin.EYES,
      mouth: noggin.MOUTHS,
      facial: noggin.FACIAL,
      eyewear: noggin.EYEWEAR,
      headwear: noggin.HEADWEAR,
    },
  },
  beastie: {
    ...beastie,
    draw: beastie.beastie,
    colours: beastie.PALETTES,
    parts: { body: beastie.BODIES, eyes: beastie.EYES, mouth: beastie.MOUTHS, top: beastie.TOPS, sides: beastie.SIDES },
  },
  sprite: {
    ...sprite,
    draw: sprite.sprite,
    colours: [sprite.PALETTES, sprite.PALETTE_GROUPS],
    parts: {
      element: sprite.ELEMENTS,
      form: Object.values(sprite.FORMS).flat(),
      eyes: sprite.EYES,
      mouth: sprite.MOUTHS,
      mark: sprite.MARKS,
    },
  },
};

describe.each(Object.entries(STYLES))('%s golden corpus', (_, style) => {
  const traits = SEEDS.map((seed) => style.resolveTraits(seed));

  it('pins the traits, grids and colours', () => {
    expect({
      traits: digest(traits.map((t) => JSON.stringify(t))),
      full: digest(traits.map((t) => rows(style.grid(t)))),
      small: digest(traits.map((t) => rows(style.smallGrid(t)))),
      colours: digest([JSON.stringify(style.colours)]),
    }).toMatchSnapshot();
  });

  it('pins the markup, still and animated', () => {
    const svg = (size: number, animate: boolean): string =>
      digest(SEEDS.map((seed) => style.draw(seed, { size, animate })));
    expect({
      full: svg(96, false),
      small: svg(24, false),
      fullAnimated: svg(96, true),
      smallAnimated: svg(24, true),
    }).toMatchSnapshot();
  });

  it.each(Object.entries(style.parts))('reaches every %s, so no part goes unpinned', (key, values) => {
    const seen = new Set(traits.map((t) => t[key]));
    expect([...seen].sort()).toEqual([...values].sort());
  });
});
