# pocketview

A viewer for JSON and YAML trees, with publication-quality typesetting and
an automatic layout that decides what to show, where, and how.

**Demo:** https://frobnitzem.github.io/pocketview/ (paste JSON, YAML or plain
text on the left, press the blue arrow). Text is typeset; objects and arrays
are laid out in arch frames and can be navigated by clicking.

- `DESIGN.md`: the design (pipeline, arch frames, marked tree, contracts).
- `packages/typeset`: Knuth–Plass line breaking with hyphenation.
- `packages/core`: the layout engine (measure, plan, navigation contracts)
  and the display-variant plugin interface.
- `packages/markdown`: the Markdown plugin (detection, sanitized rendering).
- `packages/view`: the embeddable viewer (`mount()`), its styles and fonts.
- `apps/demo`: the demo site, published to the `gh-pages` branch by
  `.github/workflows/pages.yml`.

```sh
pnpm install
pnpm test            # unit and property tests
pnpm e2e             # Playwright (set PLAYWRIGHT_CHROMIUM to reuse a local Chromium)
pnpm --filter @pocketview/demo dev
pnpm licenses:check  # dependency licences are compatible with Apache-2.0
```

## Embedding

A pocketview is drawn into any element with a definite width and height.
The layout fills that box exactly and never scrolls the page; only long
text scrolls, inside its own frame. When the box is resized, the layout is
redone.

### From the built bundle

The demo site serves the bundle: one ES module with every dependency
included, and one stylesheet with the fonts inlined. Copy both files, and
the `licenses/` folder beside them, to your own server, so your page
doesn't change when the demo is updated.

- https://frobnitzem.github.io/pocketview/lib/pocketview.js
- https://frobnitzem.github.io/pocketview/lib/pocketview.css

The bundle is also built by `pnpm --filter @pocketview/view build`, into
`packages/view/dist`.

```html
<link rel="stylesheet" href="/vendor/pocketview.css">
<div id="box" style="width: 720px; height: 480px"></div>
<script type="module">
  import { mount } from '/vendor/pocketview.js';
  const viewer = mount(document.getElementById('box'), { name: 'Ada', born: 1815 }, { label: 'person' });
</script>
```

There is a working example at
https://frobnitzem.github.io/pocketview/embed.html (its source is
`apps/demo/public/embed.html`).

### From source, with a bundler

The packages are not published to npm yet. In a pnpm workspace (or by
copying `packages/` into one), depend on `@pocketview/view` and import it.
Its stylesheet comes with the module:

```ts
import { mount } from '@pocketview/view';
```

### API

`mount(element, value?, options?)` (or `new Viewer(element, value?,
options?)`) returns a `Viewer`. With a `value`, the document is shown once
the fonts have loaded. Paths everywhere are JSON Pointers (RFC 6901) into
the document: `""` is its root, and `/packages/0/role` is the `role` of the
first package.

| option | default | |
|---|---|---|
| `label` | the root's type | the document root's name, shown as its title |
| `theme` | `'pastel'` | `'pastel'`, `'lux'`, `'solar-dark'` or `'solar-light'` |
| `align` | `'justify'` | long text justified, or `'left'` (ragged right) |
| `diagnostics` | `false` | mark lines that could not be broken optimally |

| `Viewer` method | |
|---|---|
| `show(value, label?)` | shows a new document and resets navigation; returns what was drawn and the time taken |
| `setTheme(theme)` | switches colour scheme (sets `data-theme` on the element) |
| `configure({ align, diagnostics })` | changes the text settings and redraws |
| `on(type, listener)` | calls `listener(event)` after each change of that type (or `'*'` for all); returns an unsubscribe function |
| `spec`, `target` | the current layout spec and target (read only; see DESIGN.md, "Mental model") |
| `destroy()` | removes the drawing and stops observing the element |

Events are delivered after the change has been drawn, as
`{ type, viewer, path, slot? }`:

| `type` | when | `path` |
|---|---|---|
| `target` | a border click targets or un-targets a container | what the target shows, or `null` |
| `open` | a node opens into the target (re-rooting, when the target is the outermost frame) | the node; `slot` is the container it opened into (`""` for the outermost) |
| `expand` | a node is expanded in place | the node |
| `minify` | a node is collapsed even though there is room | the node |
| `page` | an array container or the side bar moves by a page | the container |
| `refuse` | a click changed nothing (the outer border blinks) | the node clicked |

Call `show` only after `fontsReady()` has resolved, because the layout is
measured in the bundled fonts. `mount` waits for them itself.

A document that is one plain string is shown as a scrolling reading view,
typeset at a comfortable measure. Anything else (objects, arrays, Markdown)
is laid out in arch frames.

Every colour is a CSS variable set on the viewer element (see
`packages/view/src/pocketview.css`). To restyle a scheme, override them,
for example `#box { --frame: teal; }`. The page's own colours are not
touched.

Strings are always inserted as text. Markdown is rendered without raw HTML
and then sanitized with DOMPurify.

The bundle includes third-party code under its own licences: markdown-it
(MIT), DOMPurify (Apache-2.0), hyphen and its en-us patterns, and the
Antonio and Source Serif 4 fonts (OFL). Their notices are in `licenses/`
next to the bundle; keep them with it.

The original 2017 prototype is on the `archive` branch.

Licensed under the Apache License 2.0. See `LICENSE`, `NOTICE` and
`THIRD_PARTY_NOTICES.md`.
