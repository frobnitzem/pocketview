# Changelog

## Unreleased

- `@pocketview/core`, the layout engine: a lazy bottom-up measure that keeps
  a Pareto front of (height, shown) per node and width, and a top-down
  planner that produces the marked tree for any focus and viewport
  (outermost LTR frame with breadcrumbs, side-bar segments and chips;
  nested arch frames; rows, tags, text and scroll boxes). Arch paths for all
  six variants. Property tests for the navigation contracts.
- Strings are drawn without quotes; key capsules are as tall as their
  values; nodes more than 4 levels below the focus are collapsed.
- Demo: colour schemes (pastel; lux with forest-green arches; Solarized dark
  and light, built on Solarized's base-tone swap); tooltips
  on truncated labels; a focused string's bar takes the chip colour; fixed
  the view sometimes keeping the previous document after switching examples.
- Demo: objects and arrays are laid out and navigable (click a chip,
  segment, title, key or breadcrumb; Esc goes up). The input pane folds to
  the left on desktop.

- Input pane arch drawn as one SVG path: half-circle cap on the left, curved
  outer elbow at the top right.
- Text: no paragraph indents; 0.5em of space after each paragraph.
  `@pocketview/typeset` gains `paragraphSpacing`, and lines carry their `y`
  position and an `endsParagraph` flag.

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
