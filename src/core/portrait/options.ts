import type { Holiday } from '../types.js';
import { HOLIDAYS } from './scene.js';

/** Options for a style's `portrait()` and `duet()`. */
export interface PortraitOptions {
  /**
   * Height in pixels; a portrait is square and a duet twice as wide. The
   * picture is 64 cells tall, so multiples of 64 keep its cells crisp.
   * Default 256.
   */
  size?: number;
  /**
   * Move as the avatar does (blinks, talks, wobbles, a Sprite's sway) with a
   * small CSS animation inside the SVG, in step with the same seed's avatar.
   * It holds still for anyone who prefers reduced motion. Default false.
   */
  animate?: boolean;
  /** Dress for a holiday: its palette, and its scene behind. */
  holiday?: Holiday;
  /** Accessible name; `null` marks the image decorative. */
  title?: string | null;
}

/** {@link PortraitOptions} checked and settled for one render. */
export interface PortraitSettled {
  /** Output pixels per cell. */
  px: number;
  animate: boolean;
  holiday: Holiday | undefined;
  title: string | null;
}

/**
 * Checks portrait options, throwing a `RangeError` named for the style rather
 * than drawing nothing.
 *
 * @param style - The style's name, for error messages
 * @param opts - Caller options
 * @param title - The accessible name when the caller gives none
 * @returns Scale, motion, holiday and title to draw with
 */
export function settlePortrait(style: string, opts: PortraitOptions, title: string): PortraitSettled {
  const size = opts.size ?? 256;
  if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0) {
    throw new RangeError(`${style}: size must be a positive, finite number`);
  }
  if (opts.animate !== undefined && typeof opts.animate !== 'boolean') {
    throw new RangeError(`${style}: animate must be true or false`);
  }
  if (opts.holiday !== undefined && !HOLIDAYS.includes(opts.holiday)) {
    throw new RangeError(`${style}: unknown holiday "${String(opts.holiday)}"`);
  }
  if (opts.title !== undefined && opts.title !== null && typeof opts.title !== 'string') {
    throw new RangeError(`${style}: title must be a string or null`);
  }
  return {
    px: size / 64,
    animate: opts.animate === true,
    holiday: opts.holiday,
    title: opts.title === undefined ? title : opts.title,
  };
}
