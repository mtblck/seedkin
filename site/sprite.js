// The Sprite playground, drawn from the package build at /lib; site/playground.js does the rest.
import {
  ELEMENTS,
  FORMS,
  FRAMES,
  LOOKS,
  PALETTE_GROUPS,
  PALETTES,
  palettesFor,
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
// The names the site uses for forms whose code names read oddly.
const FORM_NAMES = { puff: 'cloud', tornado: 'whirlwind', crystal: 'gem', jelly: 'jellyfish' };
const formName = (f) => FORM_NAMES[f] ?? f;

/** A palette group's heading: its element, and its forms if it isn't the whole element's. */
function groupLabel({ element, forms }) {
  if (forms.length === FORMS[element].length) return title(element);
  return `${title(element)} · ${forms.map(formName).join(' and ')}`;
}

/** Names the big Sprite for screen readers, so a change of seed or option is heard. */
function describe(seed, options) {
  const t = resolveTraits(seed, options);
  const parts = [`${t.shape} cells`, `${PALETTES[t.palette].name} colours`, EYES[t.eyes], MOUTHS[t.mouth]];
  if (t.hasBlush) parts.push('rosy cheeks');
  if (MARKS[t.mark]) parts.push(MARKS[t.mark]);
  return `Sprite for "${seed}": a ${t.element} ${formName(t.form)}, ${parts.join(', ')}`;
}

const shared = sharedGroups({ SHAPES, FRAMES, LOOKS });
playground({
  name: 'sprite',
  noun: 'sprite',
  draw: sprite,
  dataUri: spriteDataUri,
  randomSeed,
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
      // The nine palettes drawn for this sprite's form are named; the rest fold away by group.
      sections: PALETTE_GROUPS.map((g) => ({ label: groupLabel(g), values: g.palettes.map(String) })),
      othersLabel: 'Other colours',
      featured: (seed, options) => {
        const { element, form } = resolveTraits(seed, options);
        return palettesFor(element, form).map(String);
      },
    },
    shared.grid,
    shared.motion,
  ],
});
