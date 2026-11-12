---
public: true
---

# 0017: Serve avatars as image URLs from seedkin.dev

- **Status:** Proposed
- **Date:** 2026-11-12
- **PR:** (this PR)

## Context

The package covers anyone writing JavaScript, and jsDelivr and unpkg already serve it to
browsers. People without a build step, in Markdown, on no-JS pages or in a quick prototype,
want what DiceBear's HTTP API gives them: a URL that is an avatar. Seedkin is pure (the same
seed and options always give the same SVG, ADR 0001), so every response can be cached for good
and the CDN serves almost all of them. The costs are Vercel usage if it gets popular, and a
public URL scheme to keep stable.

## Decision

We serve `seedkin.dev/api/2.x/<style>/svg?seed=...&<options>` from one edge function on the
`seedkin` Vercel project (`api/2.x/[style]/svg.ts`), with its rules as a pure function in
`server/` so tests and `npm run serve` run the same code. It draws from the repo's own `src/`,
so its output is the package's, byte for byte, and the snapshot tests guard it like the package.

- The major version is in the path. When 3.0 ships, `2.x` keeps drawing 2.x pictures by
  importing `seedkin@2` under an npm alias, and `3.x` is added beside it.
- SVG only. PNG needs a rasterizer, which is heavier and costs more per request.
- Unknown or repeated options and out-of-range values are a 400, not ignored, so a URL that
  works now can't draw something else once an option is added. Seeds are capped at 200
  characters and the query at 1024.
- Pictures are `Cache-Control: public, max-age=31536000, immutable`; refusals cache briefly.
  Responses allow any origin (CORS and CORP) and carry their own CSP, which lets only the
  animation's inline `<style>` run.

## Consequences

Anyone can use an avatar with a plain `<img>`. The docs call it a preview with no uptime
promise until Matt decides to announce it. Random seeds miss the cache, so a bot can still
make the function run. The guard is a Vercel Firewall rule (set in the dashboard, not in this
repo): requests to paths starting `/api/2.x/` are rate limited to 600 a minute per IP, a fixed
window, answered with a 429.
Revisit if requests cost real money, or if people ask for PNG.
