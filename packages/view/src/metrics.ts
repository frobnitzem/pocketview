/**
 * Measuring in the browser, per viewer: canvas widths in the fonts the marks
 * are drawn in, prepared paragraphs, and Markdown heights. Caches are keyed
 * by pointer (and width), and each entry keeps the text it was made from:
 * a node whose text changed is measured afresh, without putting arbitrarily
 * long text in a key.
 */
import type { Mark, Metrics, TextStyle, Variant } from '@pocketview/core';
import { markdownVariant, renderMarkdown, type MarkdownData } from '@pocketview/markdown';
import { canvasMeasure, prepare, type Prepared } from '@pocketview/typeset';
import { englishUS } from '@pocketview/typeset/en-us';
import { FONT, FONT_SIZE, LINE_HEIGHT } from './text';

export const KEY_FONT = '600 14px Antonio';
const KEY_TRACKING = 0.05 * 14; // letter-spacing of key labels (.05em), per character

export interface BrowserMetrics extends Metrics {
  /** The paragraph prepared for `text` at `ptr` (cached while the text is unchanged). */
  prepared(ptr: string, text: string, style: TextStyle): Prepared;
}

/** A cache whose entries remember the text they were computed from. */
function textCache<T>(): (key: string, text: string, compute: () => T) => T {
  const entries = new Map<string, { text: string; value: T }>();
  return (key, text, compute) => {
    const hit = entries.get(key);
    if (hit && hit.text === text) return hit.value;
    const value = compute();
    entries.set(key, { text, value });
    return value;
  };
}

export function browserMetrics(): BrowserMetrics {
  const key = canvasMeasure(KEY_FONT);
  const value = canvasMeasure(FONT);
  const paragraphs = textCache<Prepared>();
  // Plain text wraps ragged-right without hyphens; typeset text is justified.
  const prepared = (ptr: string, text: string, style: TextStyle) => paragraphs(`${style}|${ptr}`, text, () => prepare(text,
    style === 'typeset'
      ? { measure: value, lineHeight: LINE_HEIGHT, hyphenate: englishUS, paragraphSpacing: FONT_SIZE / 2 }
      : { measure: value, lineHeight: LINE_HEIGHT, align: 'left', hyphenate: null, paragraphSpacing: FONT_SIZE / 2 }));
  return {
    key: (s) => key(s.toUpperCase()) + KEY_TRACKING * s.length,
    value: (s) => value(s),
    text: (ptr, s, style = 'typeset') => ({ height: (w) => prepared(ptr, s, style).layout(w).height }),
    prepared,
  };
}

/**
 * Display variants beyond the built-in ones (see `Variant` in core), for one
 * viewer. Markdown is measured by rendering it off-screen at the asked
 * width, in the styles it is drawn with (the engine never touches the DOM).
 */
export function plugins(): Variant[] {
  const heights = textCache<number>();
  const height = (ptr: string, text: string, width: number) => heights(`${width}|${ptr}`, text, () => {
    const probe = renderMarkdown(text);
    Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', left: '-10000px', top: '0', width: `${width}px` });
    document.body.append(probe);
    const h = probe.getBoundingClientRect().height;
    probe.remove();
    return h;
  });
  return [markdownVariant({ height })];
}

/** How each plugin variant's 'custom' marks are drawn. */
export const RENDERERS: Record<string, (mark: Extract<Mark, { kind: 'custom' }>, el: HTMLElement) => void> = {
  markdown(mark, el) {
    const data = mark.data as MarkdownData;
    el.append(renderMarkdown(data.text));
    if (data.scroll) el.classList.add('scroll');
  },
};
