---
order: 1
public: true
---

# seedkin

Seeded pixel avatars as SVG, for any app that wants a friendly default picture
without storing one. MIT licensed, published to npm as `seedkin`, with one
entry point per style (`seedkin/botling` is the robots). The old `botling`
package is frozen at 1.2.0.

## Why it exists

BotCollector, Matt's toy-collecting site, needed a default avatar for the
many profiles with no photo. Existing generators either had a narrow
range (DiceBear's Pixelbot), a style Matt didn't want (Voxel Bot), licence
strings attached (CC BY sets) or privacy costs (Gravatar sends every viewer's
IP and is keyed by a guessable email hash). Botling, the robots, came first;
Seedkin grew it into a family. It renders locally, has no dependencies and is
MIT, art included.

## What it does

- Five styles, each its own entry point: Botling (robots), Snoot (animals),
  Noggin (people), Beastie (monsters) and Sprite (elemental spirits).
  `botling(seed, options)` returns an SVG string and `botlingDataUri()` the
  same as a `data:` URI; every style works the same way. Same seed, same
  avatar.
- Every style takes the same options: square, circle, triangle or diamond
  cells, looks from gapped to sticker (ADR 0010), frames (ADR 0007), and a palette or
  one of six holiday palettes (ADR 0015). Botling has 16 palettes,
  7 heads, 14 eyes, 11 mouths, 7 tops and 4 side pieces.
- Below 40px each style draws a simpler 9x9 version from the same traits, so
  24px avatars keep a face.
- `traits`, `grid`, `smallGrid`, `PALETTES` and the parts lists are exported for pickers.
- `animate: true` makes an avatar move (robots hover, blink and talk; sprites
  sway, wobble and drift), with CSS inside the SVG that holds still for reduced
  motion (ADR 0003, 0004, 0011).

## Where it is now

- Every style is Stable (ADR 0006, 0011, 0014): a seed keeps drawing the same
  avatar until 3.0. Until an app depends on Seedkin, plainly broken art may
  be fixed in a patch (ADR 0012).
- seedkin.dev has a playground and docs for each style.
- Next, BotCollector moves from `botling` 1.x to `seedkin` for its profiles'
  default avatars.
