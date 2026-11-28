---
public: false
---

# 0019: The brand kit lives in brand/, and the name and logo are not MIT

- **Status:** Accepted
- **Date:** 2026-11-28
- **PR:** [#113](https://github.com/mtblck/seedkin/pull/113)

## Context

Seedkin had a logo (the header robot, Botling `jolly-sprocket-65` on its dark tile, beside "seedkin" in
Silkscreen) and a portfolio cover, but no kit: no app icons, guidelines, palette files or templates, and
nothing saying who may use the name. Matt's brand-kit plugin (1.8.0) makes the whole kit from one
`brand.json`, and by default keeps the brand out of the code's license. Seedkin's README promises
"MIT, art included", and the logo's robot is an avatar anyone can draw with the package.

## Decision

We keep the logo as it is and draw it from the package (`brand/draw.mjs`), with the kit's source in
`brand/` and its export (`brand/dist/`, ignored by git) rebuilt from it. The Seedkin name and logo are
all rights reserved under `brand/LICENSE` and `brand/TRADEMARKS.md`; every avatar the package draws,
the logo's robot included, stays MIT. The portfolio covers are the original cover's wall of avatars
re-laid at 2400 × 800 and 1000 × 800, without the logo and npm pills.

## Consequences

Forks can't ship under the Seedkin name or logo, while users keep every avatar. Changing the logo means
editing `brand/draw.mjs` and exporting again. The site still uses its own favicon and og.png; adopting
the kit's icons there is a separate change.
