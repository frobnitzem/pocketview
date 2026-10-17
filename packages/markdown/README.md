# @pocketview/markdown

A [pocketview](https://github.com/frobnitzem/pocketview) display plugin:
strings that look like Markdown are rendered as Markdown. It is also the
reference example of a pocketview plugin.

Rendering is protected against cross-site scripting: markdown-it runs
without raw HTML, and its output is sanitized with DOMPurify.

```ts
import { isMarkdown, markdownVariant, renderMarkdown } from '@pocketview/markdown';
```

`@pocketview/view` uses it by default. Apache-2.0.
