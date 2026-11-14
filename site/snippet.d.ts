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
export function portraitOptions(
  state: Pick<PlaygroundState, 'palette' | 'motion'>,
  extra?: Record<string, unknown>,
): { animate?: boolean; holiday?: Holiday };
export function portraitSnippet(state: Pick<PlaygroundState, 'seed' | 'palette' | 'motion'>, name?: string): string;
