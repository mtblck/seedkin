---
public: false
---

# 0016: Merging a release PR tags and publishes it

- **Status:** Accepted
- **Date:** 2026-10-31
- **PR:** [#90](https://github.com/mtblck/seedkin/pull/90)

## Context

Every release needed Matt to push a `vX.Y.Z` tag after the release PR merged,
because Claude's sessions can't push tags. That made a release two approvals
(merge, then tag), and a merged version could sit untagged for hours. Options:
give Claude a token that can push tags (a PAT or GitHub App, a stored secret
to rotate and leak), have a workflow call `release.yml` from another workflow
(npm trusted publishing then checks the calling workflow's name, so the trusted
publisher would have to change), or let `release.yml` itself notice a version
bump on `main`.

## Decision

`release.yml` also runs on pushes to `main` that touch `package.json`. When
the push changed `version` and `CHANGELOG.md` has that version's section, it
runs the checks, publishes to npm, tags the merge commit `vX.Y.Z` with the
run's own `GITHUB_TOKEN`, and makes the GitHub release. Merging the release PR
is the approval: Claude opens it with `npm run release -- X.Y.Z` and merges it
only on Matt's go. A tag Matt pushes by hand still releases as before.

## Consequences

No new secret, and the trusted publisher on npm keeps naming `release.yml`.
A tag made with `GITHUB_TOKEN` starts no workflow, so there is never a second
release run. Any merge that changes the version releases it, so a version bump
belongs only in a release PR. The tag points at the merge commit and is made
after the publish succeeds, so a failed check leaves no tag; a re-run of a
half-finished release skips what is done and finishes it. If Matt wants a gate inside GitHub too, a `release` environment with
him as required reviewer can be added to the job (and to the trusted publisher).
