import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cutRelease } from '../scripts/release.mjs';

const md = `# Changelog

Intro.

## [Unreleased]

### Fixed

- A thing.

## [2.6.0] - 2026-10-31

- Old.

[Unreleased]: https://github.com/mtblck/seedkin/compare/v2.6.0...HEAD
[2.6.0]: https://github.com/mtblck/seedkin/compare/v2.5.0...v2.6.0
`;

describe('release prep', () => {
  it('moves the Unreleased entries under the new version and links it', () => {
    expect(cutRelease(md, '2.7.0', '2026-11-01')).toBe(`# Changelog

Intro.

## [Unreleased]

## [2.7.0] - 2026-11-01

### Fixed

- A thing.

## [2.6.0] - 2026-10-31

- Old.

[Unreleased]: https://github.com/mtblck/seedkin/compare/v2.7.0...HEAD
[2.7.0]: https://github.com/mtblck/seedkin/compare/v2.6.0...v2.7.0
[2.6.0]: https://github.com/mtblck/seedkin/compare/v2.5.0...v2.6.0
`);
  });

  it('refuses a bad version, a repeat or an empty release', () => {
    expect(() => cutRelease(md, 'v2.7.0', '2026-11-01')).toThrow(/isn't a version/);
    expect(() => cutRelease(md, '2.6.0', '2026-11-01')).toThrow(/already has/);
    const empty = md.replace('### Fixed\n\n- A thing.\n\n', '');
    expect(() => cutRelease(empty, '2.7.0', '2026-11-01')).toThrow(/nothing to release/);
  });

  it('reads the real CHANGELOG.md', () => {
    const real = fs.readFileSync('CHANGELOG.md', 'utf8');
    const withEntry = real.replace('## [Unreleased]\n', '## [Unreleased]\n\n- Something.\n');
    expect(cutRelease(withEntry, '9.9.9', '2026-11-01')).toContain('## [9.9.9] - 2026-11-01\n\n- Something.\n\n## [');
  });
});
