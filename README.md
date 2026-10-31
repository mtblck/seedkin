# Seedkin

A family of seeded pixel avatars, drawn as SVG on a grid of squares, circles, triangles or diamonds. Plant a seed (a user id, any string) and the same avatar sprouts every time.

There are five styles: **Botling** (robots), **Snoot** (animals), **Noggin** (people) and **Beastie** (monsters), all Stable, so a seed draws the same avatar in every 2.x release; and **Sprite** (elemental spirits), in Preview. Each style has its own entry point, such as `seedkin/botling`, so an app only ships the styles it uses.

> Coming from the `botling` package? Import from `'seedkin/botling'` instead of `'botling'`: every seed draws the same robot as `botling` 1.2.0.

# Botling

Seeded robot avatars. Try them at **[seedkin.dev](https://seedkin.dev/styles/botling/)**.

![Rows of botling robots in square, circle, triangle and diamond cells](docs/hero.svg)

- **Same seed, same robot.** Pass a user id and you get the same robot every time, on any machine, with no storage.
- **Four grids.** Every robot can be drawn with square, circle, triangle or diamond cells.
- **Reads at any size.** Below 40px it switches to a simpler version of the same robot, so a 24px avatar still has a face.
- **Small and self-contained.** Zero dependencies, returns an SVG string, no network requests, works in the browser, Node and edge runtimes.
- **MIT licensed**, art included.

> Stable since botling 1.0: the robot a seed draws only changes in a major version. See [Versioning](#versioning).

## Install

```sh
npm install seedkin
```

## Use

```ts
import { botling, botlingDataUri } from 'seedkin/botling';

// An SVG string, for inlining.
const svg = botling(user.id);

// A data: URI, for <img src> or CSS url().
const src = botlingDataUri(user.id, { size: 48 });
```

React:

```tsx
<img src={botlingDataUri(user.id, { size: 40, title: null })} alt="" width={40} height={40} />
```

Use an opaque, stable id as the seed (a database id or UUID), not an email address or username. The seed never appears in the SVG, but anyone can render the robot for a guessed email and compare.

The seed is used as given, apart from Unicode normalisation (NFC), so `José` draws the same robot however the é was typed. It isn't trimmed or lowercased: `Ada` and `ada` are different robots, so tidy the seed first if your ids vary like that.

### Random robots

`randomSeed()` returns a readable random seed, like `plucky-servo-427`, for a "give me a new robot" button or a default for someone without an id. Store the seed: that's what brings the same robot back.

```ts
import { botling, randomSeed } from 'seedkin/botling';

const seed = randomSeed(); // save this with the user
const svg = botling(seed);
```

There are 400,000 of these seeds, so two people can get the same one. To give every user their own robot, seed with their id. It uses `crypto.getRandomValues` where there is one (browsers, Node, edge runtimes) and `Math.random` otherwise, or pass your own source: `randomSeed(() => myRng())`.

### Options

| Option | Type | Default | What it does |
|---|---|---|---|
| `shape` | `'square' \| 'circle' \| 'triangle' \| 'diamond'` | picked by the seed | Cell shape. |
| `palette` | `number \| Palette` | picked by the seed | Index into `PALETTES` (0-15), or a palette object: one of `HOLIDAY_PALETTES`, or your own with hex colours. |
| `size` | `number` | `96` | Width and height in pixels. The SVG scales cleanly to any size. |
| `detail` | `'auto' \| 'full' \| 'small'` | `'auto'` | `'full'` is the detailed 15x15 robot. `'small'` is a simpler 9x9 robot from the same traits, with touching cells, made to read at 24px. `'auto'` draws `'small'` below 40px. |
| `showGrid` | `boolean \| 'auto'` | `'auto'` | Draw the empty grid cells. `'auto'` draws them from 40px up; below that they read as noise. The small robot never draws them. |
| `look` | `'gapped' \| 'flat' \| 'inked' \| 'soft' \| 'soft-inked' \| 'sticker'` | `'gapped'` | How the cells are drawn: apart, or merged into flat shapes. See [Looks](#looks). |
| `frame` | `'square' \| 'rounded' \| 'squircle' \| 'circle'` | `'square'` | The outline of the background. See [Frames](#frames). |
| `background` | `boolean` | `true` | Draw the palette's background. |
| `title` | `string \| null` | `'Robot avatar'` | Accessible name. `null` marks the image decorative (`aria-hidden`). |
| `animate` | `boolean` | `false` | The robot hovers, blinks and talks, its top piece wobbles, its ears twitch and a scanline sweeps its screen. Below 40px it only blinks and hovers. See [Animation](#animation). |

Bad options (an unknown shape, an out-of-range palette, a palette colour that isn't hex, a size of 0) throw a `RangeError` rather than drawing nothing.

### Frames

```ts
botling(user.id, { frame: 'circle' });
```

`frame` sets the outline of the background. Outside it the image is transparent, so a round avatar sits on any page colour without CSS.

- **`'square'`** (the default) fills the image, as every robot did before frames.
- **`'rounded'`** has corners a fifth of its width round. The robot keeps its size; the small robot can lose a sliver of a shoulder at the corners.
- **`'squircle'`** is a smooth app-icon curve. Wide shoulders reach into the corners it cuts, so the robot draws at 92% to fit, the same for every seed so a list of avatars lines up.
- **`'circle'`** crops the robot to a circle at full size. Shoulders run off the edge like a portrait, and so can the tips of the widest antennas and ears.

The grid behind the robot keeps only whole cells inside the frame, so its edge steps round the curve, and in a squircle it fills the room the smaller robot leaves. `FRAMES` lists the four, for a picker. A seed never picks a frame, so store the one a user chooses with their seed.

Every frame but `'square'` clips with a `<clipPath>`. Its id names the frame and its size (`botling-circle-500-16000`), so robots inlined on one page share identical clip paths instead of clashing. In an `<img>` or a `data:` URI each robot is its own document, so ids never meet.

### Looks

```ts
botling(user.id, { look: 'soft' });
```

`look` sets how the cells are drawn. The same seed draws the same picture in every look; only the drawing changes.

- **`'gapped'`** (the default) draws each cell apart, over a faint grid, like pixels on a display.
- **`'flat'`** closes the gap, so cells merge into solid shapes. Circles become touching beads, and diamonds and triangles tile into facets.
- **`'inked'`** is flat with a dark outline round the avatar and thin lines between colours, like a cel-shaded cartoon.
- **`'soft'`** rounds the outer corners of each patch of colour and curves its inner ones, so the avatar reads as vector shapes.
- **`'soft-inked'`** is soft with the dark outline.
- **`'sticker'`** is soft with a white die-cut border and a drop shadow. The avatar draws at 86% to make room for them.

Only `'gapped'` has a grid, so `showGrid` does nothing in the other looks. Rounded corners and the lines between colours need square cells: with circles, triangles or diamonds, `'soft'` draws like `'flat'`, and `'inked'` and `'sticker'` keep their outline and border. Small avatars, below 40px, already draw their cells touching, so there `'flat'` changes nothing and the other looks add their outline, corners or border. The ink is the palette's `shade` colour darkened. `LOOKS` lists the six, for a picker. A seed never picks a look, so store the one a user chooses with their seed. Every style takes `look`; animated robots keep their outline on their moving parts.

### Animation

```ts
botling(user.id, { animate: true });
```

`animate: true` adds a small CSS animation inside the SVG, so it moves wherever an SVG image does: inlined, in an `<img>`, as a CSS `url()` or a `data:` URI, with no script. Every robot moves:

- **Hover.** The whole robot bobs up and down over its background.
- **Blink.** Every 2 to 4.5 seconds, and about a third of robots blink twice. A lid in the face colour closes over the eye, so robots without a screen blink too. A wink blinks its open eye, an angry brow stays put, and sleepy eyes, already shut, don't blink.
- **Wobble.** The antenna or other top piece sways from its base and settles; twin antennas and horns sway as a mirrored pair.
- **Twitch.** Ears, handles and bolts hop up twice every 2 to 3 seconds, the right a beat after the left.
- **Talk.** The mouth squashes like a short sentence, then rests.
- **Scanline.** A glowing band sweeps down the screen every 3 to 5 seconds.

Below 40px the robot only blinks and hovers, since anything busier reads as flicker at 24px. Timing comes from the seed, so a page of robots doesn't move in unison.

- **Reduced motion.** It all sits inside `@media (prefers-reduced-motion: no-preference)`, so the robot holds still for anyone who has asked for less motion, and that still robot is the one drawn without `animate`. Motion that runs on its own for more than five seconds should also be stoppable from the page (WCAG 2.2.2), so offer a still option, as the playground does.
- **A strict CSP.** An inlined SVG's `<style>` counts as an inline style, so a page with `style-src 'self'` blocks it and shows the still robot. An `<img>` is its own document, so `botlingDataUri(id, { animate: true })` animates under any CSP that allows `data:` images.
- **Cost.** About 2.4 KB more per robot at full size (up to 4.5 KB with a big screen to scan), half a kilobyte below 40px. Each animated robot keeps its image repainting, so animate the few that matter (a profile, a hero, the current speaker) rather than a list of 50.

### Holiday palettes

`HOLIDAY_PALETTES` has New Year's, Valentine's, St Patrick's, Fourth of July, Halloween and Christmas. A seed never picks one, so everyday robots don't change; pass one in to dress the same robot up for the day:

```ts
import { botling, HOLIDAY_PALETTES } from 'seedkin/botling';

botling(user.id, { palette: HOLIDAY_PALETTES.halloween });
```

### Building a picker

Everything that goes into a robot is exported, so you can offer users a choice:

```ts
import { botling, PALETTES, SHAPES, traits } from 'seedkin/botling';

// Let someone choose a shape and palette for their own seed.
const options = SHAPES.flatMap((shape) => PALETTES.map((_, palette) => botling(user.id, { shape, palette, size: 48 })));

// Or show what a seed is made of.
traits(user.id); // { head: 'tv', eyes: 'visor', mouth: 'grille', top: 'antenna', ... }
```

Store the user's chosen `shape`, `palette`, `look` and `frame` next to their seed, and pass them back in. `LOOKS` and `FRAMES` list the looks and frames, as `SHAPES` lists the cells.

### Advanced

These are exported for drawing a robot some other way, such as onto a canvas or into a PNG (the playground's link preview does this). They follow the same versioning as the SVG: a seed's traits and grids only change in a major version.

| Export | What it is |
|---|---|
| `traits(seed)` | Every choice that makes up the seed's robot (`Traits`). |
| `resolveTraits(seed, options)` | `traits` with the `shape` and numeric `palette` options applied, checked the way `botling` checks them. |
| `grid(traits)` | The detailed robot as a 15x15 array of `Role` values, indexed `[row][column]`. |
| `smallGrid(traits)` | The simpler robot drawn below 40px, as a 9x9 array of `Role` values. |
| `Role` | What a cell is part of: `Empty` (0), `Body` (1), `Screen` (2), `Glow` (3), `Accent` (4), `Shade` (5). Each maps to the palette colour of the same name. Without a screen (`traits.hasScreen` false), paint `Glow` cells in the screen colour, as `botling` does. |
| `GRID_SIZE`, `SMALL_GRID_SIZE`, `CENTER` | 15, 9, and the detailed grid's centre column (7). |

The grids are the robot before it's drawn: cell shape, padding and animation are left to you.

## How it works

The seed is hashed (FNV-1a) into a small seeded generator (mulberry32), which picks a palette, head, eyes, mouth, top, side pieces, a few sizes and, now and then, a head marking, a one-sided quirk or an accessory. Those are drawn as roles (body, shade, screen, glow, accent) onto a 15x15 grid, mirrored down the centre column. Small avatars use a 9x9 grid drawn from the same traits. The renderer then draws each cell in the chosen shape and colours each role from the palette.

Today that's 16 palettes, 7 heads, 14 eyes, 11 mouths, 7 tops, 4 side pieces, 4 shapes, 3 head markings, 4 quirks, 4 accessories and a few size and on/off traits: tens of millions of distinct robots, before you count colour. Some parts are drawn for one cell shape: rounded and capsule heads become circles on circle cells, block eyes become rings, domes step by half a cell on triangles and cross eyes become chevrons.

An accessory takes the place of what it covers: headphones replace the top piece and sides, a bow or cap the top piece. A one-sided ear or antenna does the same, unless an accessory already has that spot.

## Versioning

The picture is the API. Within a major version, a seed with the same options always draws the same robot. Store a seed, shape and palette index, and you get the same robot through every 2.x release. The robots in `seedkin/botling` are the robots of `botling` 1.2.0, seed for seed ([ADR 0009](docs/adr/0009-seedkin-family.md)).

- **Major:** anything that changes an existing seed's robot, at any size: art, palette colours, the order or length of any parts list, the 40px switch, which parts move when animated, and the output of `traits`, `grid` and `smallGrid`.
- **Minor:** new holiday palettes, opt-in options and exports (seeds never pick them), smaller SVG markup that draws the same picture, and motion timing.

Don't compare or cache robots by their SVG string across versions; the markup can change while the picture stays put. [ADR 0006](docs/adr/0006-what-1-0-freezes.md) has the full list. Snapshot tests guard it.

Snoot, Noggin and Beastie follow the same rules from 2.4.0, when they left Preview ([ADR 0011](docs/adr/0011-every-style-stable.md)): a change to the animal, person or monster a seed draws is a major version. Until an app depends on Seedkin, art that is plainly broken is fixed in a patch ([ADR 0012](docs/adr/0012-fixing-broken-art-before-adoption.md)).

Sprite is a Preview style ([ADR 0013](docs/adr/0013-sprite.md)): until it's marked Stable, the Sprite a seed draws can change in a minor version.

# Snoot

Seeded animal avatars: cats, foxes, bears, bunnies, mice, dogs, pandas, owls, frogs and pigs. Try them at **[seedkin.dev](https://seedkin.dev/styles/snoot/)**.

```ts
import { snoot, snootDataUri } from 'seedkin/snoot';

const svg = snoot(user.id);
const src = snootDataUri(user.id, { size: 40 });
```

`snoot()` takes the same options as `botling()`: `shape`, `palette` (an index into Snoot's own twelve `PALETTES`, or a palette object), `size`, `detail`, `showGrid`, `look`, `frame`, `background`, `animate` and `title` (default `'Animal avatar'`). Below 40px it draws a simpler 9x9 Snoot from the same traits, keeping the species' ears, the eyes, muzzle, markings and cheeks.

With `animate: true` a Snoot hovers, blinks and twitches its ears (sleepy Snoots keep their eyes shut). Below 40px it only blinks and hovers. It works as Botling's [animation](#animation) does: CSS inside the SVG, still for anyone who prefers reduced motion, and still at rest.

The seed is salted, so `snoot(id)` and `botling(id)` are unrelated: one user's robot and animal don't share colours or features. `traits`, `resolveTraits`, `grid`, `smallGrid`, `SPECIES`, `EYES`, `MARKINGS`, `EXTRAS`, `MOUTHS` and `SHAPES` are exported as for Botling.

# Noggin

Seeded people avatars in seven skin tones, with twelve hairstyles (including afros and locs), glasses, beards, hats and headscarves. Try them at **[seedkin.dev](https://seedkin.dev/styles/noggin/)**.

```ts
import { noggin, nogginDataUri } from 'seedkin/noggin';

const svg = noggin(user.id);
const src = nogginDataUri(user.id, { size: 40, skin: 4 });
```

`noggin()` takes the same options as `snoot()`, plus `skin`, an index into `SKIN_TONES` (lightest first), so people can pick their own. `palette` picks one of the six outfits in `PALETTES`, or takes a whole palette object; `title` defaults to `'Person avatar'`. A seed's hair colour and outfit always stand out from its skin; pick another skin tone and they move to the next colours that do. Below 40px it draws a simpler 9x9 Noggin from the same traits.

With `animate: true` a Noggin hovers, blinks and talks. Closed eyes and shades don't blink and beards don't talk. Below 40px it only blinks and hovers.

`traits`, `resolveTraits`, `grid`, `smallGrid`, `paletteFor`, `SKIN_TONES`, `HAIR_COLOURS`, `HAIRS`, `EYES`, `MOUTHS`, `FACIAL`, `EYEWEAR`, `HEADWEAR` and `SHAPES` are exported as for Botling.

# Beastie

Seeded monster avatars: blobs, ghosts, boxes, tall and wide bodies with one to three eyes, fangs, horns and wings. Try them at **[seedkin.dev](https://seedkin.dev/styles/beastie/)**.

```ts
import { beastie, beastieDataUri } from 'seedkin/beastie';

const svg = beastie(user.id);
const src = beastieDataUri(user.id, { size: 40 });
```

`beastie()` takes the same options as `snoot()`, `animate` included: `shape`, `palette` (an index into Beastie's own eight `PALETTES`, or a palette object), `size`, `detail`, `showGrid`, `look`, `frame`, `background` and `title` (default `'Monster avatar'`). Below 40px it draws a simpler 9x9 Beastie from the same traits, keeping the body, eyes, mouth, top and sides.

With `animate: true` a Beastie hovers, blinks and talks, its horns or antennae wobble and its arms or wings twitch. Below 40px it only blinks and hovers.

The seed is salted, so one id's Botling, Snoot and Beastie are unrelated. `traits`, `resolveTraits`, `grid`, `smallGrid`, `BODIES`, `EYES`, `MOUTHS`, `TOPS`, `SIDES` and `SHAPES` are exported as for Botling.

# Sprite

Seeded avatars of little elemental spirits: flames, wisps and embers, drops, bubbles and jellyfish, boulders, gems, mushrooms and trees, clouds, whirlwinds and leaves, planets, stars and comets, each with a face. Try them at **[seedkin.dev](https://seedkin.dev/styles/sprite/)**. Sprite is a Preview style.

```ts
import { sprite, spriteDataUri } from 'seedkin/sprite';

const svg = sprite(user.id);
const src = spriteDataUri(user.id, { size: 40 });
const team = sprite(user.id, { element: 'fire' }); // the seed still picks the rest
```

A seed picks one of five `ELEMENTS` (fire, water, earth, wind, space), one of that element's `FORMS` (three each, four for earth), one of its palettes, `EYES`, a mouth from `MOUTHS`, sometimes cheeks, a forehead mark from `MARKS` (none, dot, bar, chevron, plus or twin dots; it's left off where it wouldn't fit), and which way it faces. `sprite()` takes the same options as `snoot()` plus `element`; `shape` defaults to `'square'` rather than being picked by the seed, and `title` defaults to `'Sprite avatar'`. Below 40px it draws a simpler 9x9 Sprite from the same traits.

With `animate: true` a Sprite flips through four frames: a flame's tip sways, a drop wobbles, a gem glints and the motes around it drift, at every size. The seed is salted after it (`user-1:sprite`), so ids that differ only in their last character still draw different Sprites. `traits`, `resolveTraits`, `grid` and `smallGrid` (both take a frame, 0 to 3), `FRAME_COUNT`, `PALETTES`, `PALETTE_GROUPS` (which forms wear which palettes, as `{ element, forms, palettes }`) and `palettesFor(element, form)` are exported too.

# Developing

```sh
npm install
npm test          # vitest
npm run lint      # biome
npm run typecheck
npm run build     # tsc to dist/
npm run preview   # writes preview.html: a contact sheet at 24, 32, 48 and 96px
npm run site      # builds the playground site into dist-site/
npm run serve     # serves it on localhost:4173 with the production headers
npm run hosting:check  # fails if the CSP or security headers regress
```

Look at `preview.html` for any art change, at 24px especially.

# Support

Seedkin is free and MIT licensed. If it's useful to you, you can [buy me a coffee on Ko-fi](https://ko-fi.com/mtblck) or [sponsor on GitHub](https://github.com/sponsors/mtblck).

# License

[MIT](LICENSE)
