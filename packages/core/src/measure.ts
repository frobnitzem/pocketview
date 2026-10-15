/**
 * Bottom-up measurement. For a node and a maximum width, the engine returns
 * the Pareto front of its display options over (height, shown). A parent
 * combines its children's fronts (a knapsack over rows) into its own front.
 * Results are memoized per (node, width), and widths are snapped to
 * `theme.unit`, so only the widths the planner actually asks for are computed.
 */
import { pareto, type Point } from './frontier';
import { isLeaf, type TreeNode } from './json';
import type { Metrics, Theme } from './theme';

export interface Tag {
  node: TreeNode;
  text: string;
  x: number;
  y: number;
  w: number;
}

export type Value =
  | { t: 'token'; text: string; w: number }
  | { t: 'text'; text: string; w: number; h: number; full: number; scroll: boolean }
  | { t: 'tags'; w: number; h: number; items: Tag[] }
  | { t: 'list'; rows: Rows }
  | { t: 'frame'; w: number; h: number; rows: Rows }
  /**
   * An array that doesn't fit: top and bottom bars around a window of
   * elements [start, end] (inclusive), drawn as tags or a list.
   */
  | { t: 'container'; w: number; h: number; content: Option; start: number; end: number; total: number };

/** Which elements of an array container to show: from `start`, or ending at `end`. */
export type ArrayWindow = { start: number } | { end: number };

/** One display option: its size, how much it shows, and how to draw it. */
export interface Option {
  w: number;
  h: number;
  s: number;
  v: Value;
}

/** A child of a container: shown with `opt`, or collapsed (null). */
export interface Row {
  node: TreeNode;
  opt: Option | null;
}

export interface Rows {
  width: number;
  keyW: number;
  rows: Row[];
  collapsed: TreeNode[];
  rowsH: number;
  chipsH: number;
  h: number;
  s: number;
}

/**
 * Where a container's collapsed children go: chips inside, or side-bar
 * segments; 'none' means every child must be shown (a bare array).
 */
export type CollapseMode = 'chips' | 'sidebar' | 'none';

type Chain = { row: Row; prev: Chain } | null;

/** Added to the score of a prioritized child, so it wins whenever it fits. */
const PRIORITY = 1e4;

/** A container is worth slightly less than showing the same elements bare. */
const CONTAINER_FACTOR = 0.95;

/** Text longer than this (in characters) is shown in a row only in a scroll box. */
const LONG_TEXT = 3000;

/** Array windows are not grown past this height (bounds the work on huge arrays). */
const WINDOW_MAX = 2400;

export function flow(widths: readonly number[], W: number, rowH: number, gap: number): { x: number; y: number }[] & { h: number } {
  const pos = [] as unknown as { x: number; y: number }[] & { h: number };
  let x = 0;
  let y = 0;
  for (const w of widths) {
    if (x > 0 && x + w > W) {
      x = 0;
      y += rowH + gap;
    }
    pos.push({ x, y });
    x += w + gap;
  }
  pos.h = widths.length ? y + rowH : 0;
  return pos;
}

export function badge(node: TreeNode): string {
  if (node.kind === 'object') return `{${node.children.length}}`;
  if (node.kind === 'array') return `[${node.children.length}]`;
  return '';
}

/** How a leaf reads as a one-line token. */
export function tokenText(node: TreeNode): string {
  switch (node.kind) {
    case 'string': return node.value as string; // strings are drawn without quotes
    case 'object': return '{ }';
    case 'array': return '[ ]';
    default: return String(node.value);
  }
}

export class Measurer {
  private readonly memo = new Map<string, unknown>();
  /** Children deeper than this are always collapsed (set by the planner). */
  private limit = Infinity;
  /** Nodes the user asked to expand: shown first, even past the depth limit. */
  private priority: ReadonlySet<string> = new Set();
  private prioritySig = '';
  /** Page windows of array containers, by pointer. */
  private windows: Readonly<Record<string, ArrayWindow>> = {};
  private windowsSig = '';

  constructor(readonly metrics: Metrics, readonly theme: Theme) {}

  snap(w: number): number {
    return Math.max(0, Math.floor(w / this.theme.unit) * this.theme.unit);
  }

  /** Collapse every node deeper than `depth` (absolute). */
  setDepthLimit(depth: number): void {
    this.limit = depth;
  }

  /** Nodes to show in preference to everything else (with their ancestors). */
  setPriority(ptrs: Iterable<string>): void {
    this.priority = new Set(ptrs);
    this.prioritySig = [...this.priority].sort().join('\u0000');
  }

  /** Sets which elements array containers show (see `ArrayWindow`). */
  setWindows(windows: Readonly<Record<string, ArrayWindow>>): void {
    this.windows = windows;
    this.windowsSig = JSON.stringify(Object.entries(windows).sort());
  }

  windowOf(node: TreeNode): ArrayWindow {
    return this.windows[node.ptr] ?? { start: 0 };
  }

  private get sig(): string {
    return `${this.limit}|${this.prioritySig}|${this.windowsSig}`;
  }

  /** Whether `node` is, or contains, a prioritized node. */
  private prioritized(node: TreeNode): boolean {
    for (const p of this.priority) if (p === node.ptr || p.startsWith(`${node.ptr}/`)) return true;
    return false;
  }

  private cached<T>(key: string, compute: () => T): T {
    if (this.memo.has(key)) return this.memo.get(key) as T;
    const v = compute();
    this.memo.set(key, v);
    return v;
  }

  /** Width of the key column of a container. */
  keyWidth(node: TreeNode): number {
    return this.cached(`k|${node.ptr}`, () => {
      const t = this.theme;
      const widest = Math.max(0, ...node.children.map((c) => this.metrics.key(c.label)));
      return Math.min(t.keyMax, Math.max(t.keyMin, Math.ceil(widest + t.keyPad)));
    });
  }

  /** Width of a collapsed child's chip, at most `maxW` (the label is truncated). */
  chipWidth(node: TreeNode, maxW = Infinity): number {
    const b = badge(node);
    const natural = Math.ceil(this.metrics.key(node.label) + this.theme.chipPad + (b ? this.metrics.key(b) + this.theme.badgePad : 0));
    return Math.min(natural, Math.floor(maxW));
  }

  /** Options for a node drawn as a value: a token, text, tags, a bare list, or a frame. */
  value(node: TreeNode, maxW: number): Option[] {
    const W = this.snap(maxW);
    return this.cached(`v|${this.sig}|${node.ptr}|${W}`, () => {
      if (node.kind === 'object' && !isLeaf(node)) return this.frame(node, W);
      if (node.kind === 'array' && !isLeaf(node)) return this.array(node, W);
      return this.leaf(node, W);
    });
  }

  private leaf(node: TreeNode, W: number): Option[] {
    const t = this.theme;
    const token = tokenText(node);
    const width = this.metrics.value(token);
    if (!token.includes('\n') && width <= W) {
      return [{ w: Math.ceil(width), h: t.rowH, s: 1, v: { t: 'token', text: token, w: Math.ceil(width) } }];
    }
    const text = node.kind === 'string' ? (node.value as string) : token;
    const weight = Math.min(4, 1 + text.length / 400);
    if (text.length > LONG_TEXT) {
      // Very long text in a row only ever gets a scroll box (opening it shows
      // it in full), so its full height is estimated, not typeset at every width.
      const sample = text.slice(0, 400);
      const perChar = this.metrics.value(sample) / Math.max(1, sample.length);
      const full = Math.ceil((text.length * perChar) / Math.max(1, W)) * t.rowH;
      return [{
        w: W, h: t.scrollMax, s: weight * (0.5 + 0.5 * t.scrollMax / full),
        v: { t: 'text', text, w: W, h: t.scrollMax, full, scroll: true },
      }];
    }
    const full = Math.ceil(this.metrics.text(node.ptr, text).height(W));
    const opts: Option[] = [{
      w: W, h: Math.max(t.rowH, full), s: weight,
      v: { t: 'text', text, w: W, h: full, full, scroll: false },
    }];
    if (full > t.scrollMax) {
      opts.push({
        w: W, h: t.scrollMax, s: weight * (0.5 + 0.5 * t.scrollMax / full),
        v: { t: 'text', text, w: W, h: t.scrollMax, full, scroll: true },
      });
    }
    return opts;
  }

  private array(node: TreeNode, W: number): Option[] {
    const t = this.theme;
    const scalars = node.children.every((c) => isLeaf(c));
    if (scalars) {
      const texts = node.children.map(tokenText);
      const widths = texts.map((s) => Math.ceil(this.metrics.value(s) + t.tagPad));
      if (texts.every((s, i) => !s.includes('\n') && widths[i]! <= W)) {
        const pos = flow(widths, W, t.tagH, t.gap);
        const items = node.children.map((c, i) => ({ node: c, text: texts[i]!, x: pos[i]!.x, y: pos[i]!.y, w: widths[i]! }));
        const used = Math.max(...items.map((it) => it.x + it.w));
        const s = 1 + t.depthDiscount * (node.children.length - 1);
        return [{ w: used, h: Math.max(t.rowH, pos.h), s, v: { t: 'tags', w: used, h: pos.h, items } }];
      }
    }
    // A bare list shows every element; an array that doesn't fit uses a container.
    return this.rows(node, W, 'none').map((r) => ({ w: W, h: r.h, s: t.depthDiscount * r.s, v: { t: 'list', rows: r } }));
  }

  /** Whether all of an array's elements are short scalars (drawn as tags). */
  private tagWidths(node: TreeNode, W: number): number[] | null {
    if (!node.children.every((c) => isLeaf(c))) return null;
    const t = this.theme;
    const texts = node.children.map(tokenText);
    const widths = texts.map((s) => Math.ceil(this.metrics.value(s) + t.tagPad));
    return texts.every((s, i) => !s.includes('\n') && widths[i]! <= W) ? widths : null;
  }

  /**
   * Options for an array in a container (full width): one per window of
   * elements, from the array's page window, as many as fit at each height.
   * `bar` is the thickness of the top and bottom bars.
   */
  container(node: TreeNode, maxW: number, bar = this.theme.frame.bar): Option[] {
    const W = this.snap(maxW);
    return this.cached(`c|${this.sig}|${bar}|${node.ptr}|${W}`, () => {
      const t = this.theme;
      const inner = W - 2 * t.pad;
      if (isLeaf(node) || inner < t.keyMin + 4 * t.unit) return [];
      return this.windowed(node, inner).map((w) => {
        const h = 2 * bar + 2 * t.pad + w.content.h;
        return {
          w: W, h, s: CONTAINER_FACTOR * w.content.s,
          v: { t: 'container', w: W, h, content: w.content, start: w.start, end: w.end, total: node.children.length },
        };
      });
    });
  }

  /** Windows of consecutive elements, all shown, starting (or ending) at the page window. */
  windowed(node: TreeNode, W: number): { start: number; end: number; content: Option }[] {
    const t = this.theme;
    const n = node.children.length;
    const win = this.windowOf(node);
    const backward = 'end' in win;
    const first = Math.max(0, Math.min(n - 1, backward ? win.end : win.start));
    const order: number[] = [];
    for (let i = first; backward ? i >= 0 : i < n; i += backward ? -1 : 1) order.push(i);
    const out: { start: number; end: number; content: Option }[] = [];

    const widths = this.tagWidths(node, W);
    if (widths) {
      // Tags: each window length is one option.
      for (let k = 1; k <= order.length; k++) {
        const idx = order.slice(0, k).sort((a, b) => a - b);
        const pos = flow(idx.map((i) => widths[i]!), W, t.tagH, t.gap);
        if (pos.h > WINDOW_MAX) break;
        const items = idx.map((i, j) => {
          const c = node.children[i]!;
          return { node: c, text: tokenText(c), x: pos[j]!.x, y: pos[j]!.y, w: widths[i]! };
        });
        const used = Math.max(...items.map((it) => it.x + it.w));
        out.push({
          start: idx[0]!, end: idx[k - 1]!,
          content: { w: used, h: Math.max(t.rowH, pos.h), s: 1 + t.depthDiscount * (k - 1), v: { t: 'tags', w: used, h: pos.h, items } },
        });
      }
      return out;
    }

    // A list: a knapsack where every element in the window must be shown.
    const keyW = this.keyWidth(node);
    const valueW = W - keyW - t.gap;
    let front: Point<Chain>[] = [{ h: 0, s: 0, data: null }];
    const candidates: Point<{ start: number; end: number; content: Option }>[] = [];
    for (const i of order) {
      const c = node.children[i]!;
      const boost = this.prioritized(c) ? PRIORITY : 0;
      const shown = c.depth > this.limit && !boost ? [] : this.childOptions(c, W, valueW);
      if (shown.length === 0) break;
      const next: Point<Chain>[] = [];
      for (const f of front) {
        for (const o of shown) {
          const row = { node: c, opt: o };
          next.push({ h: f.h + this.rowHeight(row) + t.gap, s: f.s + o.s + boost, data: { row, prev: f.data } });
        }
      }
      front = pareto(next, t.keep);
      for (const f of front) {
        const rows: Row[] = [];
        for (let ch = f.data; ch; ch = ch.prev) rows.push(ch.row);
        rows.sort((a, b) => Number(a.node.label) - Number(b.node.label));
        const rowsH = f.h - t.gap;
        const r: Rows = { width: this.snap(W), keyW, rows, collapsed: [], rowsH, chipsH: 0, h: rowsH, s: f.s };
        candidates.push({
          h: rowsH, s: f.s,
          data: {
            start: Number(rows[0]!.node.label), end: Number(rows[rows.length - 1]!.node.label),
            content: { w: this.snap(W), h: rowsH, s: t.depthDiscount * f.s, v: { t: 'list', rows: r } },
          },
        });
      }
      if (front[0]!.h > WINDOW_MAX) break;
    }
    return pareto(candidates, t.keep).map((p) => p.data);
  }

  /** How a child can be shown in a container `W` wide (with values `valueW` wide). */
  private childOptions(c: TreeNode, W: number, valueW: number): Option[] {
    const t = this.theme;
    if (c.kind === 'object' && !isLeaf(c)) return this.frame(c, W);
    const bare = valueW >= 3 * t.unit ? this.value(c, valueW) : [];
    // An array that doesn't fit bare goes in a container, at full width.
    return c.kind === 'array' && !isLeaf(c) ? [...bare, ...this.container(c, W)] : bare;
  }

  /** Options for an object drawn in a nested arch frame, at full width. */
  frame(node: TreeNode, maxW: number): Option[] {
    const W = this.snap(maxW);
    return this.cached(`f|${this.sig}|${node.ptr}|${W}`, () => {
      const t = this.theme;
      const g = t.frame;
      const inner = W - g.side - 2 * t.pad;
      if (inner < t.keyMin + 4 * t.unit) return [];
      return this.rows(node, inner, 'chips').map((r) => {
        const h = g.bar + 2 * t.pad + r.h;
        return { w: W, h, s: 1 + t.depthDiscount * r.s, v: { t: 'frame', w: W, h, rows: r } };
      });
    });
  }

  /** Height a shown child adds to a container (before the gap). */
  rowHeight(row: Row): number {
    if (!row.opt) return 0;
    const full = row.opt.v.t === 'frame' || row.opt.v.t === 'container'; // full width, no key
    return full ? row.opt.h : Math.max(this.theme.rowH, row.opt.h);
  }

  /** The Pareto front of ways to show a container's children as rows. */
  rows(node: TreeNode, maxW: number, mode: CollapseMode): Rows[] {
    const W = this.snap(maxW);
    return this.cached(`r|${mode}|${this.sig}|${node.ptr}|${W}`, () => {
      const t = this.theme;
      const keyW = this.keyWidth(node);
      const valueW = W - keyW - t.gap;

      let front: Point<Chain>[] = [{ h: 0, s: 0, data: null }];
      const n = node.children.length;
      node.children.forEach((c, index) => {
        // On a tie, prefer showing earlier children (document order).
        const tieBreak = 1e-6 * (n - index) / n;
        // Collapsing costs a share of a chip row (estimated), or nothing in a
        // side bar; a bare array cannot collapse its elements.
        const chipCost = mode === 'sidebar' ? 0 : ((this.chipWidth(c, W) + t.gap) * (t.chipH + t.gap)) / Math.max(1, W);
        const options: Point<Row>[] = mode === 'none' ? [] : [{ h: chipCost, s: 0, data: { node: c, opt: null } }];
        // A prioritized child (or one containing a prioritized node) is worth
        // more than anything else, and may go past the depth limit.
        const boost = this.prioritized(c) ? PRIORITY : 0;
        const shown = c.depth > this.limit && !boost ? [] : this.childOptions(c, W, valueW);
        for (const o of shown) {
          const row = { node: c, opt: o };
          // The tie-break only applies to options that show something, or an
          // empty list would beat simply collapsing it.
          options.push({ h: this.rowHeight(row) + t.gap, s: o.s + (o.s >= 0.5 ? tieBreak : 0) + boost, data: row });
        }
        const next: Point<Chain>[] = [];
        for (const f of front) {
          for (const o of options) next.push({ h: f.h + o.h, s: f.s + o.s, data: { row: o.data, prev: f.data } });
        }
        front = pareto(next, t.keep);
      });
      if (front.length === 0) return []; // some element of a bare array cannot be shown

      const results = front.map((f) => {
        const rows: Row[] = [];
        for (let ch = f.data; ch; ch = ch.prev) rows.unshift(ch.row);
        const shown = rows.filter((r) => r.opt);
        const collapsed = rows.filter((r) => !r.opt).map((r) => r.node);
        const rowsH = shown.reduce((sum, r) => sum + this.rowHeight(r), 0) + Math.max(0, shown.length - 1) * t.gap;
        const chipsH = mode === 'chips'
          ? flow(collapsed.map((n) => this.chipWidth(n, W)), W, t.chipH, t.gap).h
          : 0;
        const h = rowsH + (rowsH && chipsH ? t.gap : 0) + chipsH;
        const r: Rows = { width: W, keyW, rows, collapsed, rowsH, chipsH, h, s: f.s };
        return { h, s: f.s, data: r };
      });
      return pareto(results, t.keep).map((p) => p.data);
    });
  }
}
