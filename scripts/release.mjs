// Prepares a release PR (ADR 0016): `npm run release -- 2.7.0` moves the CHANGELOG's
// [Unreleased] entries under a dated 2.7.0 heading, adds its compare link, and sets the
// version in package.json and package-lock.json. Merging that PR to main makes
// release.yml tag the merge commit and publish it.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const REPO = 'https://github.com/mtblck/seedkin';
const SEMVER = /^\d+\.\d+\.\d+$/;

/** The changelog with its [Unreleased] entries moved under `## [version] - date`. */
export function cutRelease(markdown, version, date) {
  if (!SEMVER.test(version)) throw new Error(`"${version}" isn't a version like 2.7.0.`);
  if (markdown.includes(`## [${version}]`)) throw new Error(`CHANGELOG.md already has ${version}.`);
  const heading = '## [Unreleased]\n';
  const start = markdown.indexOf(heading);
  if (start < 0) throw new Error('CHANGELOG.md has no "## [Unreleased]" heading.');
  const bodyStart = start + heading.length;
  const next = markdown.indexOf('\n## [', bodyStart);
  const end = next < 0 ? markdown.length : next + 1;
  const entries = markdown.slice(bodyStart, end).trim();
  if (!entries) throw new Error('[Unreleased] is empty: there is nothing to release.');
  const link = /^\[Unreleased\]: .*\/compare\/(v\d+\.\d+\.\d+)\.\.\.HEAD$/m;
  const previous = markdown.match(link)?.[1];
  if (!previous) throw new Error('CHANGELOG.md has no "[Unreleased]: .../compare/vX.Y.Z...HEAD" link.');
  const section = `${heading}\n## [${version}] - ${date}\n\n${entries}\n\n`;
  return (markdown.slice(0, start) + section + markdown.slice(end)).replace(
    link,
    `[Unreleased]: ${REPO}/compare/v${version}...HEAD\n[${version}]: ${REPO}/compare/${previous}...v${version}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const version = process.argv[2] ?? '';
  const file = new URL('../CHANGELOG.md', import.meta.url);
  const today = new Date().toISOString().slice(0, 10);
  let markdown;
  try {
    markdown = cutRelease(readFileSync(file, 'utf8'), version, today);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  execFileSync('npm', ['version', version, '--no-git-tag-version'], { stdio: 'inherit' });
  writeFileSync(file, markdown);
  console.log(`CHANGELOG.md and package.json are at ${version}. Open the release PR; merging it publishes.`);
}
