# @pocketview/core

The layout engine behind [pocketview](https://github.com/frobnitzem/pocketview).
It has no DOM, so it runs anywhere, including Node and Web Workers.

- Every JSON node offers a few display options. A bottom-up sweep keeps,
  for each node and width, the Pareto front of (height, how much is shown).
- `Planner.plan(spec, viewport)` picks one option per visible node and
  returns a flat list of positioned marks for a renderer to draw.
- The layout spec holds what the user chose: what each container shows,
  and what is expanded, minified and paged. Everything else is derived.
- Display variants are plugins (`Variant`): a plugin matches nodes (by
  shape, schema or content) and offers its own size options.

```ts
import { buildTree, Planner } from '@pocketview/core';

const planner = new Planner(buildTree(doc), metrics); // metrics: text widths and heights
const plan = planner.plan({ expanded: ['/packages/0'] }, { w: 900, h: 600 });
```

See [DESIGN.md](https://github.com/frobnitzem/pocketview/blob/main/DESIGN.md)
for the model and the navigation contracts. Apache-2.0.
