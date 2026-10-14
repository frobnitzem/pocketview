// Fails if any dependency's license is not compatible with shipping
// pocketview under Apache-2.0. Run with `pnpm licenses:check`.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Permissive licenses that may be bundled into what we ship.
const SHIPPABLE = new Set([
  'MIT', 'ISC', '0BSD', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0',
  'CC0-1.0', 'Unlicense', 'BlueOak-1.0.0', 'Zlib',
]);
// Fonts may be distributed under the OFL (the license must travel with them).
const FONT = (name, license) => license === 'OFL-1.1' && name.startsWith('@fontsource/');
// Build and test tools that run on the developer's machine and are never
// bundled. MPL-2.0 is file-level copyleft and fine for unmodified tools.
const TOOLING = new Set([...SHIPPABLE, 'MPL-2.0', 'Python-2.0', 'CC-BY-4.0']);

// Hyphenation pattern sets we have reviewed (see THIRD_PARTY_NOTICES.md).
// Patterns of other languages carry their own licences; review before adding.
const PATTERNS = new Set(['en-us']);

function list(kind) {
  const out = execFileSync('pnpm', ['licenses', 'list', '--json', '--recursive', `--${kind}`], { encoding: 'utf8' });
  return JSON.parse(out || '{}');
}

const problems = [];
for (const [kind, allowed] of [['prod', SHIPPABLE], ['dev', TOOLING]]) {
  for (const [license, pkgs] of Object.entries(list(kind))) {
    for (const pkg of pkgs) {
      if (!allowed.has(license) && !FONT(pkg.name, license)) {
        problems.push(`${kind}: ${pkg.name}@${pkg.versions.join(',')} is ${license}`);
      }
    }
  }
}

function* sources(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* sources(path);
    else if (/\.(ts|tsx|js|mjs)$/.test(entry)) yield path;
  }
}
for (const root of ['packages', 'apps']) {
  let files;
  try { files = [...sources(root)]; } catch { continue; }
  for (const file of files) {
    for (const [, lang] of readFileSync(file, 'utf8').matchAll(/['"]hyphen\/(?:patterns\/)?([\w-]+)/g)) {
      if (!PATTERNS.has(lang)) problems.push(`${file}: hyphenation patterns '${lang}' not reviewed`);
    }
  }
}

if (problems.length) {
  console.error('License check failed:\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log('License check passed.');
