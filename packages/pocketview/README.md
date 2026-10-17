# pocketview

An embeddable JSON and YAML viewer, with publication-quality typesetting
and an automatic layout that decides what to show, where, and how.

**Demo:** https://frobnitzem.github.io/pocketview/

```sh
npm install pocketview
```

```ts
import { mount } from 'pocketview'; // its styles come with it

const viewer = mount(document.getElementById('box')!, { name: 'Ada', born: 1815 }, { label: 'person' });
viewer.on('open', (e) => console.log('opened', e.path)); // paths are JSON Pointers
```

This package is `@pocketview/view` under a shorter name. The other
packages are `@pocketview/core` (the layout engine), `@pocketview/typeset`
(Knuth-Plass line breaking) and `@pocketview/markdown` (the Markdown
plugin). Documentation: https://github.com/frobnitzem/pocketview

Apache-2.0.
