#!/usr/bin/env node
/**
 * Run from a package directory after `tsc` has built dist/: copies the
 * repository's LICENSE and NOTICE into the package (npm ships them with
 * it), and the listed non-TypeScript sources from src/ into dist/. Type
 * declarations lose their stylesheet imports (a page's bundler loads the
 * stylesheet from the JavaScript; type checkers need not know of it).
 * With `--clean` (before `tsc`), it empties dist/ instead.
 *
 *   node ../../scripts/package-files.mjs pocketview.css
 */
import { copyFileSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const args = process.argv.slice(2);
if (args[0] === '--clean') {
  rmSync('dist', { recursive: true, force: true });
} else {
  for (const f of ['LICENSE', 'NOTICE']) copyFileSync(root(f), f);
  for (const f of args) copyFileSync(`src/${f}`, `dist/${f}`);
  for (const f of readdirSync('dist').filter((n) => n.endsWith('.d.ts'))) {
    const text = readFileSync(`dist/${f}`, 'utf8');
    writeFileSync(`dist/${f}`, text.replace(/^import '[^']+\.css';\n/gm, ''));
  }
}
