// The Sprite playground, drawn from the package build at /lib; site/playground.js does the rest.
import {
  ELEMENTS,
  FRAMES,
  HOLIDAY_PALETTES,
  LOOKS,
  PALETTES,
  randomSeed,
  resolveTraits,
  SHAPES,
  sprite,
  spriteDataUri,
} from '/lib/styles/sprite/index.js';
import { playground, sharedGroups } from '/playground.js';

const EYES = {
  dots: 'dot eyes',
  tiny: 'tiny eyes',
  round: 'round eyes',
  happy: 'happy eyes',
  sleepy: 'sleepy eyes',
  wink: 'a wink',
  glance: 'a sideways glance',
  close: 'close-set eyes',
};
const MOUTHS = {
  none: 'no mouth',
  dot: 'a little mouth',
  smile: 'a smile',
  grin: 'a grin',
  open: 'an open smile',
  smirk: 'a smirk',
  oh: 'an open mouth',
};
const MARKS = {
  dot: 'a dot on its forehead',
  bar: 'a bar on its forehead',
  chevron: 'a chevron on its forehead',
  plus: 'a plus on its forehead',
  twin: 'two dots on its forehead',
};
const title = (s) => s[0].toUpperCase() + s.slice(1);

/** Names the big Sprite for screen readers, so a change of seed or option is heard. */
function describe(seed, options) {
  const t = resolveTraits(seed, options);
  const palette = typeof options.palette === 'object' ? options.palette : PALETTES[t.palette];
  const parts = [`${t.shape} cells`, `${palette.name} colours`, EYES[t.eyes], MOUTHS[t.mouth]];
  if (t.hasBlush) parts.push('rosy cheeks');
  if (MARKS[t.mark]) parts.push(MARKS[t.mark]);
  return `Sprite for "${seed}": a ${t.element} ${t.form}, ${parts.join(', ')}`;
}

const shared = sharedGroups({ SHAPES, FRAMES, LOOKS });
playground({
  name: 'sprite',
  noun: 'sprite',
  draw: sprite,
  dataUri: spriteDataUri,
  randomSeed,
  holidays: HOLIDAY_PALETTES,
  describe,
  swatch: (p) => [p.bg, p.body, p.screen, p.accent],
  groups: [
    {
      name: 'element',
      legend: 'Element',
      choices: [['auto', 'Seed picks'], ...ELEMENTS.map((e) => [e, title(e)])],
    },
    // Sprites are drawn in squares unless asked otherwise, so "auto" is square here.
    {
      ...shared.cells,
      choices: [['auto', 'Square'], ...SHAPES.filter((s) => s !== 'square').map((s) => [s, title(s)])],
    },
    shared.look,
    shared.frame,
    {
      name: 'palette',
      legend: 'Colours',
      choices: [['auto', 'Seed picks'], ...PALETTES.map((p, i) => [String(i), p.name, p])],
    },
    {
      name: 'palette',
      legend: 'Holiday colours',
      choices: Object.entries(HOLIDAY_PALETTES).map(([key, p]) => [key, p.name, p]),
    },
    shared.grid,
    shared.motion,
  ],
});
