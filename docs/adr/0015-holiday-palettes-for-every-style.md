---
public: true
---

# 0015: Every style has holiday palettes, and Noggin's are outfits

- **Status:** Accepted
- **Date:** 2026-10-31
- **PR:** to follow

## Context

Botling has had opt-in `HOLIDAY_PALETTES` since before 1.0; the other four styles had
none, so a page of mixed avatars couldn't dress up for a holiday. Every style is Stable
(ADRs 0011 and 0014), so new palettes must not change any seed's avatar. ADR 0006
already counts new holiday palettes as a minor: a seed never picks one.

Each style uses the palette roles differently (a Snoot's glow is its dark eyes, a
Beastie's its white eye whites, a Sprite's screen its bright core), so copying Botling's
colours across would have drawn black-eyed robots' colours onto animals with invisible
faces. Noggin is different again: its body and shade are skin and hair, chosen by the
seed or the person. A whole holiday palette there would paint everyone one skin tone.

## Decision

Each style exports its own `HOLIDAY_PALETTES`, with Botling's six keys and names, painted
for that style's roles and at least as readable as its weakest everyday palette (tested
pair by pair). Noggin's holidays are outfits (`bg`, `grid`, `screen`, `accent`), and its
`palette` option takes an outfit object, worn with the seed's own skin and hair. Their
backgrounds are dark enough that every skin tone stands out from them.

## Consequences

Seeds and the corpus digests are untouched. An app can switch a whole page with one key
across styles. Recolouring a holiday palette later changes every avatar drawn with it, so
that is a major, as with any palette. A new holiday must be added to every style at once,
which the tests check.
