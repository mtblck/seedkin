import { createRng, pick } from '../../core/random.js';
import { palettesFor } from './palettes.js';
import { ELEMENTS, EYES, FORMS, MOUTHS } from './parts.js';
import type { Element, SpriteTraits } from './types.js';

/**
 * Picks every trait for a seed. The salt goes after the seed, unlike the
 * other styles, so seeds that differ only in their last character (`user-1`,
 * `user-2`) still hash far apart.
 *
 * @param seed - Any string, such as a user id
 * @param element - The element, if the caller picks it
 * @returns The Sprite's traits
 */
export function traits(seed: string, element?: Element): SpriteTraits {
  const rng = createRng(`${String(seed)}:sprite`);
  // Draw order is part of the picture: once Sprite is stable, don't reorder these lines.
  const picked = pick(rng, ELEMENTS);
  const el = element ?? picked;
  const form = pick(rng, FORMS[el]);
  const palette = pick(rng, palettesFor(el, form));
  const eyes = pick(rng, EYES);
  const mouth = pick(rng, MOUTHS);
  const hasBlush = rng() < 0.5;
  const base = 150 + Math.floor(rng() * 90);
  const beats = [0, 1, 2, 3].map(() => base + Math.floor(rng() * 80));
  const isMirrored = rng() < 0.5;
  return { element: el, form, palette, eyes, mouth, hasBlush, isMirrored, beats, shape: 'square' };
}
