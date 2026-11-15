/** Mixes two #rrggbb colours; t=0 is a, t=1 is b. */
export function mix(a: string, b: string, t: number): string {
  const ch = (h: string, i: number): number => Number.parseInt(h.slice(i, i + 2), 16);
  const out = [1, 3, 5].map((i) => Math.round(ch(a, i) * (1 - t) + ch(b, i) * t));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** The colour a cell paints with: warm purple shadows and lines, cream light. */
export function colourOf(base: string, tone: number): string {
  if (tone <= -2) return mix(base, '#160c18', 0.62);
  if (tone < 0) return mix(base, '#2a1530', 0.24);
  if (tone > 0) return mix(base, '#fff2d8', 0.2);
  return base;
}
