/**
 * Bottom-up measurement. For a node and a maximum width, the engine returns
 * the Pareto front of its display options over (height, shown). A parent
 * combines its children's fronts (a knapsack over rows) into its own front.
 * Results are memoized per node object and width, and widths are snapped to
 * `theme.unit`, so only the widths the planner actually asks for are computed.
 *
 * A node's intrinsic sizes (a leaf's options, its key column) depend only on
 * the node. A container's options also depend on the layout spec, but only
 * on the part of it inside the container's subtree (and the depth limit):
 * that part is the container's signature, and its cache is kept while the
 * signature is unchanged. Navigating in one container so leaves every other
 * container's cache intact, and a replaced subtree brings new node objects
 * with empty caches.
 */
import { pareto, type Point } from './frontier';
import { isLeaf, type TreeNode } from './json';
import type { Metrics, TextStyle, Theme } from './theme';
import { builtinVariants, type Variant } from './variant';

export interface Tag {
  node: TreeNode;
  text: string;
  x: number;
  y: number;
  w: number;
}

export type Value =
  | { t: 'token'; text: string; w: number }
  /** Text wrapped plainly (short strings) or typeset with Knuth–Plass (long ones). */
  | { t: 'text'; text: string; style: TextStyle; w: number; h: number; full: number; scroll: boolean }
  /** A plugin variant's own display; its renderer draws a 'custom' mark from `data`. */
  | { t: 'custom'; variant: string; data: unknown }
  | { t: 'tags'; w: number; h: number; items: Tag[] }
  | { t: 'list'; rows: Rows }
  | { t: 'frame'; w: number; h: number; rows: Rows }
  /**
   * An array that doesn't fit: top and bottom bars around a window of
   * elements [start, end] (inclusive), drawn as tags or a list.
   */
  | { t: 'container'; w: number; h: number; content: Option; start: number; end: number; total: number }
  /**
   * A container ("slot") opened to one of its descendants: it keeps its
   * place on the page but shows `node`, with breadcrumbs from itself to it.
   * `inner` is `node`'s display: a frame, a container, or a scalar under a bar.
   */
  | { t: 'slot'; slot: TreeNode; node: TreeNode; inner: Option; w: number; h: number };

/** Which elements of an array container to show: from `start`, or ending at `end`. */
export type ArrayWindow = { start: number } | { end: number };

/** One display option: its size, how much it shows, and how to draw it. */
export interface Option {
  w: number;
  h: number;
  s: number;
  v: Value;
  /** Set by the engine: the variant that produced it, and its layout. */
  variant?: string;
  layout?: 'value' | 'block';
  /**
   * How much taller it can grow (default 0): `h` is its minimum height and
   * `h + stretch` its maximum. After choosing options by their minimum
   * heights, the planner hands leftover height to stretchable options, like
   * TeX's glue. A text scroll box stretches up to its full text.
   */
  stretch?: number;
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
  /** Total stretch of the shown rows. */
  stretch: number;
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

/**
 * In an array container, the first element shown counts this much more than
 * the others, and more elements are added only once it is shown in full:
 * the container shows as much of its first element as it can (a chapter of
 * a book fills the page).
 */
const FIRST_WEIGHT = 100;

const stretchOf = (o: Option | null | undefined): number => o?.stretch ?? 0;

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

/** The part of the layout spec the measurer reads (see `LayoutSpec` in plan.ts). */
export interface MeasureSpec {
  /** Children deeper than this (absolute depth) are collapsed unless expanded. */
  limit: number;
  /** Nodes to show in preference to everything else (with their ancestors). */
  expanded: readonly string[];
  /** Nodes to show collapsed, even when there is room. */
  minified: readonly string[];
  /** Page windows of array containers, by pointer. */
  windows: Readonly<Record<string, ArrayWindow>>;
  /** Containers opened to a descendant: slot pointer → pointer of the node shown. */
  views: Readonly<Record<string, string>>;
}

const EMPTY_SPEC: MeasureSpec = { limit: Infinity, expanded: [], minified: [], windows: {}, views: {} };

/** Whether `ptr` is `root` or lies below it. */
const within = (ptr: string, root: string): boolean => ptr === root || ptr.startsWith(`${root}/`);

export class Measurer {
  /** Sizes that depend only on the node. */
  private readonly intrinsic = new WeakMap<TreeNode, Map<string, unknown>>();
  /** Sizes that also depend on the spec inside the node's subtree, for one signature. */
  private readonly options = new WeakMap<TreeNode, { sig: string; entries: Map<string, unknown> }>();
  /** Each node's signature, for the current spec (`version`). */
  private readonly sigs = new WeakMap<TreeNode, { version: number; sig: string }>();
  private version = 0;
  private spec: MeasureSpec = EMPTY_SPEC;
  private expanded: ReadonlySet<string> = new Set();
  private minified: ReadonlySet<string> = new Set();

  private readonly variants: readonly Variant[];

  /** `plugins` are tried alongside the built-in variants (see `Variant`). */
  constructor(readonly metrics: Metrics, readonly theme: Theme, plugins: readonly Variant[] = []) {
    this.variants = [...plugins, ...builtinVariants];
  }

  /** Sets the layout spec measured against (the planner does, before each plan). */
  setSpec(spec: MeasureSpec): void {
    this.spec = spec;
    // The outermost choice wins: nothing inside a minified node is expanded.
    this.expanded = new Set(spec.expanded.filter((p) => !spec.minified.some((m) => within(p, m))));
    this.minified = new Set(spec.minified);
    this.version++;
  }

  /** Forgets everything cached for `node` (after its subtree changed); its ancestors must be forgotten too. */
  forget(node: TreeNode): void {
    this.intrinsic.delete(node);
    this.options.delete(node);
    this.sigs.delete(node);
  }

  /** The variants that display `node`: those matching with the highest priority. */
  variantsFor(node: TreeNode): Variant[] {
    return this.intrinsicOf(node, 'vf', () => {
      let best = -Infinity;
      let out: Variant[] = [];
      for (const v of this.variants) {
        const p = v.match(node);
        if (p === null) continue;
        if (p > best) { best = p; out = [v]; } else if (p === best) out.push(v);
      }
      return out;
    });
  }

  snap(w: number): number {
    return Math.max(0, Math.floor(w / this.theme.unit) * this.theme.unit);
  }

  windowOf(node: TreeNode): ArrayWindow {
    return this.spec.windows[node.ptr] ?? { start: 0 };
  }

  /** Whether `node` is, or contains, an expanded node. */
  prioritized(node: TreeNode): boolean {
    for (const p of this.expanded) if (within(p, node.ptr)) return true;
    return false;
  }

  /** Whether `node` is to be shown collapsed. */
  private minifiedNode(node: TreeNode): boolean {
    return this.minified.has(node.ptr);
  }

  /** The spec inside `node`'s subtree, as a string. */
  private signature(node: TreeNode): string {
    const known = this.sigs.get(node);
    if (known?.version === this.version) return known.sig;
    const { limit, expanded, minified, windows, views } = this.spec;
    const inside = (ptrs: Iterable<string>) => [...ptrs].filter((p) => within(p, node.ptr)).sort();
    const sig = JSON.stringify([
      limit,
      inside(expanded),
      inside(minified),
      inside(Object.keys(windows)).map((k) => [k, windows[k]]),
      inside(Object.keys(views)).map((k) => [k, views[k]]),
    ]);
    this.sigs.set(node, { version: this.version, sig });
    return sig;
  }

  /** Memoizes a size that depends only on `node`. */
  private intrinsicOf<T>(node: TreeNode, key: string, compute: () => T): T {
    let entries = this.intrinsic.get(node);
    if (!entries) this.intrinsic.set(node, (entries = new Map()));
    if (entries.has(key)) return entries.get(key) as T;
    const v = compute();
    entries.set(key, v);
    return v;
  }

  /** Memoizes options of `node` that depend on the spec inside its subtree. */
  private cached<T>(node: TreeNode, key: string, compute: () => T): T {
    const sig = this.signature(node);
    let slot = this.options.get(node);
    if (!slot || slot.sig !== sig) this.options.set(node, (slot = { sig, entries: new Map() }));
    if (slot.entries.has(key)) return slot.entries.get(key) as T;
    const v = compute();
    slot.entries.set(key, v);
    return v;
  }

  /** Width of the key column of a container. */
  keyWidth(node: TreeNode): number {
    return this.intrinsicOf(node, 'k', () => {
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

  /** Options for a node drawn beside a key (its 'value' variants). */
  value(node: TreeNode, maxW: number): Option[] {
    const W = this.snap(maxW);
    return this.cached(node, `v|${W}`, () => this.tagged(node, W, W, 'value'));
  }

  /** Options of the node's variants, measured `W` wide (blocks) or `valueW` wide (values). */
  private tagged(node: TreeNode, W: number, valueW: number, only?: 'value'): Option[] {
    const out: Option[] = [];
    for (const v of this.variantsFor(node)) {
      if (only && v.layout !== only) continue;
      const w = v.layout === 'block' ? W : valueW;
      if (w < 3 * this.theme.unit) continue;
      for (const o of v.measure(node, w, this)) out.push({ ...o, variant: v.id, layout: v.layout });
    }
    return out;
  }

  /** How a child can be shown in a container `W` wide (with values `valueW` wide). */
  childOptions(c: TreeNode, W: number, valueW: number): Option[] {
    const shown = this.spec.views[c.ptr];
    if (shown !== undefined && shown !== c.ptr) return this.slot(c, shown, this.snap(W));
    const [w, vw] = [this.snap(W), this.snap(valueW)];
    return this.cached(c, `o|${w}|${vw}`, () => this.tagged(c, w, vw));
  }

  /** Options for container `c` opened to its descendant at `ptr` (full width). */
  private slot(c: TreeNode, ptr: string, W: number): Option[] {
    return this.cached(c, `s|${W}`, () => {
      const t = this.theme;
      let node: TreeNode | undefined = c;
      for (const part of ptr.slice(c.ptr.length + 1).split('/')) {
        const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
        node = node?.children.find((k) => k.label === key);
      }
      if (!node || !ptr.startsWith(`${c.ptr}/`)) return this.tagged(c, W, W);
      const shown = node;
      const wrap = (inner: Option, h: number): Option => ({
        w: W, h, s: inner.s + 1, stretch: inner.stretch ?? 0, layout: 'block', variant: 'core/slot',
        v: { t: 'slot', slot: c, node: shown, inner, w: W, h },
      });
      if (shown.kind === 'object' && !isLeaf(shown)) return this.frame(shown, W).map((o) => wrap(o, o.h));
      if (shown.kind === 'array' && !isLeaf(shown)) return this.container(shown, W).map((o) => wrap(o, o.h));
      // A scalar: its value under a bar carrying the breadcrumbs.
      const bar = t.frame.bar;
      return this.leafOptions(shown, W - 2 * t.pad).map((o) => wrap(o, bar + 2 * t.pad + o.h));
    });
  }

  /** Options for a scalar (or empty container): a token, or wrapped or typeset text. */
  leafOptions(node: TreeNode, maxW: number): Option[] {
    const W = this.snap(maxW);
    return this.intrinsicOf(node, `l|${W}`, () => this.leaf(node, W));
  }

  /** Options for a bare array (every element shown): tags, or a list. */
  bareArray(node: TreeNode, maxW: number): Option[] {
    const W = this.snap(maxW);
    return this.cached(node, `a|${W}`, () => this.array(node, W));
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
        w: W, h: t.scrollMin, s: weight * (0.5 + 0.5 * t.scrollMin / full), stretch: Math.max(0, full - t.scrollMin),
        v: { t: 'text', text, style: 'typeset', w: W, h: t.scrollMin, full, scroll: true },
      }];
    }
    // Typesetting is for long text; short snippets are wrapped plainly.
    const style: TextStyle = text.length > t.longText || text.includes('\n') ? 'typeset' : 'plain';
    const full = Math.ceil(this.metrics.text(node.ptr, text, style).height(W));
    const opts: Option[] = [{
      w: W, h: Math.max(t.rowH, full), s: weight,
      v: { t: 'text', text, style, w: W, h: full, full, scroll: false },
    }];
    if (full > t.scrollMin + t.rowH) {
      // A scroll box: a few lines at least, stretching up to the full text.
      opts.push({
        w: W, h: t.scrollMin, s: weight * (0.5 + 0.5 * t.scrollMin / full), stretch: full - t.scrollMin,
        v: { t: 'text', text, style, w: W, h: t.scrollMin, full, scroll: true },
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
    return this.rows(node, W, 'none').map((r) => ({ w: W, h: r.h, s: t.depthDiscount * r.s, stretch: r.stretch, v: { t: 'list', rows: r } }));
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
    return this.cached(node, `c|${bar}|${W}`, () => {
      const t = this.theme;
      const inner = W - 2 * t.pad;
      if (isLeaf(node) || inner < t.keyMin + 4 * t.unit) return [];
      return this.windowed(node, inner).map((w) => {
        const h = 2 * bar + 2 * t.pad + w.content.h;
        return {
          w: W, h, s: CONTAINER_FACTOR * w.content.s, stretch: stretchOf(w.content),
          v: { t: 'container', w: W, h, content: w.content, start: w.start, end: w.end, total: node.children.length },
        };
      });
    });
  }

  /** Windows of consecutive elements, all shown, starting (or ending) at the page window. */
  windowed(node: TreeNode, W: number): { start: number; end: number; content: Option; rank: number }[] {
    const t = this.theme;
    const n = node.children.length;
    const win = this.windowOf(node);
    const backward = 'end' in win;
    const first = Math.max(0, Math.min(n - 1, backward ? win.end : win.start));
    const order: number[] = [];
    for (let i = first; backward ? i >= 0 : i < n; i += backward ? -1 : 1) order.push(i);
    const out: { start: number; end: number; content: Option; rank: number }[] = [];

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
          rank: k,
        });
      }
      return out;
    }

    // A list: a knapsack where every element in the window must be shown.
    const keyW = this.keyWidth(node);
    const valueW = W - keyW - t.gap;
    let front: Point<Chain>[] = [{ h: 0, s: 0, data: null }];
    const candidates: Point<{ start: number; end: number; content: Option; rank: number }>[] = [];
    for (const [step, i] of order.entries()) {
      const c = node.children[i]!;
      const boost = this.prioritized(c) ? PRIORITY : 0;
      const shown = c.depth > this.spec.limit && !boost ? [] : this.childOptions(c, W, valueW);
      if (shown.length === 0) break;
      const weight = step === 0 ? FIRST_WEIGHT : 1;
      const next: Point<Chain>[] = [];
      for (const f of front) {
        for (const o of shown) {
          const row = { node: c, opt: o };
          next.push({ h: f.h + this.rowHeight(row) + t.gap, s: f.s + weight * o.s + boost, data: { row, prev: f.data } });
        }
      }
      front = pareto(next, t.keep);
      for (const f of front) {
        const rows: Row[] = [];
        for (let ch = f.data; ch; ch = ch.prev) rows.push(ch.row);
        rows.sort((a, b) => Number(a.node.label) - Number(b.node.label));
        const rowsH = f.h - t.gap;
        const stretch = rows.reduce((sum, r) => sum + stretchOf(r.opt), 0);
        // The first-element weight only ranks windows against each other; the
        // content is worth the plain sum, like any other option.
        const plain = rows.reduce((sum, r) => sum + (r.opt?.s ?? 0), 0);
        const r: Rows = { width: this.snap(W), keyW, rows, collapsed: [], rowsH, chipsH: 0, h: rowsH, s: plain, stretch };
        candidates.push({
          h: rowsH, s: f.s,
          data: {
            start: Number(rows[0]!.node.label), end: Number(rows[rows.length - 1]!.node.label),
            content: { w: this.snap(W), h: rowsH, s: t.depthDiscount * plain, stretch, v: { t: 'list', rows: r } },
            rank: f.s,
          },
        });
      }
      // More elements follow only a first element shown in full: at its
      // richest option, with no stretch left.
      if (step === 0) {
        const richest = Math.max(...shown.map((o) => o.s));
        front = front.filter((f) => {
          const o = f.data?.row.opt;
          return !!o && stretchOf(o) === 0 && o.s >= richest - 1e-9;
        });
      }
      if (front.length === 0 || front[0]!.h > WINDOW_MAX) break;
    }
    return pareto(candidates, t.keep).map((p) => p.data);
  }


  /** Options for an object drawn in a nested arch frame, at full width. */
  frame(node: TreeNode, maxW: number): Option[] {
    const W = this.snap(maxW);
    return this.cached(node, `f|${W}`, () => {
      const t = this.theme;
      const g = t.frame;
      const inner = W - g.side - 2 * t.pad;
      if (inner < t.keyMin + 4 * t.unit) return [];
      return this.rows(node, inner, 'chips').map((r) => {
        const h = g.bar + 2 * t.pad + r.h;
        return { w: W, h, s: 1 + t.depthDiscount * r.s, stretch: r.stretch, v: { t: 'frame', w: W, h, rows: r } };
      });
    });
  }

  /** Height a shown child adds to a container (before the gap). */
  rowHeight(row: Row): number {
    if (!row.opt) return 0;
    return row.opt.layout === 'block' ? row.opt.h : Math.max(this.theme.rowH, row.opt.h); // blocks have no key
  }

  /** The Pareto front of ways to show a container's children as rows. */
  rows(node: TreeNode, maxW: number, mode: CollapseMode): Rows[] {
    const W = this.snap(maxW);
    return this.cached(node, `r|${mode}|${W}`, () => {
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
        // A minified child is only ever collapsed (where it has somewhere to go).
        const hidden = (c.depth > this.spec.limit && !boost) || (mode !== 'none' && this.minifiedNode(c));
        const shown = hidden ? [] : this.childOptions(c, W, valueW);
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
        const stretch = shown.reduce((sum, r) => sum + stretchOf(r.opt), 0);
        const r: Rows = { width: W, keyW, rows, collapsed, rowsH, chipsH, h, s: f.s, stretch };
        return { h, s: f.s, data: r };
      });
      return pareto(results, t.keep).map((p) => p.data);
    });
  }
}
