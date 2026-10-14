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
  | { t: 'frame'; w: number; h: number; rows: Rows };

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

/** Where a container's collapsed children go: chips inside, or side-bar segments. */
export type CollapseMode = 'chips' | 'sidebar';

type Chain = { row: Row; prev: Chain } | null;

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
    case 'string': return `“${node.value as string}”`;
    case 'object': return '{ }';
    case 'array': return '[ ]';
    default: return String(node.value);
  }
}

export class Measurer {
  private readonly memo = new Map<string, unknown>();

  constructor(readonly metrics: Metrics, readonly theme: Theme) {}

  snap(w: number): number {
    return Math.max(0, Math.floor(w / this.theme.unit) * this.theme.unit);
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

  /** Options for a node drawn as a value: a token, text, tags, a list, or a frame. */
  value(node: TreeNode, maxW: number): Option[] {
    const W = this.snap(maxW);
    return this.cached(`v|${node.ptr}|${W}`, () => {
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
    const full = Math.ceil(this.metrics.text(node.ptr, text).height(W));
    const weight = Math.min(4, 1 + text.length / 400);
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
    return this.rows(node, W, 'chips').map((r) => ({ w: W, h: r.h, s: t.depthDiscount * r.s, v: { t: 'list', rows: r } }));
  }

  /** Options for an object drawn in a nested arch frame, at full width. */
  frame(node: TreeNode, maxW: number): Option[] {
    const W = this.snap(maxW);
    return this.cached(`f|${node.ptr}|${W}`, () => {
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
    return row.opt.v.t === 'frame' ? row.opt.h : Math.max(this.theme.rowH, row.opt.h);
  }

  /** The Pareto front of ways to show a container's children as rows. */
  rows(node: TreeNode, maxW: number, mode: CollapseMode): Rows[] {
    const W = this.snap(maxW);
    return this.cached(`r|${mode}|${node.ptr}|${W}`, () => {
      const t = this.theme;
      const keyW = this.keyWidth(node);
      const valueW = W - keyW - t.gap;

      let front: Point<Chain>[] = [{ h: 0, s: 0, data: null }];
      const n = node.children.length;
      node.children.forEach((c, index) => {
        // On a tie, prefer showing earlier children (document order).
        const tieBreak = 1e-6 * (n - index) / n;
        // Collapsing costs a share of a chip row (estimated), or nothing in a side bar.
        const chipCost = mode === 'sidebar' ? 0 : ((this.chipWidth(c, W) + t.gap) * (t.chipH + t.gap)) / Math.max(1, W);
        const options: Point<Row>[] = [{ h: chipCost, s: 0, data: { node: c, opt: null } }];
        const shown = c.kind === 'object' && !isLeaf(c)
          ? this.frame(c, W)
          : valueW >= 3 * t.unit ? this.value(c, valueW) : [];
        for (const o of shown) {
          const row = { node: c, opt: o };
          options.push({ h: this.rowHeight(row) + t.gap, s: o.s + tieBreak, data: row });
        }
        const next: Point<Chain>[] = [];
        for (const f of front) {
          for (const o of options) next.push({ h: f.h + o.h, s: f.s + o.s, data: { row: o.data, prev: f.data } });
        }
        front = pareto(next, t.keep);
      });

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
