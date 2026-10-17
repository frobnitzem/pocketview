# @pocketview/view

An embeddable JSON and YAML viewer, with publication-quality typesetting
and an automatic layout that decides what to show, where, and how.

**Demo:** https://frobnitzem.github.io/pocketview/

```sh
npm install @pocketview/view
```

```ts
import { mount } from '@pocketview/view'; // its styles come with it

const viewer = mount(document.getElementById('box')!, { name: 'Ada', born: 1815 }, { label: 'person' });
viewer.on('open', (e) => console.log('opened', e.path)); // paths are JSON Pointers
viewer.update('/born', 1816);                              // keeps the navigation
```

The element needs a definite width and height. The layout fills it
exactly and never scrolls the page.

Without a bundler, use the single-file build in `bundle/`, for example from
a CDN:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@pocketview/view@2/bundle/pocketview.css">
<div id="box" style="width: 720px; height: 480px"></div>
<script type="module">
  import { mount } from 'https://cdn.jsdelivr.net/npm/@pocketview/view@2/bundle/pocketview.js';
  mount(document.getElementById('box'), { name: 'Ada', born: 1815 });
</script>
```

The full API (actions, events, updates, themes) is in the
[repository README](https://github.com/frobnitzem/pocketview#embedding).

Apache-2.0. The bundle includes third-party code and fonts under their own
licences; see `bundle/licenses/`.
