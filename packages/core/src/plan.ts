/**
 * Top-down planning: for the focused node and a viewport, choose one option
 * per visible node and give every visible element a rectangle. The result
 * (the marked tree, as a flat list of marks) is all a renderer needs.
 */
import { bestFit } from './frontier';
import { ancestors, find, isLeaf, type Kind, type TreeNode } from './json';
import { badge, flow, Measurer, type Option, type Rows, type Value } from './measure';
import { defaultTheme, type ArchGeometry, type Metrics, type Theme } from './theme';

export type ArchVariant = 'LT' | 'RT' | 'LB' | 'RB' | 'LTR' | 'T';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Mark =
  | { kind: 'frame'; ptr: string; rect: Rect; arch: ArchVariant; geom: ArchGeometry; depth: number }
  | { kind: 'title'; ptr: string; rect: Rect; text: string; /** font size relative to key labels */ scale: number }
  | { kind: 'key'; ptr: string; rect: Rect; text: string }
  | { kind: 'token'; ptr: string; rect: Rect; text: string; type: Kind }
  | { kind: 'text'; ptr: string; rect: Rect; text: string; scroll: boolean; contentHeight: number }
  | { kind: 'tag'; ptr: string; rect: Rect; text: string; type: Kind }
  | { kind: 'chip'; ptr: string; rect: Rect; text: string; badge: string }
  | { kind: 'segment'; ptr: string; rect: Rect; text: string; badge: string }
  | { kind: 'crumb'; ptr: string; rect: Rect; text: string }
  | { kind: 'menu'; ptr: string; rect: Rect; items: { ptr: string; text: string }[] };

export interface Viewport {
  w: number;
  h: number;
}

export interface Plan {
  focus: string;
  marks: Mark[];
  width: number;
  height: number;
  /** The content is taller than the viewport; the view scrolls. */
  overflow: boolean;
}

/** Marks that the user can click to move the focus. */
export const NAVIGABLE = new Set<Mark['kind']>(['chip', 'segment', 'crumb', 'title', 'key']);

export class Planner {
  readonly measurer: Measurer;

  constructor(readonly tree: TreeNode, readonly metrics: Metrics, readonly theme: Theme = defaultTheme) {
    this.measurer = new Measurer(metrics, theme);
  }

  plan(focusPtr: string, vp: Viewport): Plan {
    const focus = find(this.tree, focusPtr) ?? this.tree;
    this.measurer.setDepthLimit(focus.depth + this.theme.maxDepth);
    const marks: Mark[] = [];
    const height = focus.kind === 'object' && !isLeaf(focus)
      ? this.planObject(focus, vp, marks)
      : this.planUnframed(focus, vp, marks);
    return { focus: focus.ptr, marks, width: vp.w, height: Math.max(vp.h, height), overflow: height > vp.h };
  }

  /** The focused object fills the viewport as the outermost LTR frame. */
  private planObject(focus: TreeNode, vp: Viewport, marks: Mark[]): number {
    const t = this.theme;
    const g = t.root;
    const m = this.measurer;
    const frame: Mark = { kind: 'frame', ptr: focus.ptr, rect: { x: 0, y: 0, w: vp.w, h: vp.h }, arch: 'LTR', geom: g, depth: focus.depth };
    marks.push(frame);
    const path = ancestors(focus);
    const title = this.title(focus, g.side + g.inner, vp.w - g.outer, g.bar, path.length > 0);
    marks.push(title);
    this.crumbs(path, g.side + g.inner, title.rect.x - t.gap, g.bar, marks);

    const cx = g.side + t.pad;
    const cy = g.bar + t.pad;
    const cw = vp.w - g.side - g.sideR - 2 * t.pad;
    const maxH = vp.h - g.bar - 2 * t.pad;
    const segTop = g.bar + g.outer;
    const capacity = Math.max(0, Math.floor((vp.h - segTop + t.segGap) / (t.segH + t.segGap)));

    // Collapsed children fill side-bar segments first; any extra become chips.
    const scored = m.rows(focus, cw, 'sidebar').map((rows) => {
      const extra = rows.collapsed.slice(capacity);
      const chipsH = flow(extra.map((n) => m.chipWidth(n, m.snap(cw))), m.snap(cw), t.chipH, t.gap).h;
      const h = rows.rowsH + (rows.rowsH && chipsH ? t.gap : 0) + chipsH;
      return { h, s: rows.s, data: { rows, extra } };
    });
    const { point } = bestFit(scored, maxH);
    const { rows, extra } = point.data;
    this.placeRows(rows, cx, cy, extra, marks);
    rows.collapsed.slice(0, capacity).forEach((n, i) => {
      marks.push({
        kind: 'segment', ptr: n.ptr, text: n.label, badge: badge(n),
        rect: { x: 0, y: segTop + i * (t.segH + t.segGap), w: g.side, h: t.segH },
      });
    });
    const height = cy + point.h + t.pad;
    if (height > vp.h) frame.rect.h = height;
    return height;
  }

  /** Arrays and leaves are drawn without a frame; a T bar carries breadcrumbs. */
  private planUnframed(focus: TreeNode, vp: Viewport, marks: Mark[]): number {
    const t = this.theme;
    const g = t.root;
    const side = 2 * t.gap + t.pad; // page gutter
    let top = t.pad;
    if (focus.parent) {
      marks.push({ kind: 'frame', ptr: focus.ptr, rect: { x: 0, y: 0, w: vp.w, h: g.bar }, arch: 'T', geom: g, depth: focus.depth });
      const title = this.title(focus, g.bar / 2, vp.w - g.bar / 2, g.bar, true);
      marks.push(title);
      this.crumbs(ancestors(focus), g.bar / 2, title.rect.x - t.gap, g.bar, marks);
      top = g.bar + 2 * t.pad;
    }
    const avail = vp.h - top - t.pad;
    if (focus.kind === 'string') {
      const w = Math.min(t.measure, vp.w - 2 * side);
      const text = focus.value as string;
      const full = Math.ceil(this.metrics.text(focus.ptr, text).height(w));
      marks.push({ kind: 'text', ptr: focus.ptr, rect: { x: (vp.w - w) / 2, y: top, w, h: full }, text, scroll: false, contentHeight: full });
      return top + full + t.pad;
    }
    const w = Math.min(focus.kind === 'array' ? t.listMax : t.measure, vp.w - 2 * side);
    const front = this.measurer.value(focus, w).map((o) => ({ h: o.h, s: o.s, data: o }));
    if (front.length === 0) return top;
    const { point } = bestFit(front, avail);
    const x = Math.round((vp.w - this.measurer.snap(w)) / 2);
    this.placeValue(focus, point.data, x, top, marks);
    return top + point.h + t.pad;
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
    return { kind: 'title', ptr: node.ptr, text: node.label, scale: t.titleScale, rect: { x: right - w, y: 0, w, h: bar } };
  }

  /** Breadcrumbs as square bar segments; those that don't fit go in a menu. */
  private crumbs(path: TreeNode[], x0: number, x1: number, bar: number, marks: Mark[]): void {
    if (path.length === 0) return;
    const t = this.theme;
    const cut = 4;
    const widths = path.map((n) => Math.ceil(this.metrics.key(n.label)) + t.crumbPad);
    const total = widths.reduce((a, b) => a + b + cut, 0);
    let shownFrom = 0;
    let x = x0;
    if (total > x1 - x0) {
      // Keep the nearest ancestors; the rest go in the menu.
      let room = x1 - x0 - bar - cut;
      shownFrom = path.length;
      while (shownFrom > 0 && widths[shownFrom - 1]! + cut <= room) {
        room -= widths[shownFrom - 1]! + cut;
        shownFrom--;
      }
      marks.push({
        kind: 'menu', ptr: path[0]!.ptr, rect: { x, y: 0, w: bar, h: bar },
        items: path.slice(0, shownFrom).map((n) => ({ ptr: n.ptr, text: n.label })),
      });
      x += bar + cut;
    }
    for (let i = shownFrom; i < path.length; i++) {
      const n = path[i]!;
      marks.push({ kind: 'crumb', ptr: n.ptr, text: n.label, rect: { x, y: 0, w: widths[i]!, h: bar } });
      x += widths[i]! + cut;
    }
  }

  private placeRows(rows: Rows, x: number, y: number, chips: readonly TreeNode[], marks: Mark[]): void {
    const t = this.theme;
    const m = this.measurer;
    const shown = rows.rows.filter((r) => r.opt);
    let yy = y;
    shown.forEach((row, i) => {
      const opt = row.opt!;
      if (opt.v.t === 'frame') {
        // Single column: frames open to the right (L); bar at the bottom at
        // the top or bottom of the column, otherwise on top.
        const arch = i === 0 || i === shown.length - 1 ? 'LB' : 'LT';
        this.placeFrame(row.node, opt.v, x, yy, arch, marks);
      } else {
        // The key capsule is as tall as its value (a rounded rectangle when tall).
        marks.push({ kind: 'key', ptr: row.node.ptr, text: row.node.label, rect: { x, y: yy, w: rows.keyW, h: m.rowHeight(row) } });
        this.placeValue(row.node, opt, x + rows.keyW + t.gap, yy, marks);
      }
      yy += m.rowHeight(row) + t.gap;
    });
    if (chips.length === 0) return;
    const top = y + rows.rowsH + (rows.rowsH ? t.gap : 0);
    const widths = chips.map((n) => m.chipWidth(n, rows.width));
    const pos = flow(widths, rows.width, t.chipH, t.gap);
    chips.forEach((n, i) => {
      marks.push({
        kind: 'chip', ptr: n.ptr, text: n.label, badge: badge(n),
        rect: { x: x + pos[i]!.x, y: top + pos[i]!.y, w: widths[i]!, h: t.chipH },
      });
    });
  }

  private placeFrame(node: TreeNode, v: Extract<Value, { t: 'frame' }>, x: number, y: number, arch: ArchVariant, marks: Mark[]): void {
    const t = this.theme;
    const g = t.frame;
    marks.push({ kind: 'frame', ptr: node.ptr, rect: { x, y, w: v.w, h: v.h }, arch, geom: g, depth: node.depth });
    const bottom = arch.endsWith('B');
    const barY = bottom ? y + v.h - g.bar : y;
    const titleW = Math.min(Math.ceil(this.metrics.key(node.label)) + 2 * t.pad, v.w - g.bar / 2 - g.outer);
    marks.push({ kind: 'title', ptr: node.ptr, text: node.label, scale: 1, rect: { x: x + v.w - g.bar / 2 - titleW, y: barY, w: titleW, h: g.bar } });
    const cx = x + g.side + t.pad;
    const cy = (bottom ? y : y + g.bar) + t.pad;
    this.placeRows(v.rows, cx, cy, v.rows.collapsed, marks);
  }

  private placeValue(node: TreeNode, opt: Option, x: number, y: number, marks: Mark[]): void {
    const t = this.theme;
    const v = opt.v;
    switch (v.t) {
      case 'token':
        marks.push({ kind: 'token', ptr: node.ptr, text: v.text, type: node.kind, rect: { x, y, w: v.w, h: t.rowH } });
        break;
      case 'text':
        marks.push({ kind: 'text', ptr: node.ptr, text: v.text, scroll: v.scroll, contentHeight: v.full, rect: { x, y, w: v.w, h: v.h } });
        break;
      case 'tags':
        for (const it of v.items) {
          marks.push({ kind: 'tag', ptr: it.node.ptr, text: it.text, type: it.node.kind, rect: { x: x + it.x, y: y + it.y, w: it.w, h: t.tagH } });
        }
        break;
      case 'list':
        this.placeRows(v.rows, x, y, v.rows.collapsed, marks);
        break;
      case 'frame':
        this.placeFrame(node, v, x, y, 'LT', marks);
        break;
    }
  }
}
