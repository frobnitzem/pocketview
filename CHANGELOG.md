# Changelog

## 0.2.0 (2026-10-14)

First release of the rewrite. The 2017 prototype is on the `archive` branch.

- `@pocketview/typeset`: Knuth–Plass line breaking with Liang hyphenation
  (US English), canvas measurement, per-paragraph fallbacks (looser
  tolerances, emergency stretch, character splitting), first-line indents,
  and a DOM renderer whose lines match the planned widths. Each line
  reports how its paragraph was set (`optimal`, `loose`, `emergency`,
  `overfull`).
- Demo site on GitHub Pages: paste JSON, YAML or plain text (a whole book
  works), with a collapsible bottom sheet on phones, a settings modal
  (layout diagnostics, ragged right, examples) and an RT-arch input pane.
- Design: `DESIGN.md` (pipeline, arch frames and their proportions, the
  marked tree, navigation contracts) and a mockup in `docs/mockups/`.
- Apache-2.0 licence, third-party notices, and `pnpm licenses:check` in CI.
