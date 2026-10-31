---
public: true
---

# 0014: Sprite is Stable from its first release

- **Status:** Accepted
- **Date:** 2026-10-31
- **PR:** https://github.com/mtblck/seedkin/pull/82

## Context

ADR 0013 shipped Sprite as Preview so its art could settle in the open. 2.5.0 was
merged but not yet tagged, so no app has stored a Sprite seed. Freezing then needed the
repeats to come down: 11% of 1,000 seeds drew exactly the same Sprite as another seed,
while over 5,000 seeds Snoot repeats 1.5% and Beastie 1.3% (ADR 0011).

Before freezing, Sprite gained:

- a third form for every element, and a fourth for earth (ember, jellyfish, mushroom,
  tree, leaf, comet)
- a reworked cloud
- nine palettes for every form: 81 in all, still kept to their element and form, and
  exported as `PALETTE_GROUPS`
- two more eye styles and three more mouths
- richer faces on the 9x9 grid
- a forehead mark (dot, bar, chevron, plus or twin dots). It is drawn only where all
  of it lands on plain body in every frame, so a seed picks only from the marks that
  fit its form.

Letting every form wear any palette would have cut repeats further, to 1.0%, but Matt
kept palettes tied to their element and form so colour still says what a Sprite is.

## Decision

We mark Sprite Stable in 2.5.0, its first release: ADR 0001 and ADR 0006 apply to it as
to the other styles, so a change to the Sprite a seed draws is a major version. The
golden corpus (`test/family-corpus.test.ts`) pins Sprite's traits, grids, colours and
markup over 500 seeds. Which marks a seed can pick depends on each form's art, so
redrawing a form is a major change even when the change looks small.

## Consequences

Apps can store a Sprite seed and get the same Sprite back through 2.x. Over 5,000 seeds,
2.1% of full-size Sprites repeat another seed. At 24px, 56% do, against 5.8% for Snoot:
the 9x9 grid has room for little more than two eyes and a mouth, and each form has only
nine palettes. Fixing that would take more palettes per form or a new trait shown at
small sizes. Both change existing Sprites, so either one waits for 3.0.
