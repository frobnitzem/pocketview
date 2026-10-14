# pocketview

A viewer for JSON and YAML trees, with publication-quality typesetting and
an automatic layout that decides what to show, where, and how.

**Demo:** https://frobnitzem.github.io/pocketview/ (paste JSON, YAML or plain
text on the left, press the blue arrow). Text is typeset; objects and arrays
are laid out in arch frames and can be navigated by clicking.

- `DESIGN.md`: the design (pipeline, arch frames, marked tree, contracts).
- `packages/typeset`: Knuth–Plass line breaking with hyphenation.
- `packages/core`: the layout engine (measure, plan, navigation contracts).
- `apps/demo`: the demo site, published to the `gh-pages` branch by
  `.github/workflows/pages.yml`.

```sh
pnpm install
pnpm test            # unit and property tests
pnpm e2e             # Playwright (set PLAYWRIGHT_CHROMIUM to reuse a local Chromium)
pnpm --filter @pocketview/demo dev
pnpm licenses:check  # dependency licences are compatible with Apache-2.0
```

The original 2017 prototype is on the `archive` branch.

Licensed under the Apache License 2.0. See `LICENSE`, `NOTICE` and
`THIRD_PARTY_NOTICES.md`.
