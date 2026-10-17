/** Turns plain text into Knuth–Plass boxes, glue and penalties. */
import type { Hyphenator } from './hyphenate.js';
import type { Measure } from './measure.js';
import { box, FILL, glue, INFINITY, penalty, type Node } from './nodes.js';

export type Align = 'justify' | 'left';

export interface FormatOptions {
  measure: Measure;
  align: Align;
  hyphenate?: Hyphenator | null;
  hyphenPenalty?: number;
  /** Width of an empty box starting each non-empty paragraph (first-line indent). */
  indent?: number;
  /**
   * Emergency mode: pieces wider than this are split between characters,
   * so that no box is wider than the narrowest line.
   */
  splitWiderThan?: number;
}

/** Why a word may break between two pieces. */
type Joint = 'hyphen' | 'explicit' | 'soft' | 'char';

interface Piece {
  text: string;
  joint: Joint | null; // break opportunity after this piece
}

// Whitespace, except no-break spaces, separates words.
const SPACE = /[^\S   ]+/;
const DASH = /(?<=[^-‐–—])([-‐–—]+)(?=[^-‐–—])/u;
const WORD = /^([^\p{L}\p{M}]*)([\p{L}\p{M}]+)([^\p{L}\p{M}]*)$/u;
// Tokens such as URLs and paths may break after these, without a hyphen.
const SOFT_AFTER = new Set(['/', '.', '?', '&', '=', '_', ',', ':', ';', '#', '\\']);
const LONG_TOKEN = 12;

const graphemes: (s: string) => string[] =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? (() => {
        const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
        return (s: string) => Array.from(seg.segment(s), (g) => g.segment);
      })()
    : (s: string) => Array.from(s);

function splitWord(word: string, hyphenate: Hyphenator | null): Piece[] {
  const out: Piece[] = [];
  const parts = word.split(DASH); // [text, dash, text, dash, ...]
  for (let i = 0; i < parts.length; i += 2) {
    let part = parts[i]!;
    const dash = parts[i + 1];
    if (dash !== undefined) part += dash;
    const sub = splitPart(part, hyphenate);
    if (dash !== undefined) sub[sub.length - 1]!.joint = 'explicit';
    out.push(...sub);
  }
  return out.filter((p) => p.text.length > 0);
}

function splitPart(part: string, hyphenate: Hyphenator | null): Piece[] {
  const m = WORD.exec(part);
  if (m && hyphenate) {
    const [, lead = '', core = '', trail = ''] = m;
    const syl = hyphenate(core);
    if (syl.length > 1 && syl.join('') === core) {
      syl[0] = lead + syl[0];
      syl[syl.length - 1] += trail;
      return syl.map((text, k) => ({ text, joint: k < syl.length - 1 ? 'hyphen' : null }));
    }
  }
  if (!m && part.length > LONG_TOKEN) {
    const out: Piece[] = [];
    let start = 0;
    for (let k = 1; k < part.length; k++) {
      const c = part[k - 1]!;
      if (SOFT_AFTER.has(c) && !SOFT_AFTER.has(part[k]!)) {
        out.push({ text: part.slice(start, k), joint: 'soft' });
        start = k;
      }
    }
    out.push({ text: part.slice(start), joint: null });
    return out;
  }
  return [{ text: part, joint: null }];
}

function splitWide(pieces: Piece[], word: string, measure: Measure, limit: number): Piece[] {
  const out: Piece[] = [];
  let offset = 0;
  for (const p of pieces) {
    const w = measure(word.slice(0, offset + p.text.length)) - measure(word.slice(0, offset));
    offset += p.text.length;
    if (w <= limit) {
      out.push(p);
      continue;
    }
    const chars = graphemes(p.text);
    chars.forEach((c, k) => out.push({ text: c, joint: k < chars.length - 1 ? 'char' : p.joint }));
  }
  return out;
}

export function format(text: string, options: FormatOptions): Node[] {
  const { measure, align } = options;
  const hyphenate = options.hyphenate ?? null;
  const hyphenPenalty = options.hyphenPenalty ?? 50;
  const space = measure(' ');
  const hyphenWidth = measure('-');
  const nodes: Node[] = [];

  const joint = (j: Joint): Node => {
    switch (j) {
      case 'hyphen': return penalty(hyphenWidth, hyphenPenalty, true, '-');
      case 'explicit': return penalty(0, hyphenPenalty, true);
      case 'soft': return penalty(0, 100);
      case 'char': return penalty(0, 1000);
    }
  };

  const interword = (): void => {
    if (align === 'justify') {
      nodes.push(glue(space, space / 2, space / 3));
    } else {
      // Ragged right: stretch at line ends only, natural spacing inside lines.
      nodes.push(glue(0, 3 * space, 0), penalty(0, 0), glue(space, -3 * space, 0));
    }
  };

  for (const para of text.replace(/\r\n?/g, '\n').split('\n')) {
    const words = para.split(SPACE).filter(Boolean);
    if (words.length === 0) nodes.push(box(0, ''));
    else if (options.indent) nodes.push(box(options.indent, ''));
    words.forEach((word, wi) => {
      if (wi > 0) interword();
      let pieces = splitWord(word, hyphenate);
      if (options.splitWiderThan !== undefined) {
        pieces = splitWide(pieces, word, measure, options.splitWiderThan);
      }
      // Measure prefixes of the whole word, so kerning across piece
      // boundaries is counted and the pieces sum to the word's width.
      let offset = 0;
      let left = 0;
      for (const p of pieces) {
        offset += p.text.length;
        const right = measure(word.slice(0, offset));
        nodes.push(box(right - left, p.text));
        left = right;
        if (p.joint) nodes.push(joint(p.joint));
      }
    });
    nodes.push(glue(0, FILL, 0), penalty(0, -INFINITY));
  }
  return nodes;
}
