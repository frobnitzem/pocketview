/**
 * Knuth–Plass optimal line breaking.
 *
 * Follows D. E. Knuth and M. F. Plass, "Breaking Paragraphs into Lines"
 * (1981), as earlier ported to JavaScript by Bram Stein (typeset, BSD).
 */
import { INFINITY, isForced, type Node } from './nodes.js';

export interface BreakOptions {
  /** Largest adjustment ratio accepted for a line. */
  tolerance: number;
  linePenalty: number;
  /** Added when two consecutive lines end in a flagged (hyphen) break. */
  flaggedDemerits: number;
  /** Added when adjacent lines differ by more than one fitness class. */
  fitnessDemerits: number;
  /** Added when the second-to-last line of a paragraph ends in a hyphen. */
  finalHyphenDemerits: number;
  /**
   * Extra stretch per line used only when scoring (TeX's \emergencystretch):
   * makes loose lines cheaper so unavoidable looseness spreads over the paragraph.
   */
  emergencyStretch: number;
}

export const defaultBreakOptions: BreakOptions = {
  tolerance: 1,
  linePenalty: 10,
  flaggedDemerits: 3000,
  fitnessDemerits: 3000,
  finalHyphenDemerits: 5000,
  emergencyStretch: 0,
};

/** A chosen break: the line that ends at node `position`. */
export interface Break {
  position: number;
  ratio: number;
}

interface Active {
  position: number;   // index of the break node; -1 for the paragraph start
  start: number;      // first node of the line that follows this break
  line: number;       // number of lines before this break
  fitness: number;
  total: number;
  prev: Active | null;
}

/**
 * First node of the line after a break at `p` (-1: paragraph start).
 * Discardable items (glue, penalties) after a break don't start a line.
 */
export function lineStartAfter(nodes: readonly Node[], p: number): number {
  let j = p + 1;
  while (j < nodes.length) {
    const node = nodes[j]!;
    if (node.type === 'box' || isForced(node)) break;
    j++;
  }
  return j;
}

const MAX_BADNESS = 10000;

function fitnessClass(r: number): number {
  return r < -0.5 ? 0 : r <= 0.5 ? 1 : r <= 1 ? 2 : 3;
}

/**
 * Returns the optimal breaks (one per line, the last one at the final node),
 * or null if no set of breaks keeps every line within `tolerance`.
 * `lineWidths[i]` is the width of line i; the last entry repeats.
 */
export function breakLines(
  nodes: readonly Node[],
  lineWidths: readonly number[],
  options: Partial<BreakOptions> = {},
): Break[] | null {
  const opt = { ...defaultBreakOptions, ...options };
  const n = nodes.length;
  if (n === 0 || lineWidths.length === 0) return [];

  // Prefix sums: W[i] = total width of nodes[0 .. i-1] (penalties excluded).
  const W = new Float64Array(n + 1);
  const Y = new Float64Array(n + 1);
  const Z = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) {
    const node = nodes[i]!;
    W[i + 1] = W[i]! + (node.type === 'penalty' ? 0 : node.width);
    Y[i + 1] = Y[i]! + (node.type === 'glue' ? node.stretch : 0);
    Z[i + 1] = Z[i]! + (node.type === 'glue' ? node.shrink : 0);
  }

  const lineStart = (p: number): number => lineStartAfter(nodes, p);
  const widthOf = (line: number): number => lineWidths[Math.min(line, lineWidths.length - 1)]!;
  const lastWidthIndex = lineWidths.length - 1;
  const flaggedAt = (p: number): boolean => {
    const node = nodes[p];
    return node !== undefined && node.type === 'penalty' && node.flagged;
  };

  let active: Active[] = [{ position: -1, start: 0, line: 0, fitness: 1, total: 0, prev: null }];

  for (let b = 0; b < n; b++) {
    const node = nodes[b]!;
    const legal =
      node.type === 'penalty' ? node.penalty < INFINITY :
      node.type === 'glue' ? b > 0 && nodes[b - 1]!.type === 'box' :
      false;
    if (!legal) continue;

    const forced = isForced(node);
    const extra = node.type === 'penalty' ? node.width : 0;
    const p = node.type === 'penalty' ? node.penalty : 0;
    const best = new Map<string, Active>();
    const kept: Active[] = [];

    for (const a of active) {
      const s = a.start;
      const L = W[b]! - W[s]! + extra;
      const target = widthOf(a.line);
      let r: number;
      if (L < target) {
        const y = Y[b]! - Y[s]! + opt.emergencyStretch;
        r = y > 0 ? (target - L) / y : Infinity;
      } else if (L > target) {
        const z = Z[b]! - Z[s]!;
        r = z > 0 ? (target - L) / z : -Infinity;
      } else {
        r = 0;
      }

      if (r >= -1 && r <= opt.tolerance) {
        const badness = Math.min(100 * Math.abs(r) ** 3, MAX_BADNESS);
        let d = (opt.linePenalty + badness) ** 2;
        if (p >= 0) d += p * p;
        else if (p > -INFINITY) d -= p * p;
        if (flaggedAt(b) && flaggedAt(a.position)) d += opt.flaggedDemerits;
        if (forced && flaggedAt(a.position)) d += opt.finalHyphenDemerits;
        const fitness = fitnessClass(r);
        if (Math.abs(fitness - a.fitness) > 1) d += opt.fitnessDemerits;

        // Lines past the end of lineWidths all have the same width, so
        // candidates there are interchangeable and compete with each other.
        const key = `${Math.min(a.line + 1, lastWidthIndex)}|${fitness}`;
        const total = a.total + d;
        const prev = best.get(key);
        if (!prev || total < prev.total) {
          best.set(key, { position: b, start: 0, line: a.line + 1, fitness, total, prev: a });
        }
      }
      if (!(r < -1 || forced)) kept.push(a);
    }

    if (best.size > 0) {
      const start = lineStart(b);
      for (const c of best.values()) {
        c.start = start;
        kept.push(c);
      }
    }
    if (kept.length === 0) return null;
    active = kept;
  }

  let end: Active | null = null;
  for (const a of active) {
    if (a.position === n - 1 && (!end || a.total < end.total)) end = a;
  }
  if (!end) return null;

  const breaks: Break[] = [];
  for (let a: Active | null = end; a && a.prev; a = a.prev) {
    breaks.push({ position: a.position, ratio: ratioOf(a.prev, a.position) });
  }
  return breaks.reverse();

  function ratioOf(a: Active, b: number): number {
    const node = nodes[b]!;
    const L = W[b]! - W[a.start]! + (node.type === 'penalty' ? node.width : 0);
    const target = widthOf(a.line);
    if (L < target) {
      const y = Y[b]! - Y[a.start]!;
      return y > 0 ? (target - L) / y : Infinity;
    }
    if (L > target) {
      const z = Z[b]! - Z[a.start]!;
      return z > 0 ? (target - L) / z : -Infinity;
    }
    return 0;
  }
}

/**
 * Last resort when no feasible breaks exist (e.g. a single glyph wider than
 * the line): fill each line greedily, letting oversized boxes overflow.
 */
export function breakGreedy(nodes: readonly Node[], lineWidths: readonly number[]): Break[] {
  const breaks: Break[] = [];
  let line = 0;
  let x = 0;           // width of the current line so far
  let sinceLegal = 0;  // width added since the last legal break
  let lastLegal = -1;
  let started = false;
  const newLine = (position: number, carry: number) => {
    breaks.push({ position, ratio: 0 });
    line++;
    x = carry;
    lastLegal = -1;
  };
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    const target = lineWidths[Math.min(line, lineWidths.length - 1)] ?? Infinity;
    if (node.type === 'box') {
      if (started && x + node.width > target && lastLegal >= 0) newLine(lastLegal, sinceLegal);
      x += node.width;
      sinceLegal += node.width;
      started = true;
    } else if (node.type === 'glue') {
      if (i > 0 && nodes[i - 1]!.type === 'box') {
        lastLegal = i;
        sinceLegal = 0;
      } else {
        sinceLegal += node.width;
      }
      if (started) x += node.width;
    } else if (isForced(node)) {
      newLine(i, 0);
      sinceLegal = 0;
      started = false;
    } else if (node.penalty < INFINITY) {
      lastLegal = i;
      sinceLegal = 0;
    }
  }
  return breaks;
}
