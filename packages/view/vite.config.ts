import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

/** Licence texts that must travel with the bundle (its code and its fonts). */
export const LICENSES: Record<string, string> = {
  'licenses/LICENSE.txt': here('../../LICENSE'),
  'licenses/NOTICE.txt': here('../../NOTICE'),
  'licenses/THIRD_PARTY_NOTICES.md': here('../../THIRD_PARTY_NOTICES.md'),
  'licenses/SourceSerif4-OFL.txt': here('node_modules/@fontsource/source-serif-4/LICENSE'),
  'licenses/Antonio-OFL.txt': here('node_modules/@fontsource/antonio/LICENSE'),
};

const BANNER = '/*! pocketview (Apache-2.0). Includes markdown-it (MIT), DOMPurify (Apache-2.0), hyphen (ISC) ' +
  'and the Source Serif 4 and Antonio fonts (SIL OFL 1.1): see licenses/. */\n';

/** Ships the licence texts next to the bundle, and a banner pointing at them. */
function licenses(): Plugin {
  return {
    name: 'pocketview-licenses',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const [fileName, path] of Object.entries(LICENSES)) {
        this.emitFile({ type: 'asset', fileName, source: readFileSync(path) });
      }
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk') file.code = BANNER + file.code;
        else if (file.fileName.endsWith('.css')) file.source = BANNER + String(file.source);
      }
    },
  };
}

/** Drops the WOFF fallbacks of the bundled fonts: every current browser reads WOFF2. */
function woff2Only(): Plugin {
  return {
    name: 'pocketview-woff2-only',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== 'asset' || !file.fileName.endsWith('.css')) continue;
        file.source = String(file.source).replace(/,\s*url\(data:font\/woff;base64,[^)]*\)\s*format\(["']woff["']\)/g, '');
      }
    },
  };
}

/**
 * The embeddable bundle: bundle/pocketview.js (an ES module with every
 * dependency included) and bundle/pocketview.css (with its fonts inlined).
 */
export default defineConfig({
  plugins: [woff2Only(), licenses()],
  build: {
    outDir: 'bundle',
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: () => 'pocketview.js', cssFileName: 'pocketview' },
    chunkSizeWarningLimit: 1000,
  },
});
