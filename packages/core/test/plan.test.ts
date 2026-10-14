import { describe, expect, it } from 'vitest';
import { archPath, buildTree, pareto, Planner, type Json } from '../src/index';
import { fakeMetrics } from './contracts.test';

const PKG: Json = {
  name: 'pocketview',
  version: '0.2.0',
  private: false,
  keywords: ['json', 'yaml', 'viewer'],
  author: { name: 'David M. Rogers', url: 'github.com/frobnitzem' },
  scripts: { test: 'vitest run', build: 'vite build', e2e: 'playwright test' },
  description: 'A JSON viewer to keep in your back pocket. '.repeat(6),
};

describe('pareto', () => {
  it('keeps the front and thins it', () => {
    const pts = [{ h: 1, s: 1 }, { h: 2, s: 1 }, { h: 2, s: 3 }, { h: 3, s: 2 }, { h: 4, s: 5 }].map((p) => ({ ...p, data: 0 }));
    expect(pareto(pts, 10).map((p) => [p.h, p.s])).toEqual([[1, 1], [2, 3], [4, 5]]);
    // Thinning keeps the lowest point and the best point in each height bucket.
    expect(pareto(pts, 2).map((p) => [p.h, p.s])).toEqual([[1, 1], [2, 3], [4, 5]]);
    const many = Array.from({ length: 100 }, (_, i) => ({ h: i, s: i, data: 0 }));
    const thin = pareto(many, 10);
    expect(thin.length).toBeLessThanOrEqual(11);
    expect(thin[0]!.h).toBe(0);
    expect(thin.at(-1)!.h).toBe(99);
  });
});

describe('planner', () => {
  it('shows everything when there is room', () => {
    const plan = new Planner(buildTree(PKG, 'package'), fakeMetrics).plan('', { w: 1200, h: 900 });
    expect(plan.overflow).toBe(false);
    expect(plan.marks.filter((m) => m.kind === 'chip' || m.kind === 'segment')).toEqual([]);
    expect(plan.marks.find((m) => m.kind === 'frame' && m.ptr === '')).toMatchObject({ arch: 'LTR' });
    expect(plan.marks.filter((m) => m.kind === 'tag').map((m) => m.text)).toEqual(['json', 'yaml', 'viewer']);
    const nested = plan.marks.filter((m) => m.kind === 'frame' && m.ptr !== '');
    expect(nested.map((m) => m.ptr)).toEqual(['/author', '/scripts']);
  });

  it('collapses into side-bar segments when space is short', () => {
    const plan = new Planner(buildTree(PKG, 'package'), fakeMetrics).plan('', { w: 520, h: 300 });
    const segments = plan.marks.filter((m) => m.kind === 'segment');
    expect(segments.length).toBeGreaterThan(0);
    expect(plan.overflow).toBe(false);
  });

  it('collapses everything more than maxDepth levels below the focus', () => {
    const doc: Json = { a: { b: { c: { d: { e: { f: 1 } } } } } };
    const plan = new Planner(buildTree(doc), fakeMetrics).plan('', { w: 1400, h: 1000 });
    expect(plan.marks.find((m) => m.ptr === '/a/b/c/d' && m.kind === 'frame')).toBeTruthy();
    expect(plan.marks.find((m) => m.ptr === '/a/b/c/d/e')).toMatchObject({ kind: 'chip' });
    const deeper = new Planner(buildTree(doc), fakeMetrics).plan('/a', { w: 1400, h: 1000 });
    expect(deeper.marks.find((m) => m.ptr === '/a/b/c/d/e')).toMatchObject({ kind: 'frame' });
  });

  it('makes key capsules as tall as their values', () => {
    const plan = new Planner(buildTree(PKG, 'package'), fakeMetrics).plan('', { w: 1200, h: 900 });
    const key = plan.marks.find((m) => m.kind === 'key' && m.ptr === '/description')!;
    const text = plan.marks.find((m) => m.kind === 'text' && m.ptr === '/description')!;
    expect(key.rect.h).toBe(text.rect.h);
    expect(key.rect.h).toBeGreaterThan(28);
  });

  it('puts ancestors in breadcrumbs, with a menu when they do not fit', () => {
    let doc: Json = { leaf: 'x', more: 1 };
    for (let i = 0; i < 12; i++) doc = { [`level_number_${i}`]: doc };
    const tree = buildTree(doc, 'deep');
    let ptr = '';
    for (let i = 11; i >= 0; i--) ptr += `/level_number_${i}`;
    const plan = new Planner(tree, fakeMetrics).plan(ptr, { w: 700, h: 500 });
    expect(plan.marks.some((m) => m.kind === 'menu')).toBe(true);
    expect(plan.marks.filter((m) => m.kind === 'crumb').at(-1)!.ptr).toBe(ptr.slice(0, ptr.lastIndexOf('/')));
  });

  it('draws every arch variant as a closed path', () => {
    const g = { bar: 24, side: 8, sideR: 12, outer: 22, inner: 10 };
    for (const v of ['LT', 'RT', 'LB', 'RB', 'LTR', 'T'] as const) {
      const d = archPath(v, 300, 120, g);
      expect(d.startsWith('M')).toBe(true);
      expect(d.endsWith('Z')).toBe(true);
      expect(d).not.toContain('NaN');
    }
  });
});
