# Changelog

## Unreleased

- `@pocketview/view`: the viewer as an embeddable package. `mount(element,
  value, options)` fills a fixed-size element and returns a `Viewer`
  (`show`, `on`, `setTheme`, `configure`, `destroy`). A
  single-file bundle (`pocketview.js` and `pocketview.css`, with the Latin
  font subsets inlined) is built and served from the demo site at `lib/`,
  with an example page, `embed.html`. The demo uses the same API.
- The viewer's colour schemes apply to the viewer element only, never to
  the embedding page.
- Targeting a container no longer re-plans or drops expansions.
- The viewer is a `Viewer` object owning the document, the layout spec
  and the target. Every click goes through pure rules (`rules.ts`), then
  one plan and one redraw, then one event: `viewer.on(type, listener)`
  reports `target`, `open`, `expand`, `minify`, `page` and `refuse`, with
  the node's JSON Pointer.
- Untargeted, a key or a nested title toggles its node: shown or expanded
  nodes are minified (collapsed even when there is room), minified ones
  expanded. Minified nodes are a new list in the layout spec.
- Core: `Planner.plan(spec, viewport)` takes a `LayoutSpec` (`views`,
  `expanded`, `minified`, `windows`, `offsets`); the outermost frame is
  the slot `""` in `views`, so re-rooting is opening into it. Re-rooting
  keeps the annotations inside the new root.
- Sizes are cached per document node, keyed by the layout spec inside the
  node's subtree: navigating in one container keeps every other
  container's sizes. Text and Markdown measurements are cached per viewer
  and recomputed when a node's text changes (two viewers on a page no
  longer share Markdown heights).

## 1.0.0

- One breadcrumb style: every arch's top bar is a nav bar of square crumb
  segments followed by its title (crumb and menu marks carry their `slot`).
- Titles activate their node (open when targeted, expand when not); only
  clicking a border changes the target. Top-bar crumbs re-root without
  changing the target.
- Bar segments (side-bar segments, crumbs, paging arrows) abut, cut apart
  by background-coloured borders on both sides, with no bar colour between.

- Nested targets: any object or array container on the page can be the
  target (click its border or title; it stays in place). Opening a node
  under it redraws just that container's area, with its own breadcrumb
  trail, while the root stays at the top; opening a node outside the
  target blinks and refuses. Breadcrumbs act on the container they belong
  to (`views` in `PlanOptions`; frame and title marks carry their `slot`).

- Elastic heights: options carry a stretch; leftover height is handed to
  stretchable boxes (text and Markdown scroll boxes grow to fill), expanded
  rows first, then in document order.
- Array containers show as much of their first element as possible; the
  book example's chapters read as one chapter per page.
- The page never scrolls: content that doesn't fit scrolls inside its
  stationary frame (a last resort).

- Display variants are plugins (`Variant` in `@pocketview/core`): the
  highest-priority matching variants offer options and the layout picks;
  conflicts resolve to the outermost node. The built-in displays are ported.
- `@pocketview/markdown`: the first plugin, with Markdown detection and
  rendering sanitized against XSS (markdown-it without raw HTML, then
  DOMPurify).
- Short strings wrap plainly; only long strings (over 280 characters, or
  with line breaks) are typeset.

- Array containers: an array that doesn't fit is drawn between top and
  bottom bars, showing a window of elements with the range (`6–8 of 12`)
  and ◀ ▶ paging; an opened array is a full-view container target. Bare
  tags and lists are kept for arrays that fit.
- The outer side bar pages its segments with ▲ ▼ instead of overflowing
  into chips.
- Only objects and arrays are targets; an opened scalar's bar is not.
- Planner: logarithmic thinning buckets (small options survive next to
  very tall ones); very long text in rows is estimated, not typeset at every
  width (the book example plans in under 0.2 s instead of 2 s).
- Demo: "The Invisible Man" (YAML) example, loaded on demand.

- Colour by type and status: objects amber at every depth, arrays cream,
  scalars lavender (arches, keys, chips, segments, crumbs, titles); the
  target arch is purple.
- Targeting: the outermost arch is the target; clicking a node re-targets.
  Clicking the target's border un-targets; untargeted clicks on collapsed
  nodes expand them in place (`PlanOptions.expanded`), and clicks that
  can't expand anything blink the border. Every nested container's title
  is a breadcrumb trail (e.g. `packages › 0`).
- Planner: better choices at the root (side-bar capacity is respected when
  comparing options); thinning keeps the lowest and best point per height
  bucket; empty lists no longer beat collapsing.

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
