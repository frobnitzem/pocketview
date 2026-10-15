import { describe, expect, it } from 'vitest';
import { archPath, buildTree, isShown, pareto, Planner, type Json } from '../src/index';
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
    // Thinning keeps the lowest and the best point in each height bucket.
    expect(pareto(pts, 2).map((p) => [p.h, p.s])).toEqual([[1, 1], [2, 3], [4, 5]]);
    const many = Array.from({ length: 100 }, (_, i) => ({ h: i, s: i, data: 0 }));
    const thin = pareto(many, 10);
    expect(thin.length).toBeLessThanOrEqual(20);
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

  it('expands a collapsed node in place, keeping its parent', () => {
    const tree = buildTree(PKG, 'package');
    const planner = new Planner(tree, fakeMetrics);
    const vp = { w: 520, h: 300 };
    const before = planner.plan('', vp);
    const collapsed = before.marks.find((m) => m.kind === 'segment' || m.kind === 'chip')!;
    expect(isShown(before, collapsed.ptr)).toBe(false);
    const after = planner.plan('', vp, { expanded: [collapsed.ptr] });
    expect(isShown(after, collapsed.ptr)).toBe(true);
    expect(after.focus).toBe('');
  });

  it('expands past the depth limit, and titles carry breadcrumb trails', () => {
    const doc: Json = { a: { b: { c: { d: { e: { f: 1 } } } } }, list: [{ x: 1 }] };
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const plan = planner.plan('', { w: 1400, h: 1000 }, { expanded: ['/a/b/c/d/e'] });
    expect(isShown(plan, '/a/b/c/d/e')).toBe(true);
    const item = plan.marks.find((m) => m.kind === 'title' && m.ptr === '/list/0');
    expect(item).toMatchObject({ text: 'list \u203a 0' });
    if (item?.kind === 'title') expect(item.trail.map((c) => c.type)).toEqual(['array', 'object']);
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

  it('keeps arrays bare when they fit, and uses a paged container when not', () => {
    const records = Array.from({ length: 12 }, (_, i) => ({ id: i, name: `item ${i}` }));
    const doc: Json = { tags: ['a', 'b'], records };
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const big = planner.plan('', { w: 1200, h: 2400 });
    expect(big.marks.some((m) => m.kind === 'frame' && m.variant === 'container')).toBe(false);
    expect(big.marks.filter((m) => m.kind === 'tag')).toHaveLength(2);
    const small = planner.plan('', { w: 900, h: 500 });
    const range = small.marks.find((m) => m.kind === 'range' && m.ptr === '/records');
    expect(range).toBeTruthy();
    if (range?.kind !== 'range') throw new Error('no range');
    expect(range.start).toBe(0);
    expect(range.text).toBe(`1\u2013${range.end + 1} of 12`);
    const next = small.marks.find((m) => m.kind === 'pager' && m.dir === 'next' && m.ptr === '/records');
    expect(next).toMatchObject({ disabled: false, set: { window: { start: range.end + 1 } } });
    // Page forward, then back: the window starts after the last shown element.
    const page2 = planner.plan('', { w: 900, h: 500 }, { windows: { '/records': { start: range.end + 1 } } });
    const range2 = page2.marks.find((m) => m.kind === 'range' && m.ptr === '/records');
    if (range2?.kind !== 'range') throw new Error('no range');
    expect(range2.start).toBe(range.end + 1);
    const back = planner.plan('', { w: 900, h: 500 }, { windows: { '/records': { end: range2.start - 1 } } });
    const range3 = back.marks.find((m) => m.kind === 'range' && m.ptr === '/records');
    if (range3?.kind !== 'range') throw new Error('no range');
    expect(range3.end).toBe(range2.start - 1);
  });

  it('opens an array as a targetable container, and a scalar under an untargetable bar', () => {
    const doc: Json = { list: Array.from({ length: 40 }, (_, i) => ({ i })), note: 'hello' };
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const plan = planner.plan('/list', { w: 800, h: 400 });
    expect(plan.marks[0]).toMatchObject({ kind: 'frame', arch: 'TB', variant: 'container', outer: true, targetable: true });
    expect(plan.marks.find((m) => m.kind === 'crumb')).toMatchObject({ ptr: '' });
    expect(plan.marks.some((m) => m.kind === 'pager' && m.dir === 'next')).toBe(true);
    const note = planner.plan('/note', { w: 800, h: 400 });
    expect(note.marks[0]).toMatchObject({ kind: 'frame', variant: 'bar', targetable: false });
  });

  it('pages the outer side bar when its segments overflow', () => {
    const doc: Json = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`key${i}`, { a: 1, b: 2 }]));
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const plan = planner.plan('', { w: 600, h: 400 });
    const up = plan.marks.find((m) => m.kind === 'pager' && m.dir === 'up');
    const down = plan.marks.find((m) => m.kind === 'pager' && m.dir === 'down');
    expect(up).toMatchObject({ disabled: true });
    expect(down).toMatchObject({ disabled: false });
    const first = plan.marks.filter((m) => m.kind === 'segment').map((m) => m.ptr);
    if (down?.kind !== 'pager' || !('offset' in down.set)) throw new Error('no offset');
    const paged = planner.plan('', { w: 600, h: 400 }, { offsets: { '': down.set.offset } });
    const second = paged.marks.filter((m) => m.kind === 'segment').map((m) => m.ptr);
    expect(second[0]).not.toBe(first[0]);
    expect(second.some((p) => first.includes(p))).toBe(false);
  });

  it('grows stretchable text into leftover height, and pages a book a chapter at a time', () => {
    const long = 'The stranger came early in February, one wintry day. '.repeat(120);
    const doc: Json = { title: 'A book', chapters: Array.from({ length: 5 }, (_, i) => ({ n: i + 1, text: long })) };
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const plan = planner.plan('/chapters', { w: 900, h: 700 });
    const range = plan.marks.find((m) => m.kind === 'range');
    // The first chapter can't be shown in full, so it has the page to itself...
    expect(range).toMatchObject({ start: 0, end: 0, total: 5 });
    // ...and its text fills the page (well beyond the minimum scroll box).
    const text = plan.marks.find((m) => m.kind === 'text' && m.ptr === '/chapters/0/text');
    expect(text).toMatchObject({ scroll: true });
    expect(text!.rect.h).toBeGreaterThan(400);
    expect(plan.overflow).toBe(false);
  });

  it('draws every arch variant as a closed path', () => {
    const g = { bar: 24, side: 8, sideR: 12, outer: 22, inner: 10 };
    for (const v of ['LT', 'RT', 'LB', 'RB', 'LTR', 'T', 'TB'] as const) {
      const d = archPath(v, 300, 120, g);
      expect(d.startsWith('M')).toBe(true);
      expect(d.endsWith('Z')).toBe(true);
      expect(d).not.toContain('NaN');
    }
  });
});
