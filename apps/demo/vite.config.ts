import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const { version } = JSON.parse(readFileSync(here('../../package.json'), 'utf8')) as { version: string };

/** Ships our licence, notices, and the OFL text of each bundled font. */
function licenses(): Plugin {
  const files: Record<string, string> = {
    'licenses/LICENSE.txt': here('../../LICENSE'),
    'licenses/NOTICE.txt': here('../../NOTICE'),
    'licenses/THIRD_PARTY_NOTICES.md': here('../../THIRD_PARTY_NOTICES.md'),
    'licenses/SourceSerif4-OFL.txt': here('node_modules/@fontsource/source-serif-4/LICENSE'),
    'licenses/Antonio-OFL.txt': here('node_modules/@fontsource/antonio/LICENSE'),
  };
  return {
    name: 'pocketview-licenses',
    generateBundle() {
      for (const [fileName, path] of Object.entries(files)) {
        this.emitFile({ type: 'asset', fileName, source: readFileSync(path) });
      }
    },
  };
}

export default defineConfig({
  base: './', // works at https://<user>.github.io/pocketview/ and locally
  plugins: [licenses()],
  define: { __VERSION__: JSON.stringify(version) },
  build: { chunkSizeWarningLimit: 1000 },
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
});
