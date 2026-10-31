// The playground's Random pick across option groups, kept pure so test/site.test.ts can check it.

/**
 * Picks one value across groups (such as everyday and holiday palettes). Each group is as
 * likely as its share of all the choices, then its value comes from `from`, which may be
 * narrower than `all` (Sprite's nine palettes for the form), so a narrowed group keeps its share.
 *
 * @param {{ all: string[], from: string[] }[]} groups - Each group's choices, and those to pick from
 * @param {() => number} [random] - A number in [0, 1), Math.random by default
 * @returns {string | undefined} The value, or undefined when there are no choices
 */
export function pickAcross(groups, random = Math.random) {
  const total = groups.reduce((n, g) => n + g.all.length, 0);
  let r = random() * total;
  for (const g of groups) {
    if (r < g.all.length && g.from.length) return g.from[Math.floor(random() * g.from.length)];
    r -= g.all.length;
  }
  return undefined;
}
