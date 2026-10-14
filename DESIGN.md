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

**Non-object roots are shown as they are.** Nothing is wrapped on read.
A root string, number, boolean, null or array is drawn with its own variant
and no frame: a bare string is just typeset text, and an array is tags, a
list or a scroll box. Frames exist to hold keys and breadcrumbs, and an
unfocused root has neither.

**The view root.** What fills the viewport is the *focused* node, not the
document root:
- If the focused node is an object, it is drawn as the outermost frame
  (`LTR`). Its top bar holds the breadcrumbs (if any) and its key as the title.
- If it is anything else (an array, or a long string opened on its own), it
  is drawn unframed. If the focus is below the document root, a bare top bar
  (`T`) above it carries the breadcrumbs. At the document root there are no
  breadcrumbs, so there is no bar.
- The document root's crumb is labelled with the file name (without
  extension), or with its type (`object`, `array`, `string`, …) when there
  is no file name.

## Goal 1: typeset text

- Knuth–Plass line breaking, a TypeScript port of Bram Stein's `typeset`
  (used by the prototype), with Liang hyphenation patterns from `hyphen`.
- Word widths come from canvas `measureText` (it includes kerning), are
  cached per (font, word), and are taken only after `document.fonts` has
  loaded the self-hosted font. This keeps planned sizes equal to drawn sizes.
- The breaker is exposed as `heights(text, widths[]) → number[]`, so the
  planner can ask cheaply how tall a paragraph is at each candidate width.
- Lines are emitted as one nowrap element each, with explicit word-spacing
  (CSS justification can widen spaces but not shrink them) and
  `text-align: justify` absorbing the sub-pixel remainder. The browser
  never re-wraps the text.
- Fallbacks, in order, so any string lays out:
  1. tolerances 1, 1.5, 3;
  2. a loose pass with emergency stretch (unavoidable looseness spreads
     over the paragraph, as with TeX's `\emergencystretch`);
  3. splitting pieces wider than the line between characters;
  4. greedy, with overflow (only for lines narrower than one glyph).
  Long tokens (URLs, paths) may break after `/ . ? & = _ , : ; #` without
  a hyphen.
- Implemented in `packages/typeset` (`pnpm demo` shows it next to the
  browser's own justification).
- Math (KaTeX) and code (Shiki) are separate text variants.

## Visual language

Taken from the LCARS look, but regular: the layout follows the nesting of
the JSON, and colour is assigned by role, never at random.
See `docs/mockups/arch.html` (screenshot: `docs/mockups/arch.png`).

### Arch (object frame)

A frame is a side bar joined to a horizontal bar by a rounded elbow
(large outer radius, small inner radius).

**Proportions.** The side bar's width and the horizontal bar's thickness
are never equal. They stand in a 3 : 1 ratio either way:
- a *wide* side (side = 3 × bar), for frames whose side bar holds collapsed
  children as labelled segments (the outermost frame in the mockup);
- a *thin* side (side = bar / 3), for frames whose side bar is only a rule
  (nested frames with nothing collapsed, the demo's input pane: a 36px top
  bar and a 12px side).

The planner picks wide or thin per frame, depending on whether anything is
collapsed into the side.

Five variants:

| variant | bars              | typical use                                      |
|---------|-------------------|--------------------------------------------------|
| `LT`    | left + top        | default nested object                            |
| `RT`    | right + top       | object in a right-hand column                    |
| `LB`    | left + bottom     | left column, at the top or bottom of the column  |
| `RB`    | right + bottom    | right column, at the top or bottom of the column |
| `LTR`   | left + top + right| **outermost frame** of a focused object; full-width child |
| `T`     | top bar only      | breadcrumb bar above an unframed focused node    |

There is no `LBR` variant. The breadcrumbs always live in a top bar: the
`LTR` frame's, or the bare `T` bar's.

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
| `crumb`     | ancestor of the focused node: a square segment of the top bar          |
| `menu`      | ancestor that didn't fit as a crumb, listed in a hamburger dropdown   |

Everything that sits in a bar is a **square** segment as tall as the bar,
separated by gaps and labelled like side-bar segments, so all bars read as
one system. That covers breadcrumbs, key/value pairs and collapsed children.
The outermost top bar holds only the breadcrumbs and the title. Other items
go in the bottom bars of `*B` frames. Capsules are used only for chips
inside a frame.

Clicking a `sidebar`, `chip` or `crumb` item moves the focus to that node.

### Colour roles

- Structure: one warm hue, lightened at each nesting depth.
- Navigation: chips inside frames are cream. Crumbs and bar segments take
  their bar's colour, separated by gaps.
- Keys: lavender.
- Values, by JSON type: strings off-white, numbers gold (tabular figures),
  booleans and null blue italic.

### Regularity

Every dimension snaps to a grid: heights to the baseline (line height),
widths to a column unit. Bar thickness, elbow radii and gaps are constants
of the theme, not of each plugin. Snapping keeps the layout aligned and
also limits how many size options each node can produce.

## The marked tree

The planner's output, which is also the renderer's only input
(`packages/core/src/plan.ts`):

```ts
type Rect = { x: number; y: number; w: number; h: number };
type ArchVariant = 'LT' | 'RT' | 'LB' | 'RB' | 'LTR' | 'T';

type Mark =                                    // every mark has a JSON Pointer `ptr`
  | { kind: 'frame'; arch: ArchVariant; geom: ArchGeometry; depth: number }
  | { kind: 'title'; text: string; scale: number }  // a frame's own key, in its bar
  | { kind: 'key'; text: string }                   // key chip of a row
  | { kind: 'token'; text: string; type: Kind }     // one-line value
  | { kind: 'text'; text: string; scroll: boolean; contentHeight: number }
  | { kind: 'tag'; text: string; type: Kind }       // item of an array of scalars
  | { kind: 'chip'; text: string; badge: string }   // collapsed child, inside
  | { kind: 'segment'; text: string; badge: string }// collapsed child, side bar
  | { kind: 'crumb'; text: string }                 // ancestor, top bar
  | { kind: 'menu'; items: { ptr; text }[] };        // ancestors that didn't fit

interface Plan { focus: string; marks: Mark[]; width: number; height: number; overflow: boolean }
```

Marks are a flat list, each with a `rect` in viewport coordinates and the
JSON Pointer of its node. A node can have several marks (a row's `key` and
its `token`), and nodes without marks are not shown. Pointers give the
renderer stable keys to animate between two plans. `chip`, `segment`,
`crumb`, `title` and `key` marks are navigable: clicking one focuses its node.

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

**How measuring works (implemented in `packages/core/src/measure.ts`):**
- **Memoized per width.** For a node and a maximum width, the engine
  returns the Pareto front of options over (height, shown). Results are
  memoized per (node, width), with widths snapped to an 8px unit. The
  "bottom-up sweep" is therefore lazy: only the widths the planner reaches
  are computed.
- **A container is a knapsack over its rows.** Each child is either shown
  (any option from its own front: a token, text, text in a scroll box,
  tags, a nested frame, or a list) or collapsed (a chip, whose cost is
  estimated as a share of a chip row; or a side-bar segment, which costs no
  content height). Fronts are merged child by child, keeping the Pareto
  front. Heights are then made exact, including the chip rows.
- **Thinning.** A front is cut down to about K = 16 points by splitting
  its height range into buckets and keeping the best point in each, so a
  good option survives at every scale of height.
- **"Shown".** A scalar counts 1. Text counts 1–4, by length, and only
  partly when in a scroll box. Content one level deeper counts
  `depthDiscount` = 0.7 as much, so a parent's own rows win over its
  grandchildren. Ties go to earlier children.

**Depth bound.** Nodes more than `maxDepth` = 4 levels below the focus are
always collapsed to chips. Focusing deeper reveals them.

**Current simplifications (core v1):**
- **Single column.** Children stack in one column; nested frames are `L*`,
  with `*B` for the first and last frame in a column.
- **Side-bar segments only on the focused frame.** Nested frames collapse
  children to chips.
- **No scroll boxes for arrays** (lists collapse instead).
- **No overflow ranges** for very long arrays yet. If even everything
  collapsed does not fit, the plan overflows and the view scrolls.

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

Status:
- **1 and 2 hold by construction** in `packages/core`.
- **3–5 are property-tested** in `packages/core/test/contracts.test.ts`, at
  the root and with the focus anywhere, along with two more checks: frames
  nest (two frames are disjoint, or one contains the other), and planning is
  deterministic.
- **6 is not yet enforced**; it matters once there is animation.

## Rendering and animation

**Roadmap:** v1 draws each plan immediately, which feels fast and
responsive. Animation between plans is deferred to v3. Next comes polishing
v1, then the integration story (embedding, pushing new JSON, titles, focus
events) and a release.

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
- The input pane is itself an `RT` arch with a thin side, drawn as one SVG
  path: a half-circle cap at the bar's open (left) end, a curved outer elbow
  at the top right, and a small concave inner corner. The top bar holds the
  label, the settings gear and the format selector.
- Text is set without paragraph indents. Each paragraph is followed by an
  extra 0.5em of space (`paragraphSpacing` in `packages/typeset`).
- Modal dialogs (settings) are framed in the "urgent" colour (salmon in the
  pastel scheme), so they read as interruptions, distinct from the structure.
- Colour schemes, chosen in settings: **pastel** (the default: amber, peach
  and pastel green frames, lavender keys, a beachy aqua send button),
  **lux** (orange, violet and cyan light trails on deep green, steel-gray
  keys), and **Solarized dark** and **light**. Every colour is a CSS
  variable set per `[data-theme]`.
- Strings are drawn without quotes, whether as tokens, text, tags or chips.
- A key capsule is as tall as its value. Its corners keep the same 14px
  radius, so a tall capsule reads as a rounded rectangle, and the label
  sits on the value's first line.
- A focused array or leaf has no frame: its T bar and breadcrumbs take the
  chip colour, matching the chip you clicked to get there.
- Labels truncated to fit (titles, chips, keys, crumbs, segments) show
  their full text on hover.
- No live updates. A round blue send button with a right arrow (or
  Ctrl/Cmd+Enter) parses the input and re-plans the view.
- Input format: auto, JSON, YAML or text. Auto tries JSON, then YAML if it
  yields an object or array, and otherwise reads the input as plain text.
  Plain text follows Markdown's paragraph rule (blank lines separate
  paragraphs; single newlines are spaces), so hard-wrapped e-texts reflow.
- Long texts are laid out once per width and only the lines near the
  viewport are in the DOM.
- The settings button (gear) sits in the input pane's top bar, next to
  the format selector. It opens a modal.
  Settings are kept per viewer in `localStorage`. First setting:
  - **Layout diagnostics** (off by default): each text block is marked with
    how its lines were broken (`optimal`, `loose`, `emergency`, `overfull`;
    see `Quality` in `packages/typeset`). Non-optimal blocks get a coloured
    outline and a small label, and hovering shows the worst line's
    adjustment ratio. Later, the same switch can show size options and
    variant ids from the planner.
- Built by GitHub Actions and published to the `gh-pages` branch.

## License

Apache-2.0. Dependencies that ship (in the library or the demo site) must be
permissively licensed (MIT, ISC, BSD, Apache-2.0, …); fonts may be OFL-1.1.
Build and test tools may also be MPL-2.0, since they are never bundled.
Hyphenation patterns are licensed per language, and each language must be
reviewed and listed in `THIRD_PARTY_NOTICES.md` before use.
`pnpm licenses:check` enforces all of this and should run in CI.

Planned dependencies, all compatible: React, Motion, CodeMirror 6, KaTeX,
Shiki, Ajv (MIT); `yaml` (ISC); Playwright (Apache-2.0); Antonio font (OFL).

## Stack

TypeScript, pnpm workspaces, Vite, Vitest, fast-check, Playwright (screenshot
tests of typesetting and frames).

```
packages/typeset   Knuth–Plass + hyphenation + measurement cache
packages/core      measure, plan, arch paths, contracts (no DOM)
packages/render    React + Motion renderer of a MarkedTree
packages/plugins   schema-matched high-level variants
apps/demo          gh-pages site
```

## Open questions

None at the moment.
