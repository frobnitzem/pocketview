/**
 * Top-down planning: for the focused node and a viewport, choose one option
 * per visible node and give every visible element a rectangle. The result
 * (the marked tree, as a flat list of marks) is all a renderer needs.
 */
import { bestFit } from './frontier';
import { ancestors, find, isLeaf, replaceAt, type Json, type Kind, type TreeNode } from './json';
import { badge, flow, Measurer, type ArrayWindow, type Option, type Row, type Rows, type Value } from './measure';
import { defaultTheme, type ArchGeometry, type Metrics, type TextStyle, type Theme } from './theme';
import type { Variant } from './variant';

/** Arch shapes; 'TB' is the array container (top and bottom bars), 'T' a bar alone. */
export type ArchVariant = 'LT' | 'RT' | 'LB' | 'RB' | 'LTR' | 'T' | 'TB';

/**
 * Display variants of containers: an object as the outermost 'arch' (wide
 * side bar with segments) or a nested 'frame' (thin side); an array in a
 * 'container' (top and bottom bars, paged); 'bar' carries the breadcrumbs
 * of an opened scalar.
 */
export type FrameVariant = 'arch' | 'frame' | 'container' | 'bar';

/** What a paging arrow sets: an array container's window, or a side bar's offset. */
export type PageSet = { window: ArrayWindow } | { offset: number };

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One step of a breadcrumb trail. */
export interface Crumb {
  ptr: string;
  text: string;
  type: Kind;
}

/**
 * Every mark carries the JSON Pointer of its node; `type` is the node's kind
 * (renderers colour by it). `outer` marks the outermost frame of the view.
 */
export type Mark = MarkBody & {
  /** Content of the plan's scroll region (positions are in content coordinates of the page). */
  scrolled?: boolean;
};

type MarkBody =
  | {
      kind: 'frame'; ptr: string; rect: Rect; arch: ArchVariant; geom: ArchGeometry; depth: number; type: Kind;
      variant: FrameVariant; outer: boolean;
      /** Only objects and arrays can be targets (an opened scalar's bar cannot). */
      targetable: boolean;
      /**
       * The container this frame is on the page (its "slot"). It differs from
       * `ptr` when the container was opened to a descendant: the frame then
       * shows that descendant, with breadcrumbs from the slot to it. The
       * outermost frame's slot is `OUTER` ("").
       */
      slot: string;
    }
  | {
      kind: 'title'; ptr: string; rect: Rect; text: string;
      /** The container's breadcrumbs from its enclosing frame (exclusive) to itself. */
      trail: Crumb[];
      /** font size relative to key labels */ scale: number; outer: boolean;
      /** The container (slot) whose nav bar this title is. */
      slot: string;
    }
  | { kind: 'key'; ptr: string; rect: Rect; text: string; type: Kind }
  | { kind: 'token'; ptr: string; rect: Rect; text: string; type: Kind }
  | { kind: 'text'; ptr: string; rect: Rect; text: string; style: TextStyle; scroll: boolean; contentHeight: number }
  /** A plugin variant's display, drawn by the renderer registered for `variant`. */
  | { kind: 'custom'; ptr: string; rect: Rect; variant: string; data: unknown }
  | { kind: 'tag'; ptr: string; rect: Rect; text: string; type: Kind }
  | { kind: 'chip'; ptr: string; rect: Rect; text: string; badge: string; type: Kind }
  | { kind: 'segment'; ptr: string; rect: Rect; text: string; badge: string; type: Kind }
  /** A breadcrumb in the nav bar of the container `slot`. */
  | { kind: 'crumb'; ptr: string; rect: Rect; text: string; type: Kind; slot: string }
  | { kind: 'menu'; ptr: string; rect: Rect; items: Crumb[]; slot: string }
  /** An array container's shown range, 1-based: "6–8 of 12". */
  | { kind: 'range'; ptr: string; rect: Rect; text: string; start: number; end: number; total: number }
  /** A paging arrow of a container (array window) or of the outer side bar. */
  | { kind: 'pager'; ptr: string; rect: Rect; dir: 'up' | 'down' | 'prev' | 'next'; disabled: boolean; set: PageSet; type: Kind; outer: boolean };

export interface Viewport {
  w: number;
  h: number;
}

/**
 * What the user chose, as annotations over document nodes by JSON Pointer
 * (see "Mental model" in DESIGN.md). Everything else about a plan is derived.
 */
export interface LayoutSpec {
  /**
   * What each container on the page shows, by container (slot) pointer. The
   * slot `""` is the outermost frame: it shows the document root unless set.
   * A nested container keeps its place but shows the node, with breadcrumbs
   * from itself to it.
   */
  views?: Readonly<Record<string, string>>;
  /** Nodes to show in preference to everything else (even past the depth limit). */
  expanded?: readonly string[];
  /**
   * Nodes to show collapsed, as chips or side-bar segments, even when there
   * is room. The outermost choice wins: expanded nodes inside a minified
   * one stay hidden.
   */
  minified?: readonly string[];
  /** Page windows of array containers, by pointer (default: from element 0). */
  windows?: Readonly<Record<string, ArrayWindow>>;
  /** First side-bar segment shown, by object pointer (default 0). */
  offsets?: Readonly<Record<string, number>>;
}

/** The slot of the outermost frame (in `views`, and in marks' `slot`). */
export const OUTER = '';

/** The pointer of the node the outermost frame shows. */
export const rootOf = (spec: LayoutSpec): string => spec.views?.[OUTER] ?? '';

export interface Plan {
  focus: string;
  marks: Mark[];
  width: number;
  height: number;
  /**
   * The content is taller than its frame: it scrolls inside `scroll` (marks
   * with `scrolled` set), while the frame and its bars stay put. A last
   * resort; paging, collapsing and stretchable boxes are preferred.
   */
  overflow: boolean;
  scroll?: { rect: Rect; height: number };
}

/** Marks that the user can click (to target or expand their node). */
export const NAVIGABLE = new Set<Mark['kind']>(['chip', 'segment', 'crumb', 'title', 'key']);

/** Marks that stand for a node without showing it. */
const COLLAPSED = new Set<Mark['kind']>(['chip', 'segment', 'crumb', 'menu', 'range', 'pager']);

/** Whether the plan shows `ptr` itself (not just a chip or crumb for it). */
export function isShown(plan: Plan, ptr: string): boolean {
  return plan.marks.some((m) => m.ptr === ptr && !COLLAPSED.has(m.kind));
}

const crumb = (n: TreeNode): Crumb => ({ ptr: n.ptr, text: n.label, type: n.kind });

export class Planner {
  readonly measurer: Measurer;
  private offsets: Readonly<Record<string, number>> = {};
  private scroll: Plan['scroll'];

  /** `plugins`: display variants tried alongside the built-in ones (see `Variant`). */
  constructor(readonly tree: TreeNode, readonly metrics: Metrics, readonly theme: Theme = defaultTheme, plugins: readonly Variant[] = []) {
    this.measurer = new Measurer(metrics, theme, plugins);
  }

  /**
   * Replaces the value at `ptr` (see `replaceAt`): sizes cached for the
   * unchanged parts are kept, those of changed nodes and their ancestors
   * are forgotten. Returns false if there is no node at `ptr`.
   */
  update(ptr: string, value: Json): boolean {
    return replaceAt(this.tree, ptr, value, (node) => this.measurer.forget(node));
  }

  /** Lays out the document for `spec` in a viewport: a pure function of the two. */
  plan(spec: LayoutSpec, vp: Viewport): Plan {
    const focus = find(this.tree, rootOf(spec)) ?? this.tree;
    const views = { ...spec.views };
    delete views[OUTER]; // the outermost slot shows the focus itself
    this.measurer.setSpec({
      limit: focus.depth + this.theme.maxDepth,
      expanded: spec.expanded ?? [],
      minified: spec.minified ?? [],
      windows: spec.windows ?? {},
      views,
    });
    this.offsets = spec.offsets ?? {};
    const marks: Mark[] = [];
    this.scroll = undefined;
    if (isLeaf(focus)) this.planUnframed(focus, vp, marks);
    else if (focus.kind === 'object') this.planObject(focus, vp, marks);
    else this.planArray(focus, vp, marks);
    const scroll = this.scroll;
    return { focus: focus.ptr, marks, width: vp.w, height: vp.h, overflow: scroll !== undefined, ...(scroll ? { scroll } : {}) };
  }

  /**
   * Marks placed from `first` on are content of a region `rect` whose content
   * is `height` tall; if it doesn't fit, they scroll inside the region.
   */
  private region(marks: Mark[], first: number, rect: Rect, height: number): void {
    if (height <= rect.h + 0.5) return;
    for (let i = first; i < marks.length; i++) marks[i]!.scrolled = true;
    this.scroll = { rect, height };
  }

  /** The focused object fills the viewport as the outermost LTR frame. */
  private planObject(focus: TreeNode, vp: Viewport, marks: Mark[]): void {
    const t = this.theme;
    const g = t.root;
    const m = this.measurer;
    const frame: Mark = {
      kind: 'frame', ptr: focus.ptr, rect: { x: 0, y: 0, w: vp.w, h: vp.h }, arch: 'LTR', geom: g, depth: focus.depth,
      type: focus.kind, variant: 'arch', outer: true, targetable: true, slot: OUTER,
    };
    marks.push(frame);
    const path = ancestors(focus);
    const title = this.title(focus, g.side + g.inner, vp.w - g.outer, g.bar, path.length > 0);
    marks.push(title);
    this.crumbs(path, g.side + g.inner, title.rect.x - t.gap, 0, g.bar, OUTER, marks);

    const cx = g.side + t.pad;
    const cy = g.bar + t.pad;
    const cw = vp.w - g.side - g.sideR - 2 * t.pad;
    const maxH = vp.h - g.bar - 2 * t.pad;
    // Collapsed children go in side-bar segments, which page (with arrows at
    // the top and bottom of the bar) when there are more than fit.
    const scored = m.rows(focus, cw, 'sidebar').map((rows) => ({ h: rows.rowsH, s: rows.s, data: rows }));
    const { point } = bestFit(scored, maxH);
    const rows = point.data;
    const first = marks.length;
    // Leftover height goes to stretchable boxes (text scrolls grow).
    this.placeRows(rows, cx, cy, [], focus, marks, Math.max(0, maxH - point.h));
    this.region(marks, first, { x: g.side, y: g.bar, w: vp.w - g.side - g.sideR, h: vp.h - g.bar }, point.h + 2 * t.pad);
    this.sidebar(focus, rows.collapsed, vp.h, marks);
  }

  /** Side-bar segments for collapsed children, paged by ▲ ▼ when they overflow. */
  private sidebar(focus: TreeNode, collapsed: readonly TreeNode[], h: number, marks: Mark[]): void {
    const t = this.theme;
    const g = t.root;
    const top = g.bar + g.outer;
    // Segments abut: each box includes half the gap above and below, which
    // the renderer draws as background-coloured borders.
    const slot = t.segH + t.segGap;
    let first = top;
    let capacity = Math.max(0, Math.floor((h - top) / slot));
    let offset = 0;
    if (collapsed.length > capacity) {
      const ph = t.chipH + t.segGap; // arrow segments
      first = top + ph;
      // The down arrow takes what's left below the segments (at least its
      // visible height, unless the viewport is tiny).
      capacity = Math.max(1, Math.floor((h - first - ph + t.segGap) / slot));
      const last = Math.max(0, collapsed.length - capacity);
      offset = Math.min(last, Math.max(0, this.offsets[focus.ptr] ?? 0));
      const pager = (dir: 'up' | 'down', y: number, disabled: boolean, to: number): Mark => ({
        kind: 'pager', ptr: focus.ptr, dir, disabled, set: { offset: to }, type: focus.kind, outer: true,
        rect: { x: 0, y, w: g.side, h: ph },
      });
      marks.push(pager('up', top, offset === 0, Math.max(0, offset - capacity)));
      const down = pager('down', first + capacity * slot, offset >= last, Math.min(last, offset + capacity));
      down.rect.h = Math.max(0, h - down.rect.y);
      marks.push(down);
    }
    collapsed.slice(offset, offset + capacity).forEach((n, i) => {
      marks.push({
        kind: 'segment', ptr: n.ptr, text: n.label, badge: badge(n), type: n.kind,
        rect: { x: 0, y: first + i * slot, w: g.side, h: slot },
      });
    });
  }

  /** An opened (targeted) array fills the viewport as a paged container. */
  private planArray(focus: TreeNode, vp: Viewport, marks: Mark[]): void {
    const t = this.theme;
    const g = t.root;
    const R = Math.min(g.outer, g.bar);
    const frame: Mark = {
      kind: 'frame', ptr: focus.ptr, rect: { x: 0, y: 0, w: vp.w, h: vp.h }, arch: 'TB', geom: g, depth: focus.depth,
      type: focus.kind, variant: 'container', outer: true, targetable: true, slot: OUTER,
    };
    marks.push(frame);
    const path = ancestors(focus);
    const title = this.title(focus, R, vp.w - R, g.bar, path.length > 0);
    marks.push(title);
    this.crumbs(path, R, title.rect.x - t.gap, 0, g.bar, OUTER, marks);

    const cw = Math.min(t.listMax, vp.w - 2 * t.pad);
    const cx = Math.round((vp.w - this.measurer.snap(cw)) / 2);
    const cy = g.bar + t.pad;
    const maxH = vp.h - 2 * g.bar - 2 * t.pad;
    const windows = this.measurer.windowed(focus, cw).map((w) => ({ h: w.content.h, s: w.rank, data: w }));
    if (windows.length) {
      const { point } = bestFit(windows, maxH);
      const first = marks.length;
      this.placeValue(focus, point.data.content, cx, cy, focus, marks, Math.max(0, maxH - point.h));
      this.region(marks, first, { x: 0, y: g.bar, w: vp.w, h: vp.h - 2 * g.bar }, point.h + 2 * t.pad);
      this.footer(focus, point.data.start, point.data.end, R, vp.w - R, vp.h - g.bar, g.bar, true, marks);
    }
  }

  /** An array container's bottom bar: the shown range, and ◀ ▶ when it overflows. */
  private footer(node: TreeNode, start: number, end: number, left: number, right: number, y: number, bar: number, outer: boolean, marks: Mark[]): void {
    const t = this.theme;
    const total = node.children.length;
    const overflow = start > 0 || end < total - 1;
    const pw = Math.round(bar * 1.5) + t.segGap; // with half the gap on each side
    let rangeRight = right;
    if (overflow) {
      const next: Mark = {
        kind: 'pager', ptr: node.ptr, dir: 'next', disabled: end >= total - 1, set: { window: { start: end + 1 } },
        type: node.kind, outer, rect: { x: right - pw, y, w: pw, h: bar },
      };
      const prev: Mark = {
        kind: 'pager', ptr: node.ptr, dir: 'prev', disabled: start <= 0, set: { window: { end: start - 1 } },
        type: node.kind, outer, rect: { x: right - 2 * pw, y, w: pw, h: bar },
      };
      marks.push(prev, next);
      rangeRight = prev.rect.x - t.gap;
    }
    const text = `${start + 1}\u2013${end + 1} of ${total}`;
    const natural = Math.ceil(this.metrics.key(text)) + 2 * t.pad;
    const w = Math.max(0, Math.min(natural, rangeRight - left));
    marks.push({ kind: 'range', ptr: node.ptr, text, start, end, total, rect: { x: rangeRight - w, y, w, h: bar } });
  }

  /** An opened scalar (or empty container) has no frame; a bar carries its breadcrumbs. */
  private planUnframed(focus: TreeNode, vp: Viewport, marks: Mark[]): void {
    const t = this.theme;
    const g = t.root;
    const side = 2 * t.gap + t.pad; // page gutter
    let top = t.pad;
    if (focus.parent) {
      marks.push({
        kind: 'frame', ptr: focus.ptr, rect: { x: 0, y: 0, w: vp.w, h: g.bar }, arch: 'T', geom: g, depth: focus.depth,
        type: focus.kind, variant: 'bar', outer: true, targetable: false, slot: OUTER,
      });
      const title = this.title(focus, g.bar / 2, vp.w - g.bar / 2, g.bar, true);
      marks.push(title);
      this.crumbs(ancestors(focus), g.bar / 2, title.rect.x - t.gap, 0, g.bar, OUTER, marks);
      top = g.bar + 2 * t.pad;
    }
    const avail = vp.h - top - t.pad;
    const region: Rect = focus.parent ? { x: 0, y: g.bar, w: vp.w, h: vp.h - g.bar } : { x: 0, y: 0, w: vp.w, h: vp.h };
    const first = marks.length;
    const builtin = this.measurer.variantsFor(focus).every((v) => v.id.startsWith('core/'));
    if (focus.kind === 'string' && builtin) {
      // An opened string is shown in full, at a comfortable reading width.
      const w = Math.min(t.measure, vp.w - 2 * side);
      const text = focus.value as string;
      const style: TextStyle = text.length > t.longText || text.includes('\n') ? 'typeset' : 'plain';
      const full = Math.ceil(this.metrics.text(focus.ptr, text, style).height(w));
      marks.push({ kind: 'text', ptr: focus.ptr, rect: { x: (vp.w - w) / 2, y: top, w, h: full }, text, style, scroll: false, contentHeight: full });
      this.region(marks, first, region, top - region.y + full + t.pad);
      return;
    }
    const w = Math.min(focus.kind === 'array' ? t.listMax : t.measure, vp.w - 2 * side);
    const front = this.measurer.value(focus, w).map((o) => ({ h: o.h, s: o.s, data: o }));
    if (front.length === 0) return;
    // An opened leaf is shown as fully as possible (the view scrolls if needed).
    const { point } = builtin ? bestFit(front, avail) : { point: front.reduce((a, b) => (b.s > a.s ? b : a)) };
    const x = Math.round((vp.w - this.measurer.snap(w)) / 2);
    this.placeValue(focus, point.data, x, top, focus, marks);
    this.region(marks, first, region, top - region.y + point.h + t.pad);
  }

  /**
   * The node's own label, at the right end of the bar span [left, right].
   * With breadcrumbs, room is kept for at least the menu button; a long
   * title is cut short (the renderer truncates its text).
   */
  private title(node: TreeNode, left: number, right: number, bar: number, crumbs: boolean): Extract<Mark, { kind: 'title' }> {
    const t = this.theme;
    const natural = Math.ceil(this.metrics.key(node.label) * t.titleScale) + 2 * t.pad;
    const reserve = crumbs ? bar + 4 + t.gap : 0;
    const w = Math.max(0, Math.min(natural, right - left - reserve));
    return {
      kind: 'title', ptr: node.ptr, text: node.label, trail: [crumb(node)], scale: t.titleScale, outer: true, slot: OUTER,
      rect: { x: right - w, y: 0, w, h: bar },
    };
  }

  /**
   * Breadcrumbs as square bar segments in the nav bar of `slot`, between x0
   * and x1 at height y; those that don't fit go in a menu. Crumbs abut: each
   * box includes half the gap on either side (drawn as background borders).
   */
  private crumbs(path: TreeNode[], x0: number, x1: number, y: number, bar: number, slot: string, marks: Mark[]): void {
    if (path.length === 0) return;
    const t = this.theme;
    const widths = path.map((n) => Math.ceil(this.metrics.key(n.label)) + t.crumbPad + t.segGap);
    const total = widths.reduce((a, b) => a + b, 0);
    const mw = bar + t.segGap;
    let shownFrom = 0;
    let x = x0;
    if (total > x1 - x0) {
      // Keep the nearest ancestors; the rest go in the menu.
      let room = x1 - x0 - mw;
      shownFrom = path.length;
      while (shownFrom > 0 && widths[shownFrom - 1]! <= room) {
        room -= widths[shownFrom - 1]!;
        shownFrom--;
      }
      marks.push({
        kind: 'menu', ptr: path[0]!.ptr, rect: { x, y, w: mw, h: bar }, slot,
        items: path.slice(0, shownFrom).map(crumb),
      });
      x += mw;
    }
    for (let i = shownFrom; i < path.length; i++) {
      const n = path[i]!;
      marks.push({ kind: 'crumb', ptr: n.ptr, text: n.label, type: n.kind, slot, rect: { x, y, w: widths[i]!, h: bar } });
      x += widths[i]!;
    }
  }

  /** `owner` is the node of the nearest enclosing frame (for breadcrumb trails). */
  /**
   * Places the shown rows, then the chips. `extra` is leftover height for
   * stretchable rows: expanded ones get it first, then rows in document order
   * (so the first element of an array container fills its page).
   */
  private placeRows(rows: Rows, x: number, y: number, chips: readonly TreeNode[], owner: TreeNode, marks: Mark[], extra = 0): void {
    const t = this.theme;
    const m = this.measurer;
    const shown = rows.rows.filter((r) => r.opt);
    const grow = new Map<Row, number>();
    const order = [...shown].sort((a, b) => Number(m.prioritized(b.node)) - Number(m.prioritized(a.node)));
    let left = Math.min(extra, rows.stretch);
    for (const row of order) {
      const e = Math.min(left, row.opt!.stretch ?? 0);
      if (e > 0) grow.set(row, e);
      left -= e;
    }
    let yy = y;
    shown.forEach((row, i) => {
      const opt = row.opt!;
      const e = grow.get(row) ?? 0;
      // Single column: frames open to the right (L); bar at the bottom at
      // the top or bottom of the column, otherwise on top.
      const arch = i === 0 || i === shown.length - 1 ? 'LB' : 'LT';
      if (opt.v.t === 'frame') {
        this.placeFrame(row.node, opt.v, x, yy, arch, owner, marks, e);
      } else if (opt.v.t === 'slot') {
        this.placeSlot(opt.v, x, yy, arch, owner, marks, e);
      } else if (opt.v.t === 'container') {
        this.placeContainer(row.node, opt.v, x, yy, owner, marks, e);
      } else if (opt.layout === 'block') {
        this.placeValue(row.node, opt, x, yy, owner, marks, e); // a plugin's full-row display
      } else {
        // The key capsule is as tall as its value (a rounded rectangle when tall).
        marks.push({ kind: 'key', ptr: row.node.ptr, text: row.node.label, type: row.node.kind, rect: { x, y: yy, w: rows.keyW, h: m.rowHeight(row) + e } });
        this.placeValue(row.node, opt, x + rows.keyW + t.gap, yy, owner, marks, e);
      }
      yy += m.rowHeight(row) + e + t.gap;
    });
    if (chips.length === 0) return;
    const grown = [...grow.values()].reduce((a, b) => a + b, 0);
    const top = y + rows.rowsH + grown + (rows.rowsH ? t.gap : 0);
    const widths = chips.map((n) => m.chipWidth(n, rows.width));
    const pos = flow(widths, rows.width, t.chipH, t.gap);
    chips.forEach((n, i) => {
      marks.push({
        kind: 'chip', ptr: n.ptr, text: n.label, badge: badge(n), type: n.kind,
        rect: { x: x + pos[i]!.x, y: top + pos[i]!.y, w: widths[i]!, h: t.chipH },
      });
    });
  }

  private placeFrame(
    node: TreeNode, v: Extract<Value, { t: 'frame' }>, x: number, y: number, arch: ArchVariant, owner: TreeNode, marks: Mark[], extra = 0,
    slot: TreeNode = node,
  ): void {
    const t = this.theme;
    const g = t.frame;
    const h = v.h + extra;
    marks.push({
      kind: 'frame', ptr: node.ptr, rect: { x, y, w: v.w, h }, arch, geom: g, depth: node.depth, type: node.kind,
      variant: 'frame', outer: false, targetable: true, slot: slot.ptr,
    });
    const bottom = arch.endsWith('B');
    const barY = bottom ? y + h - g.bar : y;
    this.navBar(node, owner, x + v.w - g.bar / 2, v.w - g.bar / 2 - g.outer, barY, g.bar, slot, marks);
    const cx = x + g.side + t.pad;
    const cy = (bottom ? y : y + g.bar) + t.pad;
    this.placeRows(v.rows, cx, cy, v.rows.collapsed, node, marks, extra);
  }

  /**
   * A nested container's nav bar, ending at `right`: its title (the shown
   * node) at the right, and before it, as crumb segments, the trail from the
   * enclosing frame (an object in an unframed array: PACKAGES | 0).
   */
  private navBar(node: TreeNode, owner: TreeNode, right: number, maxW: number, y: number, bar: number, slot: TreeNode, marks: Mark[]): void {
    const t = this.theme;
    const trail: Crumb[] = [];
    const path: TreeNode[] = [];
    for (let n: TreeNode | null = node; n && n !== owner; n = n.parent) {
      trail.unshift(crumb(n));
      if (n !== node) path.unshift(n);
    }
    const reserve = path.length ? bar + t.segGap + t.gap : 0;
    const natural = Math.ceil(this.metrics.key(node.label)) + 2 * t.pad;
    const w = Math.max(0, Math.min(natural, maxW - reserve));
    const title: Mark = { kind: 'title', ptr: node.ptr, text: node.label, trail, scale: 1, outer: false, slot: slot.ptr, rect: { x: right - w, y, w, h: bar } };
    marks.push(title);
    const x0 = right - maxW;
    const x1 = title.rect.x - t.gap;
    if (x1 - x0 >= bar + t.segGap) this.crumbs(path, x0, x1, y, bar, slot.ptr, marks); // else the title alone
  }

  /** A container opened to a descendant: the descendant's display, in the container's place. */
  private placeSlot(v: Extract<Value, { t: 'slot' }>, x: number, y: number, arch: ArchVariant, owner: TreeNode, marks: Mark[], extra = 0): void {
    const t = this.theme;
    const inner = v.inner.v;
    if (inner.t === 'frame') return this.placeFrame(v.node, inner, x, y, arch, owner, marks, extra, v.slot);
    if (inner.t === 'container') return this.placeContainer(v.node, inner, x, y, owner, marks, extra, v.slot);
    // A scalar: a bar with the breadcrumbs, and the value below it.
    const g = t.frame;
    marks.push({
      kind: 'frame', ptr: v.node.ptr, rect: { x, y, w: v.w, h: g.bar }, arch: 'T', geom: g, depth: v.node.depth, type: v.node.kind,
      variant: 'bar', outer: false, targetable: true, slot: v.slot.ptr,
    });
    this.navBar(v.node, owner, x + v.w - g.bar / 2, v.w - g.bar, y, g.bar, v.slot, marks);
    this.placeValue(v.node, v.inner, x + t.pad, y + g.bar + t.pad, owner, marks, extra);
  }

  /** A nested array container: title trail in the top bar, range and arrows in the bottom bar. */
  private placeContainer(
    node: TreeNode, v: Extract<Value, { t: 'container' }>, x: number, y: number, owner: TreeNode, marks: Mark[], extra = 0,
    slot: TreeNode = node,
  ): void {
    const t = this.theme;
    const g = { ...t.frame, side: 0 };
    const R = Math.min(g.outer, g.bar);
    const h = v.h + extra;
    marks.push({
      kind: 'frame', ptr: node.ptr, rect: { x, y, w: v.w, h }, arch: 'TB', geom: g, depth: node.depth, type: node.kind,
      variant: 'container', outer: false, targetable: true, slot: slot.ptr,
    });
    this.navBar(node, owner, x + v.w - R, v.w - 2 * R, y, g.bar, slot, marks);
    this.placeValue(node, v.content, x + t.pad, y + g.bar + t.pad, node, marks, extra);
    this.footer(node, v.start, v.end, x + R, x + v.w - R, y + h - g.bar, g.bar, false, marks);
  }

  /** `extra`: height to grow a stretchable option by (at most its `stretch`). */
  private placeValue(node: TreeNode, opt: Option, x: number, y: number, owner: TreeNode, marks: Mark[], extra = 0): void {
    const t = this.theme;
    const v = opt.v;
    switch (v.t) {
      case 'token':
        marks.push({ kind: 'token', ptr: node.ptr, text: v.text, type: node.kind, rect: { x, y, w: v.w, h: t.rowH } });
        break;
      case 'text': {
        const h = v.h + extra;
        marks.push({ kind: 'text', ptr: node.ptr, text: v.text, style: v.style, scroll: h < v.full, contentHeight: v.full, rect: { x, y, w: v.w, h } });
        break;
      }
      case 'custom':
        marks.push({ kind: 'custom', ptr: node.ptr, variant: v.variant, data: v.data, rect: { x, y, w: opt.w, h: opt.h + extra } });
        break;
      case 'tags':
        for (const it of v.items) {
          marks.push({ kind: 'tag', ptr: it.node.ptr, text: it.text, type: it.node.kind, rect: { x: x + it.x, y: y + it.y, w: it.w, h: t.tagH } });
        }
        break;
      case 'list':
        this.placeRows(v.rows, x, y, v.rows.collapsed, owner, marks, extra);
        break;
      case 'frame':
        this.placeFrame(node, v, x, y, 'LT', owner, marks, extra);
        break;
      case 'container':
        this.placeContainer(node, v, x, y, owner, marks, extra);
        break;
      case 'slot':
        this.placeSlot(v, x, y, 'LT', owner, marks, extra);
        break;
    }
  }
}
