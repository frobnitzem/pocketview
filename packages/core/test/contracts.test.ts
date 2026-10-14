/**
 * The navigation contracts of DESIGN.md, checked on random JSON and
 * random viewports.
 */
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { ancestors, buildTree, walk, type Json, type Metrics, type TreeNode } from '../src/index';
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

const LEAF_KINDS = new Set<Mark['kind']>(['title', 'key', 'token', 'text', 'tag', 'chip', 'segment', 'crumb', 'menu']);

function overlaps(a: Mark['rect'], b: Mark['rect']): boolean {
  const e = 0.01;
  return a.x < b.x + b.w - e && b.x < a.x + a.w - e && a.y < b.y + b.h - e && b.y < a.y + a.h - e;
}

function containers(root: TreeNode): TreeNode[] {
  return [...walk(root)];
}

function check(plan: Plan, tree: TreeNode, focus: TreeNode, vp: { w: number; h: number }): void {
  // 3. The plan fits: within the viewport (or the scrolled content height).
  expect(plan.width).toBe(vp.w);
  if (!plan.overflow) expect(plan.height).toBe(vp.h);
  for (const m of plan.marks) {
    expect(m.rect.x, `${m.kind} ${m.ptr}`).toBeGreaterThanOrEqual(-0.01);
    expect(m.rect.y).toBeGreaterThanOrEqual(-0.01);
    expect(m.rect.x + m.rect.w, `${m.kind} ${m.ptr} right edge`).toBeLessThanOrEqual(plan.width + 0.01);
    expect(m.rect.y + m.rect.h, `${m.kind} ${m.ptr} bottom`).toBeLessThanOrEqual(plan.height + 0.01);
  }
  // No two drawn elements overlap (frames contain them, so they are excluded).
  const leaves = plan.marks.filter((m) => LEAF_KINDS.has(m.kind));
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const a = leaves[i]!;
      const b = leaves[j]!;
      expect(overlaps(a.rect, b.rect), `${a.kind} ${a.ptr} overlaps ${b.kind} ${b.ptr}`).toBe(false);
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
      expect(!overlaps(a, b) || contains(a, b) || contains(b, a), `frames ${frames[i]!.ptr} / ${frames[j]!.ptr}`).toBe(true);
    }
  }
  // 4. The path is visible: every ancestor of the focus is a crumb or in the menu.
  const inPath = new Set<string>();
  for (const m of plan.marks) {
    if (m.kind === 'crumb') inPath.add(m.ptr);
    if (m.kind === 'menu') for (const it of m.items) inPath.add(it.ptr);
  }
  for (const a of ancestors(focus)) expect(inPath.has(a.ptr), `ancestor ${a.ptr}`).toBe(true);
  // 5. Everything is reachable: each node under the focus is marked, or sits
  // under a collapsed chip or segment.
  const marked = new Set(plan.marks.map((m) => m.ptr));
  const collapsed = new Set(plan.marks.filter((m) => m.kind === 'chip' || m.kind === 'segment').map((m) => m.ptr));
  for (const n of walk(focus)) {
    if (n === tree && n === focus && !n.parent) continue;
    let ok = marked.has(n.ptr);
    for (let p = n.parent; !ok && p && p !== focus.parent; p = p.parent) ok = collapsed.has(p.ptr);
    if (n === focus) ok = ok || !focus.parent;
    expect(ok, `node ${JSON.stringify(n.ptr)} unreachable`).toBe(true);
  }
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

  it('are deterministic', () => {
    fc.assert(fc.property(json, viewport, (doc, vp) => {
      const tree = buildTree(doc);
      const a = new Planner(tree, fakeMetrics).plan('', vp);
      const b = new Planner(tree, fakeMetrics).plan('', vp);
      expect(a).toEqual(b);
    }), { numRuns: 50 });
  });
});
