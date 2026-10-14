# pocketview — design

A viewer for JSON/YAML trees. The archived prototype (branch `archive`) had
the right core idea: size every element bottom-up, then let an automatic
layout decide what to show. This rewrite keeps that idea and adds what the
prototype lacked: publication-quality text, several display variants per
element, and navigation contracts so that browsing can never get stuck.

## Pipeline

```
parse ─► measure (bottom-up) ─► plan (top-down) ─► render (animated)
 JSON     size options per        one choice per      draws the marked
 YAML     node and variant        visible node:       tree; animates
                                  the marked tree     between trees
```

`measure` and `plan` are pure functions with no DOM, so they run in tests
and in a Web Worker. `render` does no layout of its own: it draws boxes the
planner has already positioned.

## Goal 1: typeset text

- Knuth–Plass line breaking, a TypeScript port of Bram Stein's `typeset`
  (used by the prototype), with Liang hyphenation patterns from `hyphen`.
- Word widths come from canvas `measureText` (it includes kerning), are
  cached per (font, word), and are taken only after `document.fonts` has
  loaded the self-hosted font. This keeps planned sizes equal to drawn sizes.
- The breaker is exposed as `heights(text, widths[]) → number[]`, so the
  planner can ask cheaply how tall a paragraph is at each candidate width.
- Lines are emitted as absolutely positioned spans with explicit
  word-spacing. The browser never re-wraps the text.
- Math (KaTeX) and code (Shiki) are separate text variants.

## Visual language

Taken from the LCARS look, but regular: the layout follows the nesting of
the JSON, and colour is assigned by role, never at random.
See `docs/mockups/arch.html` (screenshot: `docs/mockups/arch.png`).

### Arch (object frame)

A frame is a thick side bar joined to a horizontal bar by a rounded elbow
(large outer radius, small inner radius). Five variants:

| variant | bars              | typical use                                      |
|---------|-------------------|--------------------------------------------------|
| `LT`    | left + top        | default nested object                            |
| `RT`    | right + top       | object in a right-hand column                    |
| `LB`    | left + bottom     | left column, at the top or bottom of the column  |
| `RB`    | right + bottom    | right column, at the top or bottom of the column |
| `LTR`   | left + top + right| **outermost frame** (required); full-width child |

There is no `LBR` variant. The outermost frame must have a top bar, and the
breadcrumbs live in it.

**Choosing a variant** (decided; the planner does this, not plugins):
- **Side:** a frame in a left column gets its bar on the left (`L*`), and
  one in a right column gets it on the right (`R*`).
- **Top or bottom:** top (`*T`) by default. Bottom (`*B`) if the frame sits
  at the top or bottom of its column.
- **Three-sided:** `LTR` for the outermost frame and full-width children.

### Where a key/value pair can go (slots)

| slot        | contents                                                              |
|-------------|-----------------------------------------------------------------------|
| `row`       | inside the frame: key chip + value, one per line                      |
| `border`    | on a horizontal bar: a square segment as tall as the bar (`TIMEOUT 30 s`, `TLS · 3`) |
| `title`     | the frame's own key, in a gap at the open end of its horizontal bar   |
| `sidebar`   | collapsed child: a labelled segment of the side bar (`SCRIPTS · 4`)   |
| `chip`      | collapsed child: key capsule + size badge inside (`REPOSITORY { 2 }`) |
| `frame`     | nested child arch inside the content area                             |
| `scroll`    | text or array too tall for its box: fixed-size box with a scrollbar   |
| `crumb`     | ancestor of the focused node, as a capsule in the outermost top bar   |
| `menu`      | ancestor that didn't fit as a capsule, listed in a hamburger dropdown |

Items in a horizontal bar, whether key/value pairs or collapsed children,
are **square** segments as tall as the bar, separated by gaps and labelled
like side-bar segments: the bars read as one system. Capsules are kept for
breadcrumbs and for chips inside the frame.

Clicking a `sidebar`, `chip` or `crumb` item moves the focus to that node.

### Colour roles

- Structure: one warm hue, lightened at each nesting depth.
- Navigation (crumbs, collapsed segments and chips): cream.
- Keys: lavender.
- Values, by JSON type: strings off-white, numbers gold (tabular figures),
  booleans and null blue italic.

### Regularity

Every dimension snaps to a grid: heights to the baseline (line height),
widths to a column unit. Bar thickness, elbow radii and gaps are constants
of the theme, not of each plugin. Snapping keeps the layout aligned and
also limits how many size options each node can produce.

## The marked tree

The planner's output, which is also the renderer's only input:

```ts
type Path = (string | number)[];
type Rect = { x: number; y: number; w: number; h: number };
type Arch = 'LT' | 'RT' | 'LB' | 'RB' | 'LTR';

type Slot =
  | { kind: 'frame'; arch: Arch }
  | { kind: 'row' } | { kind: 'title' }
  | { kind: 'border'; bar: 'top' | 'bottom' }
  | { kind: 'sidebar' } | { kind: 'chip' }
  | { kind: 'scroll'; contentHeight: number }
  | { kind: 'crumb' } | { kind: 'menu' };

interface Mark {
  path: Path;
  variant: string; // plugin variant id, e.g. "core/text.justified"
  slot: Slot;
  rect: Rect;      // absolute, in viewport coordinates
}

type MarkedTree = Map<string /* JSON Pointer */, Mark>;
```

Nodes missing from the map are not shown. Paths are encoded as JSON
Pointers, which gives the renderer stable keys to animate between two
marked trees.

## Variants and plugins

```ts
interface SizeOption {
  w: number; h: number;  // snapped to the grid
  shown: number;         // how much content this option displays (for ranking)
  plan: unknown;         // opaque; handed back to place()
}

interface Variant<T = unknown> {
  id: string;
  slots: Slot['kind'][];                  // where this variant may appear
  matches(node: unknown): node is T;      // base type, or a compiled JSON Schema (Ajv)
  measure(node: T, ctx: MeasureCtx): SizeOption[];          // bottom-up
  place(opt: SizeOption, rect: Rect, ctx: PlaceCtx): Mark[];  // top-down
}
```

Built-in variants:
- Strings: `token`, `text.justified`, `text.scroll`, `code`, `math`.
- Numbers, booleans and null: `token`.
- Arrays: `tags`, `list.scroll`. No frame by default. A framed array
  display for regularly structured arrays (matrices, dataframe-like arrays
  of uniform records) comes later, as a selector plugin that matches by
  schema or shape.
- Objects: `arch.*`.
- Every node: `chip`.

Plugins add variants for objects that match a schema, e.g. GeoJSON → map,
`{type:"image", data:base64}` → image, molfile → molecule.

`measure` returns the Pareto set of (w, h, shown), capped at K options (≈8).
A parent merges its children's sets, then prunes back to K options.

## Navigation contracts

Every variant must obey these. Each is checked by property-based tests
(`fast-check`: random JSON × random viewport).

1. **Always collapsible.** Every node has a `chip` option of bounded size,
   so any node fits somewhere.
2. **Size is local.** A variant's options depend only on its own subtree and
   the theme, never on its siblings or ancestors.
3. **The plan fits.** The marked tree fits the viewport, and no two rects
   overlap except a child inside its parent frame.
4. **The path is visible.** Every ancestor of the focused node is marked
   `crumb` or `menu`. The focus itself is always marked.
5. **Everything is reachable.** Every node is either marked, or is a
   descendant of a `sidebar` or `chip` mark: any node can be reached in at
   most depth(node) clicks.
6. **Small edits make small changes.** Moving focus to a visible child, or
   back up one level, keeps every mark that is still visible in the same
   variant where possible. This keeps animations calm.

## Rendering and animation

- React 19 + Motion. Each `Mark` becomes a keyed element, and `layoutId` =
  JSON Pointer.
- When the focus changes, an element that turns from a `chip` into a
  `frame` (or a frame into a `crumb`) animates as one shared element.
- Arch frames are SVG paths computed from (rect, arch, theme). All five
  variants are built from the same parametric path (some segments zero
  length, others mirrored), so changing variant animates as a smooth morph.
- Long text and arrays inside `scroll` slots scroll natively, with a themed
  scrollbar thumb.

## Demo (gh-pages)

- Desktop: editor on the left (CodeMirror 6, JSON + YAML, parse errors
  inline), view on the right.
- Mobile: the view fills the screen, and the editor is a bottom sheet that
  collapses vertically.
- No live updates. A round blue send button with a right arrow parses the
  input and re-plans the view.
- Built by GitHub Actions and published to the `gh-pages` branch.

## Stack

TypeScript, pnpm workspaces, Vite, Vitest, fast-check, Playwright (screenshot
tests of typesetting and frames).

```
packages/typeset   Knuth–Plass + hyphenation + measurement cache
packages/core      variants, measure, plan, contracts (no DOM)
packages/render    React + Motion renderer of a MarkedTree
packages/plugins   schema-matched high-level variants
apps/demo          gh-pages site
```

## Open questions

None at the moment.
