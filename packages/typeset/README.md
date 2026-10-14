# @pocketview/typeset

Knuth–Plass line breaking with Liang hyphenation, for text whose size must
be known before it is drawn.

```ts
import { canvasMeasure, prepare, renderLines } from '@pocketview/typeset';
import { englishUS } from '@pocketview/typeset/src/en-us';

await document.fonts.load('17px "Source Serif 4"');
const text = prepare(str, { measure: canvasMeasure('17px "Source Serif 4"'), lineHeight: 25, hyphenate: englishUS });
text.heights([240, 320, 480]);           // planner: height at candidate widths
const par = text.layout(320);            // lines, height, quality
container.append(renderLines(par, { lineHeight: 25 }));
```

- `pnpm test`: unit and property tests (a fake font; no browser).
- `pnpm e2e`: Playwright checks, in Chromium, that canvas-measured widths
  match what the DOM draws, and that no line overflows. Set
  `PLAYWRIGHT_CHROMIUM` to a Chromium binary to skip the download.
- `pnpm demo`: side-by-side comparison with the browser's own justification.
