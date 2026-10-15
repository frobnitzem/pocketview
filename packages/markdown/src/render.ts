import DOMPurify from 'dompurify';
import MarkdownIt from 'markdown-it';

// Raw HTML in the source is disabled, and markdown-it refuses javascript:,
// vbscript:, file: and most data: URLs in links. The output is sanitized
// again by DOMPurify before it reaches the page.
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

/** Renders Markdown to sanitized, inert HTML inside a `.pv-md` element. */
export function renderMarkdown(text: string, doc: Document = document): HTMLElement {
  const el = doc.createElement('div');
  el.className = 'pv-md';
  const purify = DOMPurify(doc.defaultView as Window & typeof globalThis);
  el.innerHTML = purify.sanitize(md.render(text), { USE_PROFILES: { html: true } });
  for (const a of el.querySelectorAll('a')) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  return el;
}
