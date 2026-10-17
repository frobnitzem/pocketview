# pocketview — design

A viewer for JSON/YAML trees. The archived prototype (branch `archive`) had
the right core idea: size every element bottom-up, then let an automatic
layout decide what to show. This rewrite keeps that idea and adds what the
prototype lacked: publication-quality text, several display variants per
element, and navigation contracts so that browsing can never get stuck.

## Mental model

A viewer is one JavaScript object, built in layers. Each layer points only
at the layers above it, and each is either chosen (by the user or the
embedding page) or derived (recomputed, never stored as state).

```
document     the JSON and its node tree                      chosen: show(), update()
   ▲
layout spec  annotations over document nodes, by pointer     chosen: clicks
   ▲
plan         marks: what is shown, where, and how             derived
   ▲
cursor       the target: a container on the page              chosen: border clicks
```

**Paths are JSON Pointers** (RFC 6901) into the document the viewer shows:
`""` is its root, `/packages/0/role` a node below it, and `~1` stands for a
`/` inside a key. They are positions, not identities. The same pointers are
used inside the engine, in the layout spec, and in events.

**Document.** The JSON value, and a tree of nodes built from it (`ptr`,
`label`, `value`, `kind`, `children`). It is treated as immutable: changing
it means replacing a subtree, never mutating the caller's object.

**Layout spec** (`LayoutSpec` in core). Only what the user chose:
- `views`: what each container on the page shows, as slot → node. The slot
  `""` is the outermost frame, so re-rooting is opening into the outermost
  slot; a nested container shows itself unless it has an entry.
- `expanded`: nodes to show in preference to everything else (and past the
  depth limit). A list, since several can be expanded.
- `minified`: nodes to show collapsed (a chip or side-bar segment) even
  when there is room. The outermost choice wins: a minified node hides
  everything inside it, expanded or not. The rules keep the two lists
  apart (expanding a node un-minifies it and its ancestors; minifying one
  drops what was expanded inside it).
- `windows` and `offsets`: where array containers and the outer side bar
  are paged to.

**Plan** (`Planner.plan(spec, viewport)`). A pure function of document,
spec, viewport and theme, producing a flat list of positioned marks. Which
nodes are drawn in full and which are collapsed into chips or segments is
decided here, from the space available, and so is the depth limit (the
outer slot's node, plus four levels). Nothing in the plan is state.

**Cursor.** The target: which container clicks open into, or none. It
changes how clicks are read, never what is shown, so changing it redraws
the same plan.

**Sizes are cached per document node.** Intrinsic sizes (a string's height
at a width, a key column's width) depend only on the node. A container's
size options also depend on the layout spec, but only on the part inside
its own subtree, so navigating in one container leaves every other
container's cache intact. Replacing a subtree drops the cache of its nodes
and recomputes its ancestors.

**Every action follows one path.** A rule maps (spec, cursor, click) to a
new (spec, cursor) or a refusal. If the spec changed, the viewer re-plans;
then it draws, and emits one event carrying the viewer, the action and
the node's pointer. A refusal blinks the outer border instead.

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
| `crumb`     | breadcrumb: a square segment of a container's top bar (its nav bar)   |
| `menu`      | ancestor that didn't fit as a crumb, listed in a hamburger dropdown   |

Everything that sits in a bar is a **square** segment as tall as the bar,
labelled like side-bar segments, so all bars read as one system. That
covers breadcrumbs, paging arrows and collapsed children. Segments abut:
each is cut from its neighbours by background-coloured borders on both
sides (left and right in a top or bottom bar, top and bottom in a side
bar), so no bar colour shows between them. Every arch's top bar is its nav
bar: crumb segments, then its title. The outermost one holds only these. Other items
go in the bottom bars of `*B` frames. Capsules are used only for chips
inside a frame.

Clicking a `sidebar`, `chip` or `crumb` item moves the focus to that node.

### Colour roles

Colour encodes a node's **type** and its **display status**, the same way
everywhere a node appears (arches, key capsules, chips, side-bar segments,
breadcrumbs, title text):

| | pastel (default) |
|---|---|
| object | amber (every depth) |
| array | cream |
| scalar (string, number, boolean, null) | lavender |
| **target** (status) | purple |

Values themselves are coloured by JSON type: strings off-white, numbers
gold (tabular figures), booleans and null blue italic. Chip count badges
are pastel green.

### Display variants of containers

| type | variant | when |
|---|---|---|
| object | **arch** | the outermost frame: wide side bar of segments, paged by ▲ ▼ when they overflow |
| object | **frame** | nested: thin side bar, collapsed children as chips |
| array | **tags** | short scalars, inline next to a cream key capsule (bare) |
| array | **list** | vertical rows; objects as frames whose nav bars carry the array as a crumb (bare) |
| array | **container** | top and bottom bars (rounded outside, square inside), used only when the array overflows; shows a window of consecutive elements, drawn as usual, with the 1-based range (`6–8 of 12`) and ◀ ▶ in the bottom bar |

- **Bare arrays show every element.** They can't be targets; an array that
  doesn't fit uses a container.
- **An opened array is always a container,** because a target needs
  breadcrumbs.
- **Paging moves a page at a time.** ▶ starts after the last shown element.
  ◀ lays out the page ending just before the first shown element.
  Expanding an element pages its array so the element comes first.

### Targeting, opening and expanding

The **target** is the area where clicked things are drawn. Only objects
and arrays (arches, frames and containers) can be targets. Every container
on the page acts as a frame with its own nav bar: crumb segments for the
trail from the enclosing frame (an object in a bare array: `PACKAGES` then
the title `0`), then its title.
- **Targeted** (the default is the outermost frame; the target's border is
  purple): clicking a chip, segment or key **opens** that node into the
  target.
  - The node must lie under what the target shows; otherwise the outer
    border **blinks** and nothing changes.
  - Opening into the outermost frame re-roots the view: its top bar's
    breadcrumbs extend to the node.
  - Opening into a nested container redraws that container's area (its
    *slot*, `views` in the layout spec) with the node, titled by it, with
    crumbs from the container to it (`B` `C`, title `x`). The root stays at
    the top, and the container stays where it was.
  - An opened object becomes an arch or frame; an opened array becomes a
    container; an opened scalar is shown under a bar carrying its trail.
    The outermost scalar bar is not a target.
- **Titles activate their node**: targeted, the title opens it (subject to
  the rule above); untargeted, it toggles it, like a key (below).
- **Breadcrumbs operate on the container they belong to.** The outermost
  bar's crumbs (and menu items) re-root there, keeping the target. In the
  target's own nav bar, a crumb shows that step in it; a step at or above
  the container's own node shows the container itself. Any other
  container's crumbs activate their node, like a title.
- **Only clicking a border changes the target**: it toggles whether its
  container is the target, in place. Targeting never opens anything.
- **Untargeted**: clicking a collapsed node (chip or segment) **expands**
  it: it is drawn inside its parent, siblings drop out to make room, and
  breadcrumbs don't change (`expanded` and `windows` in the layout spec;
  expanded nodes may go past the depth limit). Clicking a key, or a nested
  container's title, **toggles** its node: one that is expanded or shown
  is **minified** (collapsed even when there is room); one that is
  minified or collapsed is expanded. A click that changes nothing (no
  room, or nowhere to collapse to) blinks the outer border.
- **Paging arrows work in both states.** Escape shows the parent of what
  the target shows.

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
  | { kind: 'crumb'; text: string; slot: string }   // breadcrumb in slot's nav bar
  | { kind: 'menu'; items: { ptr; text }[]; slot: string }; // crumbs that didn't fit

interface Plan { focus: string; marks: Mark[]; width: number; height: number; overflow: boolean }
```

Marks are a flat list, each with a `rect` in viewport coordinates and the
JSON Pointer of its node. A node can have several marks (a row's `key` and
its `token`), and nodes without marks are not shown. Pointers give the
renderer stable keys to animate between two plans. `chip`, `segment`,
`crumb`, `title` and `key` marks are navigable (see targeting above).

## Variants and plugins

Every display is a **variant** (`packages/core/src/variant.ts`):

```ts
interface Variant {
  id: string;                          // 'core/frame', 'markdown', …
  layout: 'value' | 'block';           // beside a key capsule, or the full row
  match(node): number | null;          // priority, or null if it doesn't apply
  measure(node, maxW, m): Option[];    // the node's display options at a width
}
```

- **Choosing variants.** For each node, the engine runs every variant's
  `match` and keeps those with the highest priority. All of their options
  go into the layout search, which picks between them by size and by how
  much they show.
  - A plugin with a higher priority than the built-ins (0; plugins use 10)
    replaces the built-in displays of the nodes it matches.
  - Variants of equal priority compete on layout.
- **Conflicts go to the outermost node.** A variant that displays a
  container measures its whole subtree itself, so plugins matching nodes
  inside it aren't consulted unless it hands a child back
  (`m.childOptions`). For example, an object matched by a schema plugin
  wins over the markdown plugin on a string inside it.
- **Built-in variants:**
  - `core/scalar`: a token, wrapped plain text, or typeset text.
  - `core/array`: bare tags or a list.
  - `core/container`: the paged array container.
  - `core/frame`: a nested object.
  - The outermost `arch` and the opened-scalar `bar` are placed by the
    planner itself.
- **Plugin options and marks.** A plugin's options carry
  `{ t: 'custom', variant, data }`, and the planner turns a chosen one into
  a `custom` mark. The host registers a renderer for each custom variant.
  The engine never touches the DOM, so a plugin that needs measuring (like
  markdown) asks the host for heights.
- **Text.** Strings up to `longText` (280) characters without a line break
  wrap plainly (ragged right, no hyphens). Longer ones are typeset with
  Knuth–Plass.
- **Markdown** (`packages/markdown`) is the first plugin. A string counts as
  Markdown if it has at least two lines starting with ```` ``` ````, at
  least three lines starting with `#`, `-` or `*`, or a Markdown link or
  image.
  - Rendering uses `markdown-it` with raw HTML disabled; its link
    validation refuses `javascript:` and similar URLs.
  - The output is sanitized again by DOMPurify, and links open in a new tab
    with `noopener noreferrer`.
  - The demo measures Markdown by rendering it off-screen at the asked width.

Planned plugins: GeoJSON → map, `{type:"image", data:base64}` → image,
molfile → molecule, and code highlighting.

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

**Elastic heights.** An option has a minimum height `h` and a `stretch`.
- The search compares options by their minimum heights.
- After choosing, the planner hands leftover height down the tree, like
  TeX's glue: expanded rows get it first, then rows in document order.
- A text or Markdown scroll box is at least four lines tall and stretches up
  to its full content, so a text grows into whatever room is left.

**Array containers show as much of their first element as they can.** The
first element counts 100× when windows are compared, and more elements are
added only when it is shown at its richest option with no stretch left. A
book's `chapters`, opened, therefore reads as a paged reader: one chapter
per page, its text filling the page, ◀ ▶ for the previous and next chapter.

**The page never scrolls.** The outermost container always fills the view
exactly, and its borders stay put. Content that still doesn't fit after
collapsing, paging and shrinking scroll boxes scrolls *inside* the
container (`plan.scroll`; marks with `scrolled`). This is a last-resort
variant: the plan avoids it whenever another choice fits.

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
- Colour schemes, chosen in settings; each should look distinct. Every
  colour is a CSS variable set per `[data-theme]`.
  - **Pastel** (the default): amber, peach and pastel green frames,
    lavender keys, a beachy aqua send button.
  - **Lux**: forest green, violet and cyan arches on deep green, with
    steel-gray keys, yellow chips and magenta accents.
  - **Solarized dark and light**: these use Solarized's swap of base tones
    between light and dark (base03 ↔ base3, base02 ↔ base2, base01 ↔ base1,
    base00 ↔ base0).
    - Backgrounds and body text follow Solarized's usage.
    - Arches and chips take the complementary end of the scale: light
      arches on the dark background, dark arches on the light one.
    - Key capsules act as a third background: Solarized green in dark mode,
      and a lightened green in light mode.
    - Accents are kept for value text, buttons and the urgent colour.
    - Text is always a content tone or an accent. Labels on arches and
      chips use the other mode's content tone (base01 on light arches,
      base1 on dark ones). Titles are emphasized content, and the focused
      title is yellow.
    - Exception: text on a filled accent (key capsules, badges, the urgent
      bar, the send button) uses a base tone, as Solarized does for
      selections, because no content tone is legible there.
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
