/**
 * The right-hand view. Until the layout engine exists it typesets strings
 * (and other scalars); objects and arrays get a notice.
 */
import { canvasMeasure, prepare, renderLine, type Line, type Paragraph, type Prepared } from '@pocketview/typeset';
import { englishUS } from '@pocketview/typeset/en-us';
import type { Settings } from './settings';

export const FONT_SIZE = 18;
export const LINE_HEIGHT = 28;
export const FONT = `${FONT_SIZE}px "Source Serif 4"`;
const MEASURE = 36 * FONT_SIZE; // ~70 characters: a comfortable reading line
const GUTTER = 16;
const OVERSCAN = 30; // lines rendered above and below the visible window

export interface ViewStats {
  lines: number;
  words: number;
  millis: number;
  notOptimal: number; // lines whose paragraph was not set optimally
}

export class TextView {
  private readonly column: HTMLElement;
  private prepared: Prepared | null = null;
  private par: Paragraph | null = null;
  private width = 0;
  private rendered = new Map<number, HTMLElement>();
  private frame = 0;

  constructor(private readonly scroller: HTMLElement, private settings: Settings) {
    this.column = document.createElement('div');
    this.column.className = 'pv-text';
    scroller.addEventListener('scroll', () => this.schedule(), { passive: true });
    new ResizeObserver(() => this.relayout()).observe(scroller);
  }

  /** Shows `value`, returning stats for text or null for a notice. */
  show(value: unknown, settings: Settings): ViewStats | null {
    this.settings = settings;
    // Clear the previous render completely before drawing the new one.
    this.scroller.replaceChildren();
    this.column.replaceChildren();
    this.rendered.clear();
    this.prepared = null;
    this.par = null;
    this.width = 0;

    if (value !== null && typeof value === 'object') {
      this.scroller.append(notice(Array.isArray(value) ? 'array' : 'object'));
      return null;
    }
    const text = typeof value === 'string' ? value : String(value);
    const t0 = performance.now();
    this.prepared = prepare(text, {
      measure: canvasMeasure(FONT),
      lineHeight: LINE_HEIGHT,
      hyphenate: englishUS,
      align: settings.align,
      indent: settings.align === 'justify' ? 1.5 * FONT_SIZE : 0,
    });
    this.scroller.append(this.column);
    this.scroller.scrollTop = 0;
    this.relayout();
    const millis = performance.now() - t0;
    const par = this.par as Paragraph | null;
    const lines = par?.lines ?? [];
    return {
      lines: lines.length,
      words: text.split(/\s+/).filter(Boolean).length,
      millis,
      notOptimal: lines.filter((l) => l.quality !== 'optimal').length,
    };
  }

  private relayout(): void {
    if (!this.prepared) return;
    const avail = this.scroller.clientWidth - 2 * GUTTER;
    const width = Math.max(120, Math.min(MEASURE, Math.floor(avail)));
    if (width === this.width && this.par) return;
    const oldLines = this.par?.lines.length ?? 0;
    const topLine = this.scroller.scrollTop / LINE_HEIGHT;
    this.width = width;
    this.par = this.prepared.layout(width);
    this.column.style.width = `${width}px`;
    this.column.style.height = `${this.par.height}px`;
    this.column.classList.toggle('diagnostics', this.settings.diagnostics);
    for (const el of this.rendered.values()) el.remove();
    this.rendered.clear();
    if (oldLines > 0) {
      // Keep the reader at the same place in the text.
      this.scroller.scrollTop = (topLine * this.par.lines.length / oldLines) * LINE_HEIGHT;
    }
    this.paint();
  }

  private schedule(): void {
    if (!this.frame) this.frame = requestAnimationFrame(() => { this.frame = 0; this.paint(); });
  }

  /** Renders only the lines near the visible window. */
  private paint(): void {
    const par = this.par;
    if (!par) return;
    const top = this.scroller.scrollTop - this.column.offsetTop;
    const first = Math.max(0, Math.floor(top / LINE_HEIGHT) - OVERSCAN);
    const last = Math.min(par.lines.length, Math.ceil((top + this.scroller.clientHeight) / LINE_HEIGHT) + OVERSCAN);
    for (const [i, el] of this.rendered) {
      if (i < first || i >= last) { el.remove(); this.rendered.delete(i); }
    }
    for (let i = first; i < last; i++) {
      if (this.rendered.has(i)) continue;
      const line = par.lines[i]!;
      const el = renderLine(line, i, { lineHeight: LINE_HEIGHT });
      if (line.quality !== 'optimal') decorate(el, line);
      this.column.append(el);
      this.rendered.set(i, el);
    }
  }
}

function decorate(el: HTMLElement, line: Line): void {
  el.classList.add(`q-${line.quality}`);
  const ratio = Number.isFinite(line.ratio) ? line.ratio.toFixed(2) : '∞';
  el.dataset.quality = line.quality;
  el.title = `${line.quality} · adjustment ratio ${ratio}`;
}

function notice(kind: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'notice';
  el.innerHTML = `<h2>${kind}</h2>
    <p>Objects and arrays are laid out by the layout engine, which is the next
    part of pocketview to be built. For now the view typesets text: paste prose
    (it is read as plain text) or a JSON or YAML string.</p>`;
  return el;
}
