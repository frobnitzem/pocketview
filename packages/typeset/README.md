# @pocketview/typeset

Knuth–Plass line breaking with Liang hyphenation, for text whose size must
be known before it is drawn. Part of
[pocketview](https://github.com/frobnitzem/pocketview).

```ts
import { canvasMeasure, prepare, renderLines } from '@pocketview/typeset';
import { englishUS } from '@pocketview/typeset/en-us';

await document.fonts.load('17px "Source Serif 4"');
const text = prepare(str, { measure: canvasMeasure('17px "Source Serif 4"'), lineHeight: 25, hyphenate: englishUS });
text.heights([240, 320, 480]);           // planner: height at candidate widths
const par = text.layout(320);            // lines, height, quality
container.append(renderLines(par, { lineHeight: 25 }));
```

When no set of breaks fits the tolerances, it retries looser, then splits
words, and reports the quality of each line.

- `pnpm test`: unit and property tests (a fake font; no browser).
- `pnpm e2e`: Playwright checks, in Chromium, that canvas-measured widths
  match what the DOM draws, and that no line overflows. Set
  `PLAYWRIGHT_CHROMIUM` to a Chromium binary to skip the download.
- `pnpm demo`: side-by-side comparison with the browser's own justification.

Apache-2.0. The en-us hyphenation patterns are under their own notice (see
the repository's THIRD_PARTY_NOTICES.md).
