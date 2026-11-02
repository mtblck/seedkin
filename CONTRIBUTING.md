# Contributing

Thanks for looking. Seedkin is a side project with one maintainer, so replies
can take a few days. A playground link or the exact `botling()` (or `snoot()`,
…) call that shows a problem is the most useful thing you can send.

## Setting up

Node 22 or newer and npm.

```bash
npm install
npm test            # vitest, including snapshot tests that pin known seeds
npm run lint        # biome
npm run typecheck
npm run build       # the package, into dist/
npm run preview     # preview.html: Botling in every shape at 24, 32, 48 and 96px
npm run site        # the playground, into dist-site/
npm run serve       # serves it on localhost:4173 with the production headers
npm run banners     # redraws the README banners in docs/banners/
```

## The one rule: the picture is the API

People store nothing but a seed, so a seed must keep drawing the same avatar,
in every style. Anything that changes the avatar an existing seed draws is a
**major version**: art, palette colours, and the order *or length* of any
parts list (seeds pick by index over the list length, so even appending
changes avatars). The snapshot
tests catch it, and `test/corpus.test.ts` checks 500 seeds in every shape
and size: a moved *pictures* digest is a major version, while a moved
*markup* digest alone is SVG that draws the same picture (see ADR 0006). If
you change them on purpose (`npx vitest -u`), say so in the PR and the
CHANGELOG. Every style is Stable (ADR 0006, 0011, 0014), so this holds for
all of them.

For any art change, look at 24px first: most avatars are shown small.
`preview.html` covers Botling; for the other styles, use their playgrounds
(`npm run site`, then `npm run serve`).

## Where things live

| Path | What |
| --- | --- |
| `src/core/` | Shared code: seeds, options, the grid canvas and art helpers |
| `src/core/render/` | Roles to SVG: cells, looks, frames and animation |
| `src/styles/<name>/` | One style each (ADR 0009), with its `index.ts` entry point |
| `src/styles/<name>/traits.ts` | Seed to traits (draw order is part of the output contract) |
| `src/styles/<name>/grid/` | Traits to a 15x15 grid of roles (head, face, extras) |
| `src/styles/botling/grid/small/` | Botling's simpler 9x9 robot drawn below 40px; each other style draws its 9x9 version in its own `grid/` |
| `src/styles/<name>/parts.ts`, `palettes.ts` | The parts and palette lists seeds pick from |
| `lab/` | Prototypes of new styles; nothing here is published |
| `site/` | seedkin.dev, the playgrounds and docs; `scripts/site.mjs` builds it |
| `scripts/` | Build, preview, banner and release scripts |
| `test/` | Vitest suites, including the snapshot and corpus tests |
| `docs/` | Overview, README banners and decision records (`docs/adr/`) |

## Pull requests

Open a draft, fill in the template, and mark it ready when CI is green. Keep
TypeScript files under 200 lines, give exported functions JSDoc, and add a
test that fails without your change.

## Releasing

Matt approves releases; `.github/workflows/release.yml` publishes them (ADR 0016).

1. Run `npm run release -- x.y.z`. It moves the CHANGELOG's `[Unreleased]`
   entries under a new `## [x.y.z] - date` heading, adds its compare link, and
   sets `version` in `package.json` and `package-lock.json`. Open that as the
   release PR.
2. Merge it once Matt says go. On `main`, the workflow sees the version change,
   runs lint, typecheck, tests and the build (`prepublishOnly`), publishes with
   provenance through npm trusted publishing, tags the merge commit `vx.y.z`,
   and makes the GitHub release from the CHANGELOG.

Only a release PR should change `version`: any merge that does releases it.
Pushing a tag by hand still works (`git tag vx.y.z && git push origin vx.y.z`,
or GitHub's New release page): the workflow checks it matches `package.json`.

The very first version has to be published by hand (`npm publish --access public`
from a clean checkout of the tag), because npm only offers trusted publishing
for a package that exists. Then set it up under the package's Settings ->
Trusted publishers (GitHub Actions, `mtblck/seedkin`, `release.yml`). The
workflow skips the publish for a version that's already on npm, so tagging
that first version still makes its GitHub release.
