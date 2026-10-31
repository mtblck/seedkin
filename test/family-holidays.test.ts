import { describe, expect, it } from 'vitest';
import * as beastie from '../src/styles/beastie/index.js';
import * as botling from '../src/styles/botling/index.js';
import * as noggin from '../src/styles/noggin/index.js';
import { contrast } from '../src/styles/noggin/palettes.js';
import * as snoot from '../src/styles/snoot/index.js';
import * as sprite from '../src/styles/sprite/index.js';

// Every style's opt-in holiday palettes (test/holidays.test.ts covers Botling's in depth).
// A seed never picks one, so the everyday avatars, pinned by the corpus tests, don't move.

type Colours = Record<string, string>;
// biome-ignore lint/suspicious/noExplicitAny: each style has its own options type.
type Draw = (seed: string, opts?: any) => string;

interface Style {
  HOLIDAY_PALETTES: object;
  PALETTES: readonly object[];
  draw: Draw;
  // biome-ignore lint/suspicious/noExplicitAny: as above.
  resolveTraits: (seed: string, opts?: any) => object;
  /** The seed's own everyday colours, as a palette object. */
  own: (seed: string) => object;
}

const indexed =
  (m: { PALETTES: readonly object[]; resolveTraits: (seed: string) => { palette: number } }) =>
  (seed: string): object => ({ ...m.PALETTES[m.resolveTraits(seed).palette] });
const STYLES: [string, Style][] = [
  ['botling', { ...botling, draw: botling.botling, own: indexed(botling) }],
  ['snoot', { ...snoot, draw: snoot.snoot, own: indexed(snoot) }],
  [
    'noggin',
    {
      ...noggin,
      draw: noggin.noggin as Draw,
      own: (seed) => {
        const t = noggin.resolveTraits(seed);
        return noggin.paletteFor(t.palette, t.skin, t.hairColour);
      },
    },
  ],
  ['beastie', { ...beastie, draw: beastie.beastie, own: indexed(beastie) }],
  ['sprite', { ...sprite, draw: sprite.sprite, own: indexed(sprite) }],
];
const SEEDS = ['a', 'b', 'mtblck', 'botcollector', 'ada', 'grace'];
const colours = (svg: string): Set<string> =>
  new Set([...svg.matchAll(/(?:fill|stroke)="(#[^"]+)"/g)].map((m) => m[1] as string));

describe.each(STYLES)('%s holiday palettes', (name, s) => {
  const holidays = Object.entries(s.HOLIDAY_PALETTES) as [string, Colours][];

  it('has the same six holidays as every other style, in calendar order', () => {
    expect(Object.keys(s.HOLIDAY_PALETTES)).toEqual(Object.keys(botling.HOLIDAY_PALETTES));
    for (const [key, p] of holidays)
      expect(p.name).toBe((botling.HOLIDAY_PALETTES as unknown as Record<string, Colours>)[key]?.name);
  });

  it('keeps each seed the same avatar, only recoloured', () => {
    for (const seed of SEEDS) {
      // A palette object changes no trait, and handed the seed's own colours it draws the seed's avatar.
      for (const [, palette] of holidays) expect(s.resolveTraits(seed, { palette })).toEqual(s.resolveTraits(seed));
      for (const size of [24, 96]) expect(s.draw(seed, { size, palette: s.own(seed) })).toBe(s.draw(seed, { size }));
    }
  });

  it('is never picked by a seed, nor named like an everyday palette', () => {
    const names = new Set(s.PALETTES.map((p) => (p as Colours).name));
    for (const [, p] of holidays) expect(names).not.toContain(p.name);
  });

  it('cannot be recoloured at runtime', () => {
    expect(Object.isFrozen(s.HOLIDAY_PALETTES)).toBe(true);
    for (const [, p] of holidays) expect(Object.isFrozen(p)).toBe(true);
  });

  it.runIf(name !== 'noggin')('paints only its own colours', () => {
    for (const [, palette] of holidays) {
      const allowed = new Set(Object.values(palette));
      for (const seed of SEEDS) for (const used of colours(s.draw(seed, { palette }))) expect(allowed).toContain(used);
    }
  });
});

// Botling's floors are in test/contrast.test.ts. The others' holiday palettes must read at
// least as well as that style's weakest everyday palette, pair by pair.
describe.each([
  ['snoot', snoot],
  ['beastie', beastie],
  ['sprite', sprite],
] as const)('%s holiday contrast', (_, s) => {
  const everyday = s.PALETTES as unknown as readonly Colours[];
  const floor = (f: (p: Colours) => number): number => Math.min(...everyday.map(f));
  const checks: [string, (p: Colours) => number][] = [
    ['face on body', (p) => contrast(p.glow as string, p.body as string)],
    ['face on screen', (p) => contrast(p.glow as string, p.screen as string)],
    ['screen on body', (p) => contrast(p.screen as string, p.body as string)],
    [
      'avatar on its tile',
      (p) => Math.max(contrast(p.body as string, p.bg as string), contrast(p.shade as string, p.bg as string)),
    ],
  ];
  it.each(checks)('reads as well as the weakest everyday palette: %s', (_, f) => {
    const min = floor(f);
    for (const p of Object.values(s.HOLIDAY_PALETTES) as unknown as Colours[]) {
      expect(f(p), p.name).toBeGreaterThanOrEqual(min);
    }
  });
});

describe('noggin holiday outfits', () => {
  const outfits = Object.values(noggin.HOLIDAY_PALETTES);

  it("keeps the seed's skin and hair, and wears the outfit's colours", () => {
    for (const seed of SEEDS) {
      const t = noggin.resolveTraits(seed);
      const own = noggin.paletteFor(t.palette, t.skin, t.hairColour);
      for (const outfit of outfits) {
        const used = colours(noggin.noggin(seed, { palette: outfit }));
        const allowed = new Set([outfit.bg, outfit.grid, outfit.screen, outfit.accent, own.body, own.shade, own.glow]);
        for (const colour of used) expect(allowed).toContain(colour);
        expect(used).toContain(outfit.screen);
      }
    }
  });

  it('goes with any skin tone a caller picks', () => {
    for (let skin = 0; skin < noggin.SKIN_TONES.length; skin++) {
      const svg = noggin.noggin('x', { skin, palette: noggin.HOLIDAY_PALETTES.halloween });
      expect(svg).toContain(`"${noggin.SKIN_TONES[skin]?.body}"`);
    }
  });

  it('stands every face out from the background, whatever the skin tone', () => {
    for (const outfit of outfits) {
      for (const tone of noggin.SKIN_TONES)
        expect(contrast(tone.body, outfit.bg), outfit.name).toBeGreaterThanOrEqual(1.5);
    }
  });

  it('still takes a whole palette, and checks an outfit like one', () => {
    const custom = { ...noggin.paletteFor(0, 0, 0), body: '#123456' };
    expect(noggin.noggin('x', { palette: custom })).toContain('#123456');
    const bad = { ...noggin.HOLIDAY_PALETTES.christmas, screen: '"/><script>' };
    expect(() => noggin.noggin('x', { palette: bad })).toThrow(RangeError);
    expect(() => noggin.noggin('x', { palette: { ...custom, glow: undefined } as never })).toThrow(RangeError);
  });
});
