// The Snoot playground, drawn from the package build at /lib; site/playground.js does the rest.
import {
  FRAMES,
  HOLIDAY_PALETTES,
  LOOKS,
  PALETTES,
  randomSeed,
  resolveTraits,
  SHAPES,
  snoot,
  snootDataUri,
} from '/lib/styles/snoot/index.js';
import { playground, sharedGroups } from '/playground.js';

/** Names the big Snoot for screen readers, so a change of seed or option is heard. */
function describe(seed, options) {
  const t = resolveTraits(seed, options);
  const palette = typeof options.palette === 'object' ? options.palette : PALETTES[t.palette];
  const parts = [`${t.shape} cells`, `${palette.name} coat`, `${t.eyes} eyes`];
  if (t.marking !== 'none') parts.push(`${t.marking === 'spots' ? 'spotted' : t.marking} markings`);
  if (t.extra !== 'none') parts.push(t.extra === 'whiskers' ? 'whiskers' : `a ${t.extra}`);
  return `Snoot for "${seed}": a ${t.species}, ${parts.join(', ')}`;
}

const shared = sharedGroups({ SHAPES, FRAMES, LOOKS });
playground({
  name: 'snoot',
  noun: 'snoot',
  draw: snoot,
  dataUri: snootDataUri,
  randomSeed,
  holidays: HOLIDAY_PALETTES,
  describe,
  swatch: (p) => [p.bg, p.body, p.screen, p.accent],
  groups: [
    shared.cells,
    shared.look,
    shared.frame,
    {
      name: 'palette',
      legend: 'Coat',
      choices: [['auto', 'Seed picks'], ...PALETTES.map((p, i) => [String(i), p.name, p])],
    },
    {
      name: 'palette',
      legend: 'Holiday coat',
      choices: Object.entries(HOLIDAY_PALETTES).map(([key, p]) => [key, p.name, p]),
    },
    shared.grid,
    shared.motion,
  ],
});
