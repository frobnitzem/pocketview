/**
 * The navigation contracts of DESIGN.md, checked on random JSON and
 * random viewports.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { ancestors, buildTree, defaultTheme, find, walk, type Json, type Metrics, type TreeNode } from '../src/index';
import { Planner, type Mark, type Plan } from '../src/plan';

// Deterministic fake metrics: no fonts needed.
export const fakeMetrics: Metrics = {
  key: (s) => 7.5 * s.length,
  value: (s) => 8.5 * s.length,
  text: (_ptr, s) => ({
    height: (w) => {
      const perLine = Math.max(1, Math.floor(w / 8.5));
      return s.split('\n').reduce((n, p) => n + Math.max(1, Math.ceil(p.length / perLine)), 0) * 28;
    },
  }),
};

const LEAF_KINDS = new Set<Mark['kind']>(['title', 'key', 'token', 'text', 'tag', 'chip', 'segment', 'crumb', 'menu', 'range', 'pager', 'custom']);

function overlaps(a: Mark['rect'], b: Mark['rect']): boolean {
  const e = 0.01;
  return a.x < b.x + b.w - e && b.x < a.x + a.w - e && a.y < b.y + b.h - e && b.y < a.y + a.h - e;
}

function containers(root: TreeNode): TreeNode[] {
  return [...walk(root)];
}

function check(plan: Plan, tree: TreeNode, focus: TreeNode, vp: { w: number; h: number }, expanding = false): void {
  // 3. The plan fits: the page never scrolls. Everything is within the
  // viewport, except content of the scroll region (if any), which is within
  // the region's width and its content height.
  expect(plan.width).toBe(vp.w);
  expect(plan.height).toBe(vp.h);
  expect(plan.overflow).toBe(plan.scroll !== undefined);
  for (const m of plan.marks) {
    const box = m.scrolled
      ? { x: plan.scroll!.rect.x, y: plan.scroll!.rect.y, w: plan.scroll!.rect.w, h: plan.scroll!.height }
      : { x: 0, y: 0, w: vp.w, h: vp.h };
    expect(m.rect.x, `${m.kind} ${m.ptr}`).toBeGreaterThanOrEqual(box.x - 0.01);
    expect(m.rect.y, `${m.kind} ${m.ptr} top`).toBeGreaterThanOrEqual(box.y - 0.01);
    expect(m.rect.x + m.rect.w, `${m.kind} ${m.ptr} right edge`).toBeLessThanOrEqual(box.x + box.w + 0.01);
    expect(m.rect.y + m.rect.h, `${m.kind} ${m.ptr} bottom`).toBeLessThanOrEqual(box.y + box.h + 0.01);
  }
  // No two drawn elements overlap (frames contain them, so they are excluded).
  const leaves = plan.marks.filter((m) => LEAF_KINDS.has(m.kind));
  const sameLayer = (a: Mark, b: Mark) => !!a.scrolled === !!b.scrolled;
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const a = leaves[i]!;
      const b = leaves[j]!;
      if (sameLayer(a, b)) expect(overlaps(a.rect, b.rect), `${a.kind} ${a.ptr} overlaps ${b.kind} ${b.ptr}`).toBe(false);
    }
  }
  // Frames nest: two frames are disjoint, or one contains the other.
  const frames = plan.marks.filter((m) => m.kind === 'frame' && m.arch !== 'T');
  const contains = (a: Mark['rect'], b: Mark['rect']) =>
    b.x >= a.x - 0.01 && b.y >= a.y - 0.01 && b.x + b.w <= a.x + a.w + 0.01 && b.y + b.h <= a.y + a.h + 0.01;
  for (let i = 0; i < frames.length; i++) {
    for (let j = i + 1; j < frames.length; j++) {
      const a = frames[i]!.rect;
      const b = frames[j]!.rect;
      if (!sameLayer(frames[i]!, frames[j]!)) continue; // scrolled content vs the stationary frame
      expect(!overlaps(a, b) || contains(a, b) || contains(b, a), `frames ${frames[i]!.ptr} / ${frames[j]!.ptr}`).toBe(true);
    }
  }
  // Depth bound: nothing more than maxDepth levels below the focus is shown
  // (the scalar items of a tags display sit one level further).
  const limit = focus.depth + defaultTheme.maxDepth;
  for (const m of expanding ? [] : plan.marks) { // expanded nodes may go deeper
    if (m.kind === 'crumb' || m.kind === 'menu' || m.kind === 'chip' || m.kind === 'segment') continue;
    const node = find(tree, m.ptr)!;
    expect(node.depth - (m.kind === 'tag' ? 1 : 0), `${m.kind} ${m.ptr} too deep`).toBeLessThanOrEqual(limit);
  }
  // 4. The path is visible: every ancestor of the focus is a crumb or in the menu.
  const inPath = new Set<string>();
  for (const m of plan.marks) {
    if (m.kind === 'crumb') inPath.add(m.ptr);
    if (m.kind === 'menu') for (const it of m.items) inPath.add(it.ptr);
  }
  for (const a of ancestors(focus)) expect(inPath.has(a.ptr), `ancestor ${a.ptr}`).toBe(true);
  // 5. Everything is reachable: each node under the focus is marked, sits
  // under a collapsed chip or segment, or is paged out of a container that
  // has paging arrows (an array window, or the outer side bar).
  const marked = new Set(plan.marks.filter((m) => m.kind !== 'pager' && m.kind !== 'range').map((m) => m.ptr));
  const collapsed = new Set(plan.marks.filter((m) => m.kind === 'chip' || m.kind === 'segment').map((m) => m.ptr));
  const paged = new Set(plan.marks.filter((m) => m.kind === 'pager').map((m) => m.ptr));
  for (const n of walk(focus)) {
    if (n === focus) continue;
    let ok = marked.has(n.ptr);
    for (let q: TreeNode | null = n; !ok && q && q !== focus; q = q.parent) {
      ok = collapsed.has(q.ptr) || (q.parent !== null && paged.has(q.parent.ptr) && !marked.has(q.ptr));
    }
    expect(ok, `node ${JSON.stringify(n.ptr)} unreachable`).toBe(true);
  }
  // The focus itself is always drawn (as its frame, bar, text or value).
  if (focus.parent) expect(marked.has(focus.ptr), 'focus drawn').toBe(true);
}

const viewport = fc.record({ w: fc.integer({ min: 240, max: 1600 }), h: fc.integer({ min: 200, max: 1200 }) });
const json = fc.jsonValue({ maxDepth: 4 }) as fc.Arbitrary<Json>;

describe('navigation contracts', () => {
  it('hold at the root for any document and viewport', () => {
    fc.assert(fc.property(json, viewport, (doc, vp) => {
      const tree = buildTree(doc);
      const plan = new Planner(tree, fakeMetrics).plan('', vp);
      check(plan, tree, tree, vp);
    }), { numRuns: 300 });
  });

  it('hold with the focus anywhere in the tree', () => {
    fc.assert(fc.property(json, viewport, fc.nat(), (doc, vp, pick) => {
      const tree = buildTree(doc);
      const nodes = containers(tree);
      const focus = nodes[pick % nodes.length]!;
      const plan = new Planner(tree, fakeMetrics).plan(focus.ptr, vp);
      check(plan, tree, focus, vp);
    }), { numRuns: 300 });
  });

  it('hold with random nodes expanded in place', () => {
    fc.assert(fc.property(json, viewport, fc.array(fc.nat(), { maxLength: 3 }), (doc, vp, picks) => {
      const tree = buildTree(doc);
      const nodes = containers(tree);
      const expanded = picks.map((p) => nodes[p % nodes.length]!.ptr);
      const plan = new Planner(tree, fakeMetrics).plan('', vp, { expanded });
      check(plan, tree, tree, vp, true);
      // Titles carry breadcrumb trails that end at their own node.
      for (const m of plan.marks) if (m.kind === 'title') expect(m.trail.at(-1)!.ptr).toBe(m.ptr);
    }), { numRuns: 200 });
  });

  it('are deterministic', () => {
    fc.assert(fc.property(json, viewport, (doc, vp) => {
      const tree = buildTree(doc);
      const a = new Planner(tree, fakeMetrics).plan('', vp);
      const b = new Planner(tree, fakeMetrics).plan('', vp);
      expect(a).toEqual(b);
    }), { numRuns: 50 });
  });
});
