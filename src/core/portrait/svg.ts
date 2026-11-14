import { escapeXml } from '../render/svg.js';
import { type Colours, colourOf, type Pix } from './canvas.js';

/** A canvas to draw, its colours, and (for a figure) the classes its moving parts take. */
export interface Layer {
  p: Pix;
  colours: Colours;
  /** Part name to class; parts without one hold still. */
  cls?: Record<string, string>;
  /** Moving parts drawn beneath the still ones rather than over them. */
  behind?: readonly string[];
  /** Classes around the whole layer, outermost first, each its own group. */
  wrap?: string[];
  /** Cells to shift right. */
  dx?: number;
}

/** One row's runs of one colour as rects; cells whose colour is `''` are left out. */
function runs(w: number, y: number, colourAt: (x: number) => string, dx: number): string {
  let out = '';
  let x = 0;
  while (x < w) {
    const fill = colourAt(x);
    let end = x + 1;
    while (end < w && colourAt(end) === fill) end++;
    if (fill !== '') out += `<rect x="${x + dx}" y="${y}" width="${end - x}" height="1" fill="${fill}"/>`;
    x = end;
  }
  return out;
}

/**
 * Renders layers (first at the back) to an SVG, merging each row's runs of
 * one colour into a single rect. A figure's moving parts each get a group
 * with their class; what they cover is drawn beneath, so a blink or a talk
 * uncovers fur or hide, not the scene.
 *
 * @param layers - Canvases and their colours
 * @param px - Output pixels per cell
 * @param style - CSS for the classes, wrapped so it only runs when motion is welcome
 * @param always - CSS that applies either way
 * @param title - Accessible name; `null` marks the image decorative
 */
export function toSvg(layers: Layer[], px = 4, style = '', always = '', title: string | null = null): string {
  const w = Math.max(...layers.map((l) => l.p.w + (l.dx ?? 0)));
  const h = layers[0]?.p.h ?? 0;
  let body = '';
  for (const { p, colours, cls = {}, behind = [], wrap = [], dx = 0 } of layers) {
    const colour = (x: number, y: number): string => {
      const m = p.get(x, y);
      return m === '' ? '' : colourOf(colours[m] ?? '#ff00ff', (p.tone[y] as number[])[x] as number);
    };
    const moving = (x: number, y: number): string => {
      const part = (p.part[y] as string[])[x] as string;
      return part !== '' && cls[part] !== undefined && p.get(x, y) !== '' ? part : '';
    };
    let still = '';
    for (let y = 0; y < h; y++)
      still += runs(
        p.w,
        y,
        (x) => {
          if (moving(x, y) === '') return colour(x, y);
          const lid = (p.lid[y] as ([string, number] | null)[])[x];
          return lid ? colourOf(colours[lid[0]] ?? '#ff00ff', lid[1]) : '';
        },
        dx,
      );
    let parts = '';
    let back = '';
    for (const [part, c] of Object.entries(cls)) {
      let rects = '';
      for (let y = 0; y < h; y++) rects += runs(p.w, y, (x) => (moving(x, y) === part ? colour(x, y) : ''), dx);
      if (!rects) continue;
      if (behind.includes(part)) back += `<g class="${c}">${rects}</g>`;
      else parts += `<g class="${c}">${rects}</g>`;
    }
    body += wrap.filter(Boolean).reduceRight((inner, c) => `<g class="${c}">${inner}</g>`, back + still + parts);
  }
  const a11y = title === null ? 'aria-hidden="true"' : `role="img" aria-label="${escapeXml(title)}"`;
  const motion = style ? `@media (prefers-reduced-motion:no-preference){${style}}` : '';
  const css = motion || always ? `<style>${always}${motion}</style>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * px}" height="${h * px}" shape-rendering="crispEdges" ${a11y}>${css}${body}</svg>`;
}
