/**
 * Writes the README banners into docs/banners/: one row of avatars for the
 * whole family (seedkin.svg) and one per style. Each avatar draws its own
 * background inside a rounded frame and the rest is transparent, so the
 * banners read on GitHub's light and dark themes alike. They animate, and
 * hold still for anyone who prefers reduced motion.
 * Usage: npm run banners
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { beastie } from '../src/styles/beastie/index.js';
import { botling } from '../src/styles/botling/index.js';
import { noggin } from '../src/styles/noggin/index.js';
import { snoot } from '../src/styles/snoot/index.js';
import { sprite } from '../src/styles/sprite/index.js';

type Draw = (seed: string, opts: { size: number; frame: 'rounded'; title: null; animate: true }) => string;

interface Style {
  draw: Draw;
  label: string;
  seeds: readonly string[];
}

const SIZE = 80;
const GAP = 14;

const STYLES: Record<string, Style> = {
  botling: {
    draw: botling,
    label: 'A row of Botling robot avatars',
    seeds: ['orbit', 'flux', 'yoyo', 'kelp', 'echo', 'bolt', 'hazel'],
  },
  snoot: {
    draw: snoot,
    label: 'A row of Snoot animal avatars',
    seeds: ['hex', 'echo', 'sol', 'cog', 'lumen', 'moss', 'gizmo'],
  },
  noggin: {
    draw: noggin,
    label: 'A row of Noggin people avatars',
    seeds: ['echo', 'cog', 'ada', 'tink', 'vex', 'yoyo', 'glimmer'],
  },
  beastie: {
    draw: beastie,
    label: 'A row of Beastie monster avatars',
    seeds: ['ada', 'hex', 'dot', 'zed', 'kit', 'orbit', 'bolt'],
  },
  sprite: {
    draw: sprite,
    label: 'A row of Sprite elemental spirit avatars',
    seeds: ['gizmo', 'bolt', 'dot', 'nova', 'milo', 'opal', 'tink'],
  },
};

/** The family banner: two of each style, interleaved, using each style's first seeds. */
const family: [Draw, string][] = [0, 1].flatMap((i) =>
  Object.values(STYLES).map((s): [Draw, string] => [s.draw, s.seeds[i] ?? '']),
);

/**
 * Lays avatars out in one row as a single SVG document.
 *
 * @param avatars - The draw function and seed of each avatar, left to right
 * @param label - The banner's accessible name
 * @returns The banner's SVG markup
 */
function row(avatars: readonly [Draw, string][], label: string): string {
  const width = avatars.length * SIZE + (avatars.length - 1) * GAP;
  const cells = avatars.map(([draw, seed], i) =>
    draw(seed, { size: SIZE, frame: 'rounded', title: null, animate: true }).replace('<svg ', `<svg x="${i * (SIZE + GAP)}" y="0" `),
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${SIZE}" width="${width}" height="${SIZE}" role="img" aria-label="${label}">${cells.join('')}</svg>\n`;
}

mkdirSync('docs/banners', { recursive: true });
writeFileSync(
  'docs/banners/seedkin.svg',
  row(family, 'Avatars from each Seedkin style: robots, animals, people, monsters and sprites'),
);
for (const [name, style] of Object.entries(STYLES)) {
  writeFileSync(
    `docs/banners/${name}.svg`,
    row(
      style.seeds.map((seed): [Draw, string] => [style.draw, seed]),
      style.label,
    ),
  );
}
console.log('wrote docs/banners/');
