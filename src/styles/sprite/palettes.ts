import type { Element, Form, Palette } from './types.js';

const p = (name: string, ...c: [string, string, string, string, string, string, string]): Palette => {
  const [bg, grid, body, shade, screen, glow, accent] = c;
  return { name, bg, grid, body, shade, screen, glow, accent };
};

/**
 * Sprite palettes, five or six per element. Screen is the bright core or
 * highlight, glow the face, accent the motes and cheeks.
 */
export const PALETTES: readonly Palette[] = Object.freeze([
  p('Ember', '#1d1210', '#2c1c18', '#ff7a2f', '#d9461f', '#ffd25e', '#2a0f05', '#ffb347'),
  p('Gas', '#0e1424', '#18213a', '#4f8cff', '#2f5fd6', '#bfe3ff', '#0b1430', '#8fd0ff'),
  p('Spark', '#1a0f1f', '#281830', '#ff4fa3', '#c92d7a', '#ffd0e8', '#2a0618', '#ffb3dc'),
  p('Candle', '#fbf3e6', '#f1e4cf', '#ffb02e', '#e07b12', '#fff1b8', '#3a1d00', '#ff6b3d'),
  p('Jade', '#0f1c18', '#182b25', '#3ddc97', '#22a571', '#d4ffe9', '#05140e', '#a8ffd6'),
  p('Lagoon', '#0f1b26', '#182a3a', '#3fa9f5', '#2177c4', '#d7f0ff', '#0b1a2c', '#8fd3ff'),
  p('Sea glass', '#eaf6f3', '#d8ece7', '#3fc1b0', '#239184', '#e6fffb', '#0d2a26', '#239184'),
  p('Ink', '#f2f0fa', '#e2def2', '#5b6cf0', '#3b48c4', '#dfe3ff', '#11143a', '#9aa5ff'),
  p('Deep', '#0b1030', '#151c45', '#2f6bff', '#1f47c2', '#c9dcff', '#050a24', '#5ce1ff'),
  p('Rain', '#e9eef5', '#d9e1ec', '#7fa7d9', '#5a83b8', '#eef5ff', '#16243a', '#5a83b8'),
  p('Clay', '#f4ede4', '#e7dccd', '#b07b4f', '#855630', '#f3dcbc', '#2a170a', '#4f9e33'),
  p('Stone', '#1a1c1a', '#272a27', '#8d958c', '#646b63', '#e4e9e2', '#121412', '#7ed957'),
  p('Moss', '#eef1e4', '#dfe4cf', '#6f9a4a', '#4f7433', '#cfe3b0', '#18240c', '#c98a3a'),
  p('Amethyst', '#17121f', '#241c30', '#a77bf0', '#7550c4', '#efe3ff', '#1a0f2e', '#ffd166'),
  p('Ruby', '#1d1014', '#2b1a20', '#e0455f', '#a82a40', '#ffd3dc', '#22070d', '#ffcf6b'),
  p('Quartz', '#eef2f6', '#dde4ec', '#bcd3ea', '#8faccb', '#ffffff', '#1b2a3a', '#f29bb8'),
  p('Breeze', '#dcecf7', '#cbe0ef', '#ffffff', '#a9c6dd', '#ffffff', '#2b3f55', '#6fa9d6'),
  p('Storm', '#1b2030', '#262d42', '#c9d3e6', '#8f9bb5', '#eef2fa', '#151a28', '#ffe066'),
  p('Gust', '#102320', '#1a332f', '#b8f2df', '#79c9ae', '#e9fff7', '#0b1f1a', '#5fe0b5'),
  p('Dusk', '#2a1f3d', '#382b50', '#f3d9ff', '#c9a3e6', '#fff4ff', '#241631', '#ffb3c7'),
  p('Sand', '#e6d5b3', '#dccaa5', '#fffaf0', '#c9ad7a', '#ffffff', '#4a3a1f', '#d8a24a'),
  p('Nebula', '#0d0b1f', '#1a1733', '#7b5cff', '#5236d1', '#fff3b0', '#0d0b1f', '#ff8fd1'),
  p('Void', '#05070f', '#121626', '#4f63a8', '#33437a', '#ffffff', '#e9ecff', '#ffd166'),
  p('Saturn', '#14101e', '#221b31', '#f2b56b', '#c9853b', '#fff1c9', '#2a1806', '#c3a6ff'),
  p('Comet', '#071a1f', '#0f2a31', '#5fd4e8', '#2fa3b8', '#e8fdff', '#03161b', '#fff3a3'),
  p('Mars', '#1a0e0c', '#2a1714', '#e0663f', '#a8442a', '#ffd6c4', '#1a0805', '#ffcf8a'),
  p('Toadstool', '#f3efe6', '#e6e0d2', '#e0453a', '#a82a24', '#fff6e6', '#2a0f0a', '#ff9e8a'),
  p('Chanterelle', '#1c1a12', '#2a271c', '#f2a93b', '#c47a1c', '#fff1cf', '#2a1a05', '#ffd27a'),
  p('Porcini', '#eef0e6', '#dfe2d3', '#9a6a43', '#6e4628', '#f6e9d2', '#24150a', '#7fbf5a'),
  p('Oak', '#eef3e6', '#dfe7d3', '#5fae4a', '#3d7f2f', '#8a5a36', '#13240c', '#e5533d'),
  p('Blossom', '#2a1d2a', '#382838', '#f5a3c7', '#d0709c', '#8a5a46', '#3a0f22', '#fff0f6'),
  p('Autumn', '#1d1712', '#2b231b', '#e8902f', '#b8621b', '#7a5236', '#2a1505', '#f2d04a'),
  p('Maple', '#fbeee2', '#f1ddca', '#e8573a', '#b23a22', '#ffd9c2', '#2a0d05', '#d9a441'),
  p('Sycamore', '#e8f2df', '#d7e6ca', '#6dbb4a', '#478a2e', '#e4f7d4', '#122408', '#e0b84a'),
  p('Ginkgo', '#1b1d14', '#292c1f', '#f4cf3b', '#c9a21c', '#fff6c6', '#2a2205', '#9ad16a'),
]);

/** The element each palette belongs to, and the forms it's kept for, if any; indexed like `PALETTES`. */
const SUITS: readonly (readonly [Element, ...Form[]])[] = [
  ['fire'],
  ['fire'],
  ['fire'],
  ['fire'],
  ['fire'],
  ['water'],
  ['water'],
  ['water'],
  ['water'],
  ['water'],
  ['earth', 'boulder'],
  ['earth', 'boulder'],
  ['earth', 'boulder'],
  ['earth', 'crystal'],
  ['earth', 'crystal'],
  ['earth', 'crystal'],
  ['wind', 'puff', 'tornado'],
  ['wind', 'puff', 'tornado'],
  ['wind', 'puff', 'tornado'],
  ['wind', 'puff', 'tornado'],
  ['wind', 'puff', 'tornado'],
  ['space'],
  ['space'],
  ['space'],
  ['space'],
  ['space'],
  ['earth', 'mushroom'],
  ['earth', 'mushroom'],
  ['earth', 'mushroom'],
  ['earth', 'tree'],
  ['earth', 'tree'],
  ['earth', 'tree'],
  ['wind', 'leaf'],
  ['wind', 'leaf'],
  ['wind', 'leaf'],
];

/**
 * The palettes a seed picks from for one form: its element's, less those
 * kept for the element's other form (gems for a crystal, stones for a boulder).
 *
 * @param element - The sprite's element
 * @param form - The sprite's form
 * @returns Indexes into `PALETTES`
 */
export function palettesFor(element: Element, form: Form): number[] {
  return SUITS.flatMap(([e, ...only], i) => (e === element && (only.length === 0 || only.includes(form)) ? [i] : []));
}
