import type { Option, Variant } from '@pocketview/core';
import { isMarkdown } from './detect.js';

export interface MarkdownOptions {
  /**
   * Height of the rendered Markdown at `width` px. The engine never touches
   * the DOM, so the host measures (e.g. by rendering off-screen) and caches.
   */
  height(ptr: string, text: string, width: number): number;
  /** Priority over the built-in text displays (default 10). */
  priority?: number;
  /** Minimum height of the stretchable scroll box offered for long documents (default 112). */
  scrollMin?: number;
}

/** What a 'markdown' custom mark carries. */
export interface MarkdownData {
  text: string;
  full: number;
  scroll: boolean;
}

/** A display variant for strings that look like Markdown. */
export function markdownVariant(options: MarkdownOptions): Variant {
  const priority = options.priority ?? 10;
  const scrollMin = options.scrollMin ?? 112;
  return {
    id: 'markdown',
    layout: 'value',
    match: (n) => (n.kind === 'string' && isMarkdown(n.value as string) ? priority : null),
    measure(n, w) {
      const text = n.value as string;
      const full = Math.ceil(options.height(n.ptr, text, w));
      const weight = Math.min(4, 1 + text.length / 400);
      const opt = (h: number, scroll: boolean, s: number, stretch = 0): Option => ({
        w, h, s, stretch, v: { t: 'custom', variant: 'markdown', data: { text, full, scroll } satisfies MarkdownData },
      });
      const out = [opt(full, false, weight)];
      // A scroll box: a few lines at least, stretching up to the whole document.
      if (full > scrollMin + 28) out.push(opt(scrollMin, true, weight * (0.5 + 0.5 * scrollMin / full), full - scrollMin));
      return out;
    },
  };
}
