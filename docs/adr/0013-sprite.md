---
public: true
---

# 0013: Sprite ships as a Preview style

- **Status:** Superseded by [0014](0014-sprite-stable.md)
- **Date:** 2026-10-31
- **PR:** https://github.com/mtblck/seedkin/pull/80

## Context

Sprite, little elemental spirits (fire, water, earth, wind, space), began in `lab/`.
Matt liked it enough to release it and refine it in the open. ADR 0011 froze the four
existing styles until 3.0, so a new style shipped as Stable would freeze art that has had
one day of looking at. The seed space is also smaller than the other styles': about 4,400
combinations of element, form, palette and face, so roughly 2% of 200 seeds and 11% of
1,000 repeat another seed's Sprite.

## Decision

We ship `seedkin/sprite` in 2.5.0 as a **Preview** style: the Sprite a seed draws may
change in a minor version, on purpose and noted in the changelog, until a later release
marks it Stable and ADR 0001 applies to it in full. The site marks it with a Preview badge.
It follows the other styles: a 15x15 grid, a 9x9 grid below 40px, the shared looks, frames
and shapes, and animation as a CSS frame swap inside the SVG (ADR 0003) that holds the
first frame for reduced motion. The seed is salted after it (`seed:sprite`) so
neighbouring seeds such as `user-1` and `user-2` don't draw near twins. The frame shape
defaults to square rather than coming from the seed.

## Consequences

Sprite can grow more forms per element, which is the main way to cut repeats, without a
major version. Anyone who stores a Sprite seed today may see it redrawn after an upgrade,
so apps that need a fixed picture should wait for Stable or pin the version. Marking it
Stable means a new ADR and the corpus test covering it.
