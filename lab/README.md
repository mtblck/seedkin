# Lab: new styles start here

Where new avatar styles are prototyped before they join the package, drawn the
way every style is: a seed picks traits, the traits paint a 15x15 grid of the
five `Role`s, and the package's own cell, path and frame code renders it.
Nothing here is exported or published (`files` is `dist` only), and nothing
here changes a shipped style's avatars.

Snoot, Noggin, Beastie and Sprite all started here and now live in
`src/styles/`; only the dinosaurs (`kinds/dino.ts`, parked) are still lab-only.

- `kinds/`: one module per family, plus `art.ts` (stamp and blob helpers) and `palettes.ts`.
- `render.ts`: renders a family with `src/core/render`'s cells and frames.
- `npx tsx lab/sheet.ts out.html [count]`: a quick contact sheet of every family.
- `node lab/page.mjs out.html`: the interactive comparison page (seed box, shapes, walls, plan).
- `npx tsx lab/portrait64/sheet.ts <style> out.html [count] [size] [animate] [holiday]`: a contact sheet of
  one style's portraits (`portrait()` and `duet()`, which live in `src/core/portrait/` and each style's `portrait/`).

Seeds are salted per family (`animal:` + seed). The dinosaurs' art is unfrozen: change anything. The
other kinds draw shipped, Stable art, so change those in `src/styles/`.

`kinds/animal.ts`, `person.ts` and `monster.ts` now draw from `src/styles/snoot`,
`noggin` and `beastie`, so the sheet and comparison page show the shipped art.
`preview.ts` is what the site bundles to show lab styles as previews; it is empty
while every style the site shows is in the package.
