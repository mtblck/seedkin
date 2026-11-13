import { type Colours, colourOf, type Pix } from './canvas.js';

/**
 * Renders layers (first at the back) to an SVG, merging each row's runs of
 * one colour into a single rect.
 *
 * @param layers - Canvases and their colours
 * @param px - Output pixels per cell
 */
export function toSvg(layers: { p: Pix; colours: Colours }[], px = 4): string {
  const { w, h } = layers[0]?.p ?? { w: 0, h: 0 };
  const rects: string[] = [];
  for (const { p, colours } of layers) {
    for (let y = 0; y < h; y++) {
      const fillAt = (x: number): string => {
        const m = p.get(x, y);
        return m === '' ? '' : colourOf(colours[m] ?? '#ff00ff', (p.tone[y] as number[])[x] as number);
      };
      let x = 0;
      while (x < w) {
        const fill = fillAt(x);
        let end = x + 1;
        while (end < w && fillAt(end) === fill) end++;
        if (fill !== '') rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${fill}"/>`);
        x = end;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * px}" height="${h * px}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}
