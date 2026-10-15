import { describe, expect, it } from 'vitest';
import { buildTree, Planner, type Json, type Variant } from '../src/index';
import { fakeMetrics } from './helpers';

// A string plugin: strings starting with "md:" get a custom display.
const stringPlugin: Variant = {
  id: 'test/md', layout: 'value',
  match: (n) => (n.kind === 'string' && (n.value as string).startsWith('md:') ? 10 : null),
  measure: (n, w) => [{ w, h: 56, s: 2, v: { t: 'custom', variant: 'test/md', data: { text: n.value } } }],
};

// An object plugin, matched by shape: {x, y} points take a full row.
const pointPlugin: Variant = {
  id: 'test/point', layout: 'block',
  match: (n) => (n.kind === 'object' && n.children.map((c) => c.label).join() === 'x,y' ? 10 : null),
  measure: (n, w) => [{ w, h: 40, s: 3, v: { t: 'custom', variant: 'test/point', data: n.value } }],
};

describe('display variants (plugins)', () => {
  it('a higher-priority plugin replaces the built-in display of the nodes it matches', () => {
    const doc: Json = { a: 'md:# hello', b: 'plain' };
    const plan = new Planner(buildTree(doc), fakeMetrics, undefined, [stringPlugin]).plan('', { w: 900, h: 600 });
    expect(plan.marks.find((m) => m.ptr === '/a' && m.kind === 'custom')).toMatchObject({ variant: 'test/md', rect: { h: 56 } });
    expect(plan.marks.find((m) => m.ptr === '/b' && m.kind === 'token')).toBeTruthy();
  });

  it('resolves conflicts in favour of the outermost matching node', () => {
    // The point plugin displays its whole subtree, so the string plugin is
    // never asked about the string inside it.
    const doc: Json = { p: { x: 'md:inner', y: 2 }, q: 'md:outer' };
    const plan = new Planner(buildTree(doc), fakeMetrics, undefined, [stringPlugin, pointPlugin]).plan('', { w: 900, h: 600 });
    expect(plan.marks.find((m) => m.ptr === '/p')).toMatchObject({ kind: 'custom', variant: 'test/point' });
    expect(plan.marks.some((m) => m.ptr === '/p/x')).toBe(false);
    expect(plan.marks.find((m) => m.ptr === '/q' && m.kind === 'custom')).toMatchObject({ variant: 'test/md' });
  });
});
