# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/) with the output rule in the README:
any change to the robot a seed draws is a major version.

## [Unreleased]

### Site

- Each style's docs page shows its status next to its name: Stable for Botling, Snoot, Noggin and Beastie, Preview for Sprite.
- The display font is now Silkscreen, a capitals-only pixel font that stays readable at small sizes, in place of Pixelify Sans, whose lowercase e was hard to read. One 8 kB file instead of 23 kB.

## [2.5.0] - 2026-10-31

### Added

- `seedkin/sprite`, the Sprites: seeded avatars of little elemental spirits. A seed picks one of five elements (fire, water, earth, wind and space), one of its two forms (flame or wisp, drop or blob, boulder or gem, puff or funnel, planet or star), one of 26 palettes kept to its element, one of six eye styles, a mouth, sometimes cheeks, and which way it faces. `sprite()` and `spriteDataUri()` take the same options as `snoot()` plus `element`, which picks the element and leaves the rest to the seed. Below 40px it draws a simpler 9x9 Sprite. With `animate: true` it flips through four frames: flames sway, drops wobble, and embers, bubbles and stars drift, at every size, still for anyone who prefers reduced motion. Sprite is a Preview style (ADR 0013): the Sprite a seed draws can change in a minor version until it's marked Stable. No other style changes.

### Site

- A Sprite playground at `/styles/sprite/`, with an Element picker, and a Sprite page in the docs. The home page shows your seed in all five styles, three over two, and the family cards sit three over two, with Sprite marked Preview.
- The About page has room between its last cards and the footer.

- seedkin.dev has a `sitemap.xml`, a `robots.txt` and an `llms.txt` for AI assistants, all built from the pages themselves; JSON-LD on the home page; and its own link preview image for each style page.
- The home page has an Animate button again, next to Random, which sets every style moving, and a shorter seed box. Each style card shows its Stable badge in its top right corner.
- Every playground has a Motion toggle, and its GIF download moves for every style. Snoot, Noggin and Beastie are marked Stable across the site, and each style's options table lists `animate`.
- Search the site from the header (or press `/`): docs, styles and pages, matched as you type, built into `search.json` at build time.
- Code samples are syntax highlighted at build time, in both themes, and the playground's code as it changes. The site still loads no highlighter library.

## [2.4.3] - 2026-10-31

### Fixed

- An animated avatar in the `'sticker'` look no longer shows a grey smear where a moving part sits at the edge, such as a Noggin's mouth on its chin. Each moving part's shadow fell on top of the body's white border; every shadow now sits beneath every border, as in the still picture.

## [2.4.2] - 2026-10-31

### Fixed

- Noggin mouths sit a row lower, so an eye never runs into the mouth (about a quarter of Noggins, such as a wink beside a smile). Narrow heads have a five-cell chin like wide ones, so a mouth on it never cuts the head from the neck; the `'smirk'` mouth is now a small V, a narrower smile, instead of dropping one corner, and a wink sits level with the open eye, drawn out to the side. This changes the still face of every Noggin, which is normally a major change; it is a fix to broken art, made in a patch while nobody depends on the faces yet.
- An animated robot whose mouth runs into an eye now blinks that part of the mouth with the eye, so the two never move apart. Still robots are unchanged.
- Blinks and talks no longer uncover a body-coloured lid where nothing was drawn behind, as above a Beastie's eye stalks; a squash now shows what was really underneath. Beastie stalks hold still and only the eyes on them blink. Still pictures are unchanged.

## [2.4.1] - 2026-10-31

### Fixed

- An animated Noggin no longer moves part of an eye when it talks. When a smile or smirk's corner lands on a tall, winking or closed eye (about a quarter of Noggins), that cell now blinks with the eye instead of talking with the mouth. Still Noggins are unchanged.
- The same fix for Botling, where a mouth drawn over an eye (about a quarter of robots, such as a cyclops with a grin) made talking move part of the eye. Which parts move is normally frozen within a major version (ADR 0006); this is a bug fix, made in a patch while nobody depends on the motion yet. Every still robot is unchanged.
- The `'soft'`, `'soft-inked'` and `'sticker'` looks no longer draw hairline seams or a pinwheel of colours where three or four colours meet, as around some Beastie eyes. Those corners now stay square; corners between two colours round as before.

## [2.4.0] - 2026-10-31

### Added

- `animate` for Snoot, Noggin and Beastie, as for Botling: CSS inside the SVG, still for anyone who prefers reduced motion, and still at rest. Snoots hover, blink and twitch their ears; Noggins hover, blink and talk; Beasties hover, blink and talk, and their horns or antennae wobble and their arms or wings twitch. Below 40px every style only blinks and hovers. Botling's output is unchanged.
- Snoot's `MOUTHS` and `Mouth` exports.

### Changed

- Snoot, Noggin and Beastie are Stable (ADR 0011): from 2.4.0 the avatar a seed draws only changes in a major version, as for Botling, and a golden corpus guards each style.
- Snoot has more variety before it freezes, so most seeds draw a different Snoot than in 2.3.0: four more coats (Rose, Sky, Sand and Midnight, twelve in all), a mouth (a smile, a tongue or open), likelier markings, extras and cheeks, and more distinct faces below 40px (taller heads, shining and happy eyes, whiskers). Seeds that draw the same Snoot as another fall from 7.5% to 1.4% at full size and from 20% to 5.7% at 24px.

## [2.3.0] - 2026-10-31

### Added

- A `look` option for every style: `'gapped'` (the default, unchanged), `'flat'` (no gap, so cells merge into solid shapes), `'inked'` (flat with a dark outline and lines between colours), `'soft'` (rounded, vector-like shapes), `'soft-inked'` and `'sticker'` (a white border and a drop shadow). `LOOKS` lists them. A seed draws the same picture in every look, and no existing output changes (ADR 0010).

### Site

- Every playground has a Look picker, and the copied code includes the look.
- The docs are now thirteen pages with a sidebar, an "On this page" list, previous and next links and an edit link: an introduction, guides for React, Vue, Svelte, plain HTML, serving avatars from a server and using them as a profile photo fallback, a page per style, How it works and Versioning. Old `/docs/#section` links go to the section's new page.
- Every style page is built from one template (`scripts/styles.mjs`): the playground, then usage tabs (ESM, React, HTML, server), a details list with the entry point, status, gzipped size measured at build and the parts counted from the package, the style's options table, and links to the previous and next style. The Styles page links each style's playground and docs.
- New `/changelog/` page, built from `CHANGELOG.md` at build time, a `/privacy/` page saying what the site counts and what the library sends (nothing), and a `/licences/` page with the font and icon credits. The footer links all three.

## [2.2.0] - 2026-10-31

### Added

- `seedkin/beastie`, the Beasties: seeded monster avatars (blobs, ghosts, boxes, tall and wide bodies with one to three eyes, eyes on stalks, fangs, horns, antennae, arms and wings) in eight hides, with `beastie()`, `beastieDataUri()` and the same options as `snoot()`. Below 40px it draws a simpler 9x9 Beastie from the same traits. Beastie is a Preview style: the Beastie a seed draws can change in a minor version until it's marked stable (ADR 0009). Botling and Snoot are unchanged.
- `seedkin/noggin`, the Noggins: seeded people avatars in seven skin tones, with twelve hairstyles (including afros and locs), glasses, beards, hats and headscarves, in six outfits. `noggin()` and `nogginDataUri()` take the same options as `snoot()` plus `skin`, so people can pick their own skin tone; hair and outfit always stand out from the skin. Below 40px it draws a simpler 9x9 Noggin. Noggin is a Preview style.

### Site

- seedkin.dev has a fuller header (Playground, Styles, Docs, About) that folds into a menu on phones, a footer with Explore, Docs, Project and Versions columns, and a 404 page.
- The landing page gains calls to action, an at-a-glance strip with figures measured at build time, mock-ups of comments, a leaderboard and a team list drawn with real avatars, and a Why Seedkin grid.
- New `/about/` page: the four promises, how Seedkin compares with similar libraries, and the Grid's backstory.
- Every code sample has a Copy button, and install commands have npm, pnpm, yarn and bun tabs.
- The playground is one shared page layout (`site/playground.js`) for every style: the options sit beside the avatar, which stays in view while they change (pinned in a compact bar on phones), with the code and downloads under it, tabs between styles, a Reset button, and a gallery that redraws with the options on screen. Snoot gains PNG, JPG and GIF downloads.
- Beastie and Noggin get playgrounds at `/styles/beastie/` and `/styles/noggin/` (Noggin with a skin tone picker), and the landing and Styles pages draw both from the package. No lab styles are left on the site.

## [2.1.0] - 2026-10-31

### Added

- `seedkin/snoot`, the Snoots: seeded animal avatars (cats, foxes, bears, bunnies, mice, dogs, pandas, owls, frogs and pigs) in eight coats, with `snoot()`, `snootDataUri()` and the same options as `botling()` bar `animate`. Below 40px it draws a simpler 9x9 Snoot from the same traits. Snoot is a Preview style: the Snoot a seed draws can change in a minor version until it's marked stable (ADR 0009). Botling is unchanged.
- seedkin.dev has a Snoot playground at `/styles/snoot/`, and the landing and Styles pages draw Snoots from the package.

## [2.0.0] - 2026-10-31

The first release of `seedkin`. It carries on from `botling` 1.2.0, the last release under that name, so its versions start at 2.0.0; everything below this is `botling`.

### Changed

- **Breaking:** the package is now `seedkin`, a family of avatar styles, and the robots are its first style, Botling. Import them from `seedkin/botling`, which exports everything `botling` did and draws every seed exactly as `botling` 1.2.0 does. The root `seedkin` export holds what every style shares: `randomSeed`, `FRAMES`, `Role`, the grid sizes and the shared types. See ADR 0009.

### Added

- The site moves to seedkin.dev and grows from one playground into a family site: a landing page that grows your seed in every style, a Styles page, the Botling playground at `/styles/botling/` under "Meet the Botlings", and the docs at `/docs/`. Snoots, Noggins and Beasties show there as previews; they aren't in the package yet. botling.me redirects to the Botling playground.
- The playground downloads the robot as SVG, PNG, JPG or GIF. PNG and JPG are the still robot at 512px (JPG puts white behind a rounded frame's corners); the GIF is 256px and, with Motion on, one seamless loop of the animation. The package itself is unchanged.

## [1.2.0] - 2026-10-30

### Added

- A `frame` option draws the background as a `'square'` (the default, unchanged), `'rounded'`, `'squircle'` or `'circle'`, with transparent corners. A circle crops the robot, a squircle draws it at 92% so wide shoulders fit, and the grid keeps only the whole cells inside the frame. `FRAMES` lists them. Without `frame`, every robot draws exactly as before.
- The playground has a Frame control, and its robots now show the frame they're drawn with instead of a rounded corner added by the page.

## [1.1.0] - 2026-10-30

### Added

- `randomSeed()` returns a readable random seed, like `plucky-servo-427`, to store and draw a robot from. It uses `crypto.getRandomValues` where available and takes an optional source of randomness. No existing seed's robot changes.
- The playground's Random button and its gallery of robots use it; the words are the same, and the number now runs to 999.

## [1.0.0] - 2026-10-30

The robot each seed draws is now frozen for the whole of 1.x: the same seed and options draw the same picture until 2.0. [ADR 0006](https://github.com/mtblck/seedkin/blob/main/docs/adr/0006-what-1-0-freezes.md) lists what is frozen and what a minor version may still change, and a golden corpus of 500 seeds checks it on every change.

### Changed

- Seeds are normalised to Unicode NFC before hashing, so an accented letter draws the same robot whether it was typed as one character or as a letter plus a combining accent. ASCII seeds, and any seed already in NFC (what keyboards normally produce), keep their robot.
- Three palettes stand out more from their tiles, chosen side by side before 1.0: Night shift and Lemon have a stronger head edge, ears and neck, and Indigo's body is lighter, which also lifts the face on robots without a screen. This recolours robots in those palettes, about 19% of seeds.
- `HEADS`, `EYES` and the other parts lists are frozen at runtime, like `PALETTES`, so an app can't change them and redraw every robot.

### Added

- ADR 0006 and a README Versioning section: what 1.0 freezes, and what a minor version may still change.
- README: an Advanced section documenting `resolveTraits`, `grid`, `smallGrid`, `Role` and the grid sizes, and a note on how seeds are used.
- A contrast test holds every built-in and holiday palette to the weakest pair kept at 1.0.
- A golden corpus test pins 500 seeds in every shape, at full and small size, still and animated.

### Fixed

- README: the palette index runs from 0 to 15, not 0 to 11.

## [0.2.0] - 2026-10-29

### Added

- `animate: true`: the robot hovers, blinks (sometimes twice) and talks, its top piece wobbles, its ears, handles and bolts twitch, and a scanline sweeps its screen. Below 40px it only blinks and hovers. It's CSS inside the SVG, so it works as an `<img>` or `data:` URI, and it holds still for `prefers-reduced-motion`. Off by default.
- The playground has a Motion toggle.

### Changed

- On the tallest heads the antenna (and the off-side antenna quirk) is one cell shorter, so its tip no longer sits on the tile's top edge. This redraws the antenna for about 6% of seeds.
- A robot without shoulders is centred top to bottom, to the row (to two rows on triangle cells, which flip every row). Short robots used to sit high in their tile; about 20% of seeds move down, or now and then up, by a cell or two.

## [0.1.0] - 2026-10-29

First release.

### Added

- `botling(seed, options)` renders a seeded robot as an SVG string.
- `botlingDataUri(seed, options)` returns the same SVG as a `data:` URI.
- Square, circle, triangle and diamond cell grids.
- 16 palettes (four of them two-tone), 7 heads, 14 eyes, 11 mouths, 7 tops and 4 side pieces.
- Expressions: happy, winking, angry and surprised eyes; frown, grin and zigzag mouths.
- Now and then a head marking (forehead stripe, rivets, chin panel), a one-sided quirk (one ear, a dent, a patch, an off-centre antenna), an accessory (headphones, visor band, bow, cap) or a chest light. `PATTERNS`, `QUIRKS` and `ACCESSORIES` list them.
- Parts drawn for a cell shape: round heads and ring eyes on circles, stepped domes and chevron eyes on triangles.
- `traits`, `grid`, `resolveTraits` and the part lists for building pickers.
- `showGrid: 'auto'` hides the empty grid below 40px.
- `HOLIDAY_PALETTES` (New Year's, Valentine's, St Patrick's, Fourth of July, Halloween, Christmas), and `palette` accepts a palette object as well as an index. Seeds never pick a holiday palette.
- `detail` option and `smallGrid()`: below 40px (`detail: 'auto'`), a simpler 9x9 robot from the same traits with touching cells, so 24px avatars stay readable.
- Compact output: each colour is one `<path>`, so a 96px robot with the grid is about 2-7 KB and a 24px one under 2.5 KB.
- Requires Node 22 or newer (Node 20 reached end of life in April 2026).

The playground site (`site/`, not part of the npm package) lets you try seeds, shapes and palettes and copy the code.

[Unreleased]: https://github.com/mtblck/seedkin/compare/v2.5.0...HEAD
[2.5.0]: https://github.com/mtblck/seedkin/compare/v2.4.3...v2.5.0
[2.4.3]: https://github.com/mtblck/seedkin/compare/v2.4.2...v2.4.3
[2.4.2]: https://github.com/mtblck/seedkin/compare/v2.4.1...v2.4.2
[2.4.1]: https://github.com/mtblck/seedkin/compare/v2.4.0...v2.4.1
[2.4.0]: https://github.com/mtblck/seedkin/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/mtblck/seedkin/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/mtblck/seedkin/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/mtblck/seedkin/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/mtblck/seedkin/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/mtblck/seedkin/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/mtblck/seedkin/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/mtblck/seedkin/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/mtblck/seedkin/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mtblck/seedkin/releases/tag/v0.1.0
