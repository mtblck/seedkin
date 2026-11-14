// Types for snippet.js, so test/site.test.ts type-checks against the plain-JS site module.
import type { Holiday } from '../src/core/types.js';
import type { BotlingOptions, Palette } from '../src/index.js';

export interface PlaygroundState {
  seed: string;
  shape: string;
  /** A look other than 'gapped' goes into the options. */
  look?: string;
  /** A frame other than 'square' goes into the options. */
  frame?: string;
  palette: string;
  grid: string;
  /** 'on' animates the robot; anything else leaves it still. */
  motion?: string;
  /** A style's own option, such as Noggin's skin: 'auto' leaves it out. */
  [option: string]: string | undefined;
}
export function options(
  state: Omit<PlaygroundState, 'seed'>,
  extra?: BotlingOptions,
  holidays?: Readonly<Record<string, Palette>>,
): BotlingOptions;
export function snippet(state: PlaygroundState, name?: string): string;
/** What a portrait reads from the playground: the palette, motion and any of the style's own options. */
export interface PortraitState {
  palette: string;
  motion?: string;
  [option: string]: string | undefined;
}
export function portraitOptions(
  state: PortraitState,
  extra?: Record<string, unknown>,
): { animate?: boolean; holiday?: Holiday; palette?: number };
export function portraitSnippet(state: PortraitState & { seed: string }, name?: string): string;
