/** High-level API: prepare a text once, lay it out at any width. */
import { format, type Align } from './format';
import type { Hyphenator } from './hyphenate';
import { breakGreedy, breakLines, lineStartAfter, type Break, type BreakOptions } from './linebreak';
import type { Measure } from './measure';
import type { Node } from './nodes';

export interface TypesetOptions {
  measure: Measure;
  lineHeight: number;
  align?: Align;
  hyphenate?: Hyphenator | null;
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
  quality: Quality;
}

export interface Prepared {
  layout(widths: number | readonly number[]): Paragraph;
  /** Height at each of the given single-column widths. */
  heights(widths: readonly number[]): number[];
  /** Widest unbreakable piece, and widest paragraph set on one line. */
  readonly minWidth: number;
  readonly maxWidth: number;
}

export function prepare(text: string, options: TypesetOptions): Prepared {
  const align = options.align ?? 'justify';
  const tolerances = options.tolerances ?? (align === 'justify' ? [1, 1.5, 3] : [1, 3]);
  const fmt = { measure: options.measure, align, hyphenate: options.hyphenate ?? null };
  const nodes = format(text, fmt);
  const cache = new Map<string, Paragraph>();

  let minWidth = 0;
  let maxWidth = 0;
  let run = 0;
  for (const node of nodes) {
    if (node.type === 'box') minWidth = Math.max(minWidth, node.width);
    if (node.type === 'penalty' && node.penalty <= -10000) {
      maxWidth = Math.max(maxWidth, run);
      run = 0;
    } else if (node.type !== 'penalty') {
      run += node.width;
    }
  }

  function layout(w: number | readonly number[]): Paragraph {
    const widths = typeof w === 'number' ? [w] : w;
    const key = widths.join(',');
    const hit = cache.get(key);
    if (hit) return hit;

    let result: Paragraph | null = null;
    for (const tolerance of tolerances) {
      const breaks = breakLines(nodes, widths, { ...options.breakOptions, tolerance });
      if (breaks) {
        result = build(nodes, breaks, widths, 'optimal');
        break;
      }
    }
    const narrow = Math.min(...widths);
    if (!result) {
      const breaks = breakLines(nodes, widths, {
        ...options.breakOptions, tolerance: Infinity, emergencyStretch: narrow / 10,
      });
      if (breaks) result = build(nodes, breaks, widths, 'loose');
    }
    if (!result) {
      const emergency = format(text, { ...fmt, splitWiderThan: narrow });
      const breaks = breakLines(emergency, widths, {
        ...options.breakOptions, tolerance: Infinity, emergencyStretch: narrow / 10,
      });
      result = breaks
        ? build(emergency, breaks, widths, 'emergency')
        : build(emergency, breakGreedy(emergency, widths), widths, 'overfull');
    }
    cache.set(key, result);
    return result;
  }

  function build(ns: readonly Node[], breaks: Break[], widths: readonly number[], quality: Quality): Paragraph {
    const lines: Line[] = [];
    let prev = -1;
    breaks.forEach((br, i) => {
      const width = widths[Math.min(i, widths.length - 1)]!;
      lines.push(makeLine(ns, lineStartAfter(ns, prev), br, width, align));
      prev = br.position;
    });
    return { lines, height: lines.length * options.lineHeight, quality };
  }

  return {
    layout,
    heights: (ws) => ws.map((w) => layout(w).height),
    minWidth,
    maxWidth,
  };
}

function makeLine(nodes: readonly Node[], start: number, br: Break, width: number, align: Align): Line {
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
      if (joined && last) {
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
  const gaps = items.filter((it) => it.text !== '').length - 1;
  const justify = align === 'justify' && !endsParagraph && gaps > 0;
  return {
    text: items.map((it) => it.text).join(' '),
    items: items.filter((it) => it.text !== ''),
    width,
    natural,
    ratio: br.ratio,
    hyphenated,
    justify,
    wordSpacing: justify ? (width - natural) / gaps : 0,
  };
}
