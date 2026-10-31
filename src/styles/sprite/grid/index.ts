import type { Form as FormName, RoleGrid, SpriteTraits } from '../types.js';
import type { Canvas, Form } from './draw.js';
import { EARTH } from './earth.js';
import { paintFace } from './face.js';
import { FIRE } from './fire.js';
import { paintMark } from './mark.js';
import { SPACE } from './space.js';
import { WATER } from './water.js';
import { WIND } from './wind.js';

export { CENTER, GRID_SIZE, SMALL_GRID_SIZE } from '../../../core/canvas.js';

/** The animation frames every form has. */
export const FRAME_COUNT = 4;

const DRAWERS: Readonly<Record<FormName, Form>> = { ...FIRE, ...WATER, ...EARTH, ...WIND, ...SPACE };

/**
 * Draws one frame of a Sprite, face and all.
 *
 * @param t - The Sprite's traits
 * @param frame - The animation frame, 0 to 3; 0 is the still picture
 * @param small - Draw the simpler 9x9 Sprite
 * @returns The drawn canvas
 */
export function drawFrame(t: SpriteTraits, frame: number, small: boolean): Canvas {
  const form = DRAWERS[t.form];
  const draw = small ? form.small : form.full;
  const { c, at } = draw(frame);
  paintFace(c, at, t, small);
  paintMark(c, at, t.mark, [0, 1, 2, 3].map(draw), small);
  if (t.isMirrored) for (const row of c.cells) row.reverse();
  return c;
}

/**
 * Builds the detailed Sprite as a 15x15 grid of roles.
 *
 * @param t - The Sprite's traits
 * @param frame - The animation frame, 0 to 3. Default 0, the still picture
 * @returns A grid of roles, indexed `[row][column]`
 */
export function grid(t: SpriteTraits, frame = 0): RoleGrid {
  return drawFrame(t, frame, false).cells;
}

/**
 * Builds the simpler 9x9 Sprite drawn below 40px.
 *
 * @param t - The Sprite's traits
 * @param frame - The animation frame, 0 to 3. Default 0, the still picture
 * @returns A grid of roles, indexed `[row][column]`
 */
export function smallGrid(t: SpriteTraits, frame = 0): RoleGrid {
  return drawFrame(t, frame, true).cells;
}
