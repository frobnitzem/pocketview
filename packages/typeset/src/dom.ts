/** Draws a laid-out paragraph as DOM elements. The browser never re-wraps it. */
import type { Line, Paragraph } from './typeset.js';

export interface RenderOptions {
  lineHeight: number;
  /**
   * 'css': one element per line, justified by the browser (exact flush edge).
   * 'positioned': every word placed at its computed x.
   */
  mode?: 'css' | 'positioned';
  className?: string;
}

/** One absolutely positioned line element, placed at `line.y`. */
export function renderLine(line: Line, options: RenderOptions, doc: Document = document): HTMLElement {
  const { lineHeight, mode = 'css' } = options;
  const el = doc.createElement('div');
  el.className = 'pv-line';
  Object.assign(el.style, {
    position: 'absolute',
    left: `${line.indent}px`,
    top: `${line.y}px`,
    width: `${line.width - line.indent}px`,
    height: `${lineHeight}px`,
    whiteSpace: 'nowrap',
  });
  if (mode === 'css') {
    // CSS justification only widens spaces, so shrinking needs explicit
    // word-spacing. Set the line 1px short and let justify absorb the rest:
    // DOM and canvas widths can differ by a fraction of a pixel (hinting).
    const align = line.justify ? 'justify' : 'left';
    el.style.textAlign = align;
    el.style.textAlignLast = align;
    if (line.justify) {
      const gaps = Math.max(1, line.items.length - 1);
      el.style.wordSpacing = `${(line.wordSpacing - 1 / gaps).toFixed(3)}px`;
    }
    el.textContent = line.text;
  } else {
    for (const item of line.items) {
      const span = doc.createElement('span');
      span.style.position = 'absolute';
      span.style.left = `${item.x - line.indent}px`;
      span.textContent = item.text;
      el.appendChild(span);
    }
  }
  return el;
}

/** A container holding every line of the paragraph. */
export function renderLines(par: Paragraph, options: RenderOptions, doc: Document = document): HTMLElement {
  const root = doc.createElement('div');
  root.className = options.className ?? 'pv-text';
  const width = Math.max(0, ...par.lines.map((l) => l.width));
  Object.assign(root.style, {
    position: 'relative',
    width: `${width}px`,
    height: `${par.height}px`,
    lineHeight: `${options.lineHeight}px`,
    fontKerning: 'normal',
  });
  for (const line of par.lines) root.appendChild(renderLine(line, options, doc));
  return root;
}
