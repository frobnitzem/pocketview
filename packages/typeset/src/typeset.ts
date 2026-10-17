/** High-level API: prepare a text once, lay it out at any width. */
import { format, type Align, type FormatOptions } from './format.js';
import type { Hyphenator } from './hyphenate.js';
import { breakGreedy, breakLines, lineStartAfter, type Break, type BreakOptions } from './linebreak.js';
import type { Measure } from './measure.js';
import type { Node } from './nodes.js';

export interface TypesetOptions {
  measure: Measure;
  lineHeight: number;
  align?: Align;
  hyphenate?: Hyphenator | null;
  /** First-line indent of paragraphs, in px (book style). */
  indent?: number;
  /** Indent the first paragraph too (books usually don't). */
  indentFirst?: boolean;
  /** Extra vertical space after each paragraph but the last, in px. */
  paragraphSpacing?: number;
  /** Tolerances tried in order before falling back to emergency breaking. */
  tolerances?: number[];
  breakOptions?: Partial<Omit<BreakOptions, 'tolerance'>>;
}

/** A run of text drawn at `x`: one word, possibly ending in a hyphen. */
export interface LineItem {
  text: string;
  x: number;
  width: number;
}

export interface Line {
  /** Words joined by single spaces, plus a trailing hyphen if broken there. */
  text: string;
  items: LineItem[];
  /** Target width of this line. */
  width: number;
  /** Width of the content at natural spacing. */
  natural: number;
  ratio: number;
  hyphenated: boolean;
  /** Stretch to the full width (false for paragraph-final and ragged lines). */
  justify: boolean;
  /** Extra space per interword gap (negative when shrunk), to reach `width`. */
  wordSpacing: number;
  /** x of the first word (the paragraph indent, on a paragraph's first line). */
  indent: number;
  /** Top of the line, from the top of the text (includes paragraph spacing). */
  y: number;
  /** Last line of its paragraph. */
  endsParagraph: boolean;
  /** How the breaks of this line's paragraph were found. */
  quality: Quality;
}

/**
 * How the breaks were found:
 * - optimal: every line within tolerance;
 * - loose: some lines looser than tolerance (looseness spread out);
 * - emergency: words split between characters to fit;
 * - overfull: even that failed; some lines overflow.
 */
export type Quality = 'optimal' | 'loose' | 'emergency' | 'overfull';

export interface Paragraph {
  lines: Line[];
  height: number;
  /** The worst quality of any paragraph in the text. */
  quality: Quality;
}

const QUALITY_ORDER: Quality[] = ['optimal', 'loose', 'emergency', 'overfull'];
const worse = (a: Quality, b: Quality): Quality =>
  QUALITY_ORDER.indexOf(a) >= QUALITY_ORDER.indexOf(b) ? a : b;

export interface Prepared {
  layout(widths: number | readonly number[]): Paragraph;
  /** Height at each of the given single-column widths. */
  heights(widths: readonly number[]): number[];
  /** Widest unbreakable piece, and widest paragraph set on one line. */
  readonly minWidth: number;
  readonly maxWidth: number;
}

/**
 * Each line of `text` (split on newlines) is a paragraph, broken on its own:
 * a hard paragraph falls back to looser settings without affecting the rest.
 */
export function prepare(text: string, options: TypesetOptions): Prepared {
  const align = options.align ?? 'justify';
  const tolerances = options.tolerances ?? (align === 'justify' ? [1, 1.5, 3] : [1, 3]);
  const base = { measure: options.measure, align, hyphenate: options.hyphenate ?? null };
  const paragraphs = text.replace(/\r\n?/g, '\n').split('\n').map((para, i) => {
    const indent = options.indent && (i > 0 || options.indentFirst) && para.trim() ? options.indent : 0;
    const fmt = { ...base, indent };
    return { text: para, fmt, nodes: format(para, fmt) };
  });
  const cache = new Map<string, Paragraph>();

  let minWidth = 0;
  let maxWidth = 0;
  for (const { nodes } of paragraphs) {
    let run = 0;
    for (const node of nodes) {
      if (node.type === 'box') minWidth = Math.max(minWidth, node.width);
      if (node.type !== 'penalty') run += node.width;
    }
    maxWidth = Math.max(maxWidth, run);
  }

  function layout(w: number | readonly number[]): Paragraph {
    const widths = typeof w === 'number' ? [w] : w;
    const key = widths.join(',');
    const hit = cache.get(key);
    if (hit) return hit;
    const lines: Line[] = [];
    let quality: Quality = 'optimal';
    let y = 0;
    paragraphs.forEach((para, p) => {
      const ws = widths.slice(Math.min(lines.length, widths.length - 1));
      const set = breakParagraph(para.text, para.fmt, para.nodes, ws);
      for (const line of set) {
        line.y = y;
        y += options.lineHeight;
        lines.push(line);
      }
      if (p < paragraphs.length - 1) y += options.paragraphSpacing ?? 0;
      quality = worse(quality, set[0]?.quality ?? 'optimal');
    });
    const result = { lines, height: y, quality };
    cache.set(key, result);
    return result;
  }

  function breakParagraph(
    para: string, fmt: FormatOptions, nodes: readonly Node[], widths: readonly number[],
  ): Line[] {
    for (const tolerance of tolerances) {
      const breaks = breakLines(nodes, widths, { ...options.breakOptions, tolerance });
      if (breaks) return build(nodes, breaks, widths, 'optimal');
    }
    const narrow = Math.min(...widths);
    const loose = { ...options.breakOptions, tolerance: Infinity, emergencyStretch: narrow / 10 };
    const breaks = breakLines(nodes, widths, loose);
    if (breaks) return build(nodes, breaks, widths, 'loose');
    const emergency = format(para, { ...fmt, splitWiderThan: narrow });
    const split = breakLines(emergency, widths, loose);
    return split
      ? build(emergency, split, widths, 'emergency')
      : build(emergency, breakGreedy(emergency, widths), widths, 'overfull');
  }

  function build(ns: readonly Node[], breaks: Break[], widths: readonly number[], quality: Quality): Line[] {
    let prev = -1;
    return breaks.map((br, i) => {
      const width = widths[Math.min(i, widths.length - 1)]!;
      const line = makeLine(ns, lineStartAfter(ns, prev), br, width, align, quality);
      prev = br.position;
      return line;
    });
  }

  return {
    layout,
    heights: (ws) => ws.map((w) => layout(w).height),
    minWidth,
    maxWidth,
  };
}

function makeLine(
  nodes: readonly Node[], start: number, br: Break, width: number, align: Align, quality: Quality,
): Line {
  const end = nodes[br.position]!;
  const r = Number.isFinite(br.ratio) ? br.ratio : 0;
  const items: LineItem[] = [];
  let x = 0;
  let natural = 0;
  let joined = false; // next box continues the current word
  for (let i = start; i < br.position; i++) {
    const node = nodes[i]!;
    if (node.type === 'box') {
      const last = items[items.length - 1];
      if (joined && last && last.text !== '') {
        last.text += node.text;
        last.width += node.width;
      } else {
        items.push({ text: node.text, x, width: node.width });
      }
      x += node.width;
      natural += node.width;
      joined = true;
    } else if (node.type === 'glue') {
      x += node.width + r * (r < 0 ? node.shrink : node.stretch);
      natural += node.width;
      joined = false;
    }
    // A penalty that isn't the break leaves the word joined.
  }
  const hyphenated = end.type === 'penalty' && end.text !== '';
  const lastItem = items[items.length - 1];
  if (hyphenated && lastItem && end.type === 'penalty') {
    lastItem.text += end.text;
    lastItem.width += end.width;
    natural += end.width;
  }
  const endsParagraph = end.type === 'penalty' && end.penalty <= -10000;
  const words = items.filter((it) => it.text !== '');
  const gaps = words.length - 1;
  const justify = align === 'justify' && !endsParagraph && gaps > 0;
  return {
    text: words.map((it) => it.text).join(' '),
    items: words,
    width,
    natural,
    ratio: br.ratio,
    hyphenated,
    justify,
    wordSpacing: justify ? (width - natural) / gaps : 0,
    indent: words[0]?.x ?? 0,
    y: 0, // set by layout()
    endsParagraph,
    quality,
  };
}
