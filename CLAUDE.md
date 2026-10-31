# seedkin

A family of seeded pixel avatars as SVG: zero runtime dependencies, ESM only,
TypeScript, MIT. The npm package is `seedkin` (2.0.0 and up), with one
entry point per style; Botling (robots, `seedkin/botling`) is the first, and the
old `botling` package stays frozen at 1.2.0 on npm. Public repo `mtblck/seedkin`
(renamed from `mtblck/botling`); the playground site is `site/`. Shared code is
in `src/core/`, each style in `src/styles/<name>/` (ADR 0009); prototypes of new
styles are in `lab/`. README has the API and design notes; `docs/overview.md` the why.

## Commands

`npm test` · `npm run lint` · `npm run typecheck` · `npm run build` · `npm run preview [count]`
(contact sheet at 24/32/48/96px; look at it for any art change, 24px first) ·
`npm run site` then `npm run serve` (the playground with production headers) ·
`npm run hosting:check` · `npm run release -- x.y.z` (the release PR; ADR 0016)

PRs: open as drafts and mark them ready only when the work is done. Before marking
one ready, run `/pr-review:review <n>` and fix what it finds; the `pr-review` plugin
(mtblck/claude-marketplace) holds the PR at draft until that review has run in the
session. Marking it ready also triggers `.github/workflows/claude-review.yml`.

## Load-bearing decisions

- **The picture is the API** (ADR 0001). A seed must keep drawing the same robot within
  a major version. Anything that changes an existing seed's robot (trait draw order, the
  order or length of a parts or palette list, palette colours, part drawing, cell
  geometry) is a major change; the snapshot tests catch it.
- **Below 40px, the simpler 9x9 robot** (`src/styles/botling/grid/small/`) from the same traits, chosen
  by Matt from side-by-side options, so 24px avatars keep a face.
- **Zero runtime dependencies**, no requests, no globals: the output is a string.
- **Site (seedkin.dev):** plain HTML/CSS/JS in `site/`, built by `scripts/site.mjs` into
  `dist-site/` with the package's own `dist/` at `/lib`. Every `index.html` under `site/` is
  a page with `{{head}}`, `{{header}}` and `{{footer}}` from `site/partials/`; the Botling
  playground is `site/styles/botling/`, and lab styles shown as previews come from
  `lab/preview.ts`, bundled to `/preview.js`. CSP is `script-src 'self'` and
  `style-src 'self'`: no inline scripts, handlers or style attributes (`hosting:check`
  guards it). Seeds live in the URL hash, never the query, so they don't reach the
  server, and `site/analytics.js` strips the hash before Vercel Analytics sends a page
  view. `site/track.js` beacons page views, `copied` and `downloaded` to Boards' counter
  (`/_mb/events`, rewritten in `vercel.json`) with only the event name and referrer
  hostname. Site JS isn't type-checked: keep logic worth testing in pure modules like
  `site/snippet.js` (tested in `test/site.test.ts`).

The full reasoning behind these, and every other decision worth keeping, is in
`docs/adr/` (one short record per decision; copy `0000-template.md`). Reversing
one means a new ADR that supersedes it, in the same PR.

## What bites

- Commit as `mtblck <105079242+mtblck@users.noreply.github.com>`: Vercel blocks deploys
  whose author email isn't linked to Matt's account.
- npm 10 crashes ("edgesOut") installing vitest 4 in Claude's sandbox; use `npx npm@11 i`.
- Keep TypeScript files under 200 lines; exported functions get JSDoc and explicit return types.
- Don't publish to npm or push tags. A release is a PR from `npm run release`; merge it only on
  Matt's go, and `release.yml` tags and publishes it. Only a release PR changes `version`.
