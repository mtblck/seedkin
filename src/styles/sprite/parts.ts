import type { Element, Eyes, Form, Mark, Mouth, Shape } from './types.js';

/** Every list a seed picks from. Changing one changes existing Sprites. */
export const ELEMENTS: readonly Element[] = Object.freeze(['fire', 'water', 'earth', 'wind', 'space']);
/** Each element's forms: three each, and four for earth. */
export const FORMS: Readonly<Record<Element, readonly Form[]>> = Object.freeze({
  fire: ['flame', 'wisp', 'ember'],
  water: ['drop', 'bubble', 'jelly'],
  earth: ['boulder', 'crystal', 'mushroom', 'tree'],
  wind: ['puff', 'tornado', 'leaf'],
  space: ['planet', 'star', 'comet'],
});
export const EYES: readonly Eyes[] = Object.freeze([
  'dots',
  'tiny',
  'round',
  'happy',
  'sleepy',
  'wink',
  'glance',
  'close',
]);
export const MOUTHS: readonly Mouth[] = Object.freeze(['none', 'dot', 'smile', 'grin', 'open', 'smirk', 'oh']);
export const MARKS: readonly Mark[] = Object.freeze(['none', 'dot', 'bar', 'chevron', 'plus', 'twin']);
/** Every cell shape. Sprites are drawn in squares unless asked otherwise. */
export const SHAPES: readonly Shape[] = Object.freeze(['square', 'circle', 'triangle', 'diamond']);
