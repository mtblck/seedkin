---
public: true
---

# 0018: Portraits ship as a Preview beside each style's avatar

- **Status:** Accepted
- **Date:** 2026-11-14
- **PR:** to come

## Context

Matt wanted fuller, game-style pictures of each Seedkin, closer to a visual
novel's character portraits than to a 15x15 avatar. A 32x32 bust was too close to
the avatar to be worth it; at 64x64 there is room for arms, clothes, a whole
sitting animal and a scene behind. Built in `lab/portrait64/` and reviewed family
by family, the rule that held up was to match the avatar's shapes and colours
wherever possible, so a user's portrait is recognisably their avatar. The
portraits also animate the way the avatars do and dress for the six holidays.

Putting them in the package as new options on `botling()` and friends would tie
a much larger picture to the avatar's frozen API. Leaving them in `lab/` means no
one can use them.

## Decision

Every style gets a second entry point, `seedkin/<style>/portrait`, exporting
`portrait()`, `portraitDataUri()` and `duet()` (two seeds facing each other in
one 128x64 scene), with their own small `PortraitOptions`:
`size`, `animate`, `holiday` and `title`. A portrait reads the same traits as the
seed's avatar, so it is the same robot, animal, person, monster or Sprite; what
the avatar doesn't say (clothes, gear, the scene) comes from a second generator
salted `<style>-portrait:`, and motion uses the avatar's own clock, so the two
blink together. Shared code lives in `src/core/portrait/`, each style's drawing
in `src/styles/<style>/portrait/`. Portraits are a **Preview**: a seed's portrait
may change in a minor release, noted in the changelog. Avatars don't change at all.

## Consequences

A separate entry point keeps the portrait code (about ten times an avatar's) out
of apps and site pages that only draw avatars. Portraits can keep improving (more scenes and gear, better Sprites) without a
major version, and a digest test makes each change deliberate. Apps that need a
fixed picture should wait for Stable or pin the version. A portrait is about
60-140 KB of SVG and takes 5-50 ms to draw, against an avatar's few KB, so they
suit a profile page or a game screen rather than a list of hundreds. They are not
in the image URL API (ADR 0017) yet. Marking them Stable means a new ADR.
