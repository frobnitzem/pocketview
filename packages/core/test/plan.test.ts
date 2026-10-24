import { describe, expect, it } from 'vitest';
import { archPath, buildTree, find, isShown, pareto, Planner, replaceAt, type Json, type Variant } from '../src/index';
import { fakeMetrics } from './helpers';

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
    const plan = new Planner(buildTree(PKG, 'package'), fakeMetrics).plan({}, { w: 1200, h: 900 });
    expect(plan.overflow).toBe(false);
    expect(plan.marks.filter((m) => m.kind === 'chip' || m.kind === 'segment')).toEqual([]);
    expect(plan.marks.find((m) => m.kind === 'frame' && m.ptr === '')).toMatchObject({ arch: 'LTR' });
    expect(plan.marks.filter((m) => m.kind === 'tag').map((m) => m.text)).toEqual(['json', 'yaml', 'viewer']);
    const nested = plan.marks.filter((m) => m.kind === 'frame' && m.ptr !== '');
    expect(nested.map((m) => m.ptr)).toEqual(['/author', '/scripts']);
  });

  it('collapses into side-bar segments when space is short', () => {
    const plan = new Planner(buildTree(PKG, 'package'), fakeMetrics).plan({}, { w: 520, h: 300 });
    const segments = plan.marks.filter((m) => m.kind === 'segment');
    expect(segments.length).toBeGreaterThan(0);
    expect(plan.overflow).toBe(false);
  });

  it('collapses everything more than maxDepth levels below the focus', () => {
    const doc: Json = { a: { b: { c: { d: { e: { f: 1 } } } } } };
    const plan = new Planner(buildTree(doc), fakeMetrics).plan({}, { w: 1400, h: 1000 });
    expect(plan.marks.find((m) => m.ptr === '/a/b/c/d' && m.kind === 'frame')).toBeTruthy();
    expect(plan.marks.find((m) => m.ptr === '/a/b/c/d/e')).toMatchObject({ kind: 'chip' });
    const deeper = new Planner(buildTree(doc), fakeMetrics).plan({ views: { '': '/a' } }, { w: 1400, h: 1000 });
    expect(deeper.marks.find((m) => m.ptr === '/a/b/c/d/e')).toMatchObject({ kind: 'frame' });
  });

  it('expands a collapsed node in place, keeping its parent', () => {
    const tree = buildTree(PKG, 'package');
    const planner = new Planner(tree, fakeMetrics);
    const vp = { w: 520, h: 300 };
    const before = planner.plan({}, vp);
    const collapsed = before.marks.find((m) => m.kind === 'segment' || m.kind === 'chip')!;
    expect(isShown(before, collapsed.ptr)).toBe(false);
    const after = planner.plan({ expanded: [collapsed.ptr] }, vp);
    expect(isShown(after, collapsed.ptr)).toBe(true);
    expect(after.focus).toBe('');
  });

  it('expands past the depth limit, and titles carry breadcrumb trails', () => {
    const doc: Json = { a: { b: { c: { d: { e: { f: 1 } } } } }, list: [{ x: 1 }] };
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const plan = planner.plan({ expanded: ['/a/b/c/d/e'] }, { w: 1400, h: 1000 });
    expect(isShown(plan, '/a/b/c/d/e')).toBe(true);
    const item = plan.marks.find((m) => m.kind === 'title' && m.ptr === '/list/0');
    expect(item).toMatchObject({ text: '0' });
    if (item?.kind === 'title') expect(item.trail.map((c) => c.type)).toEqual(['array', 'object']);
    // The rest of the trail is crumb segments in the item's own nav bar.
    expect(plan.marks.find((m) => m.kind === 'crumb' && m.slot === '/list/0')).toMatchObject({ ptr: '/list', text: 'list' });
  });

  it('makes key capsules as tall as their values', () => {
    const plan = new Planner(buildTree(PKG, 'package'), fakeMetrics).plan({}, { w: 1200, h: 900 });
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
    const plan = new Planner(tree, fakeMetrics).plan({ views: { '': ptr } }, { w: 700, h: 500 });
    expect(plan.marks.some((m) => m.kind === 'menu')).toBe(true);
    expect(plan.marks.filter((m) => m.kind === 'crumb' && m.slot === '').at(-1)!.ptr).toBe(ptr.slice(0, ptr.lastIndexOf('/')));
  });

  it('keeps arrays bare when they fit, and uses a paged container when not', () => {
    const records = Array.from({ length: 12 }, (_, i) => ({ id: i, name: `item ${i}` }));
    const doc: Json = { tags: ['a', 'b'], records };
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const big = planner.plan({}, { w: 1200, h: 2400 });
    expect(big.marks.some((m) => m.kind === 'frame' && m.variant === 'container')).toBe(false);
    expect(big.marks.filter((m) => m.kind === 'tag')).toHaveLength(2);
    const small = planner.plan({}, { w: 900, h: 500 });
    const range = small.marks.find((m) => m.kind === 'range' && m.ptr === '/records');
    expect(range).toBeTruthy();
    if (range?.kind !== 'range') throw new Error('no range');
    expect(range.start).toBe(0);
    expect(range.text).toBe(`1\u2013${range.end + 1} of 12`);
    const next = small.marks.find((m) => m.kind === 'pager' && m.dir === 'next' && m.ptr === '/records');
    expect(next).toMatchObject({ disabled: false, set: { window: { start: range.end + 1 } } });
    // Page forward, then back: the window starts after the last shown element.
    const page2 = planner.plan({ windows: { '/records': { start: range.end + 1 } } }, { w: 900, h: 500 });
    const range2 = page2.marks.find((m) => m.kind === 'range' && m.ptr === '/records');
    if (range2?.kind !== 'range') throw new Error('no range');
    expect(range2.start).toBe(range.end + 1);
    const back = planner.plan({ windows: { '/records': { end: range2.start - 1 } } }, { w: 900, h: 500 });
    const range3 = back.marks.find((m) => m.kind === 'range' && m.ptr === '/records');
    if (range3?.kind !== 'range') throw new Error('no range');
    expect(range3.end).toBe(range2.start - 1);
  });

  it('opens an array as a targetable container, and a scalar under an untargetable bar', () => {
    const doc: Json = { list: Array.from({ length: 40 }, (_, i) => ({ i })), note: 'hello' };
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const plan = planner.plan({ views: { '': '/list' } }, { w: 800, h: 400 });
    expect(plan.marks[0]).toMatchObject({ kind: 'frame', arch: 'TB', variant: 'container', outer: true, targetable: true });
    expect(plan.marks.find((m) => m.kind === 'crumb')).toMatchObject({ ptr: '' });
    expect(plan.marks.some((m) => m.kind === 'pager' && m.dir === 'next')).toBe(true);
    const note = planner.plan({ views: { '': '/note' } }, { w: 800, h: 400 });
    expect(note.marks[0]).toMatchObject({ kind: 'frame', variant: 'bar', targetable: false });
  });

  it('pages the outer side bar when its segments overflow', () => {
    const doc: Json = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`key${i}`, { a: 1, b: 2 }]));
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const plan = planner.plan({}, { w: 600, h: 400 });
    const up = plan.marks.find((m) => m.kind === 'pager' && m.dir === 'up');
    const down = plan.marks.find((m) => m.kind === 'pager' && m.dir === 'down');
    expect(up).toMatchObject({ disabled: true });
    expect(down).toMatchObject({ disabled: false });
    const first = plan.marks.filter((m) => m.kind === 'segment').map((m) => m.ptr);
    if (down?.kind !== 'pager' || !('offset' in down.set)) throw new Error('no offset');
    const paged = planner.plan({ offsets: { '': down.set.offset } }, { w: 600, h: 400 });
    const second = paged.marks.filter((m) => m.kind === 'segment').map((m) => m.ptr);
    expect(second[0]).not.toBe(first[0]);
    expect(second.some((p) => first.includes(p))).toBe(false);
  });

  it('grows stretchable text into leftover height, and pages a book a chapter at a time', () => {
    const long = 'The stranger came early in February, one wintry day. '.repeat(120);
    const doc: Json = { title: 'A book', chapters: Array.from({ length: 5 }, (_, i) => ({ n: i + 1, text: long })) };
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const plan = planner.plan({ views: { '': '/chapters' } }, { w: 900, h: 700 });
    const range = plan.marks.find((m) => m.kind === 'range');
    // The first chapter can't be shown in full, so it has the page to itself...
    expect(range).toMatchObject({ start: 0, end: 0, total: 5 });
    // ...and its text fills the page (well beyond the minimum scroll box).
    const text = plan.marks.find((m) => m.kind === 'text' && m.ptr === '/chapters/0/text');
    expect(text).toMatchObject({ scroll: true });
    expect(text!.rect.h).toBeGreaterThan(400);
    expect(plan.overflow).toBe(false);
  });

  it('opens a nested container to a descendant in place, with its own breadcrumbs', () => {
    const doc: Json = { name: 'x', author: { name: 'A', address: { city: 'Oak Ridge', zip: '37830' } } };
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const plan = planner.plan({ views: { '/author': '/author/address' } }, { w: 1000, h: 700 });
    const frame = plan.marks.find((m) => m.kind === 'frame' && m.slot === '/author');
    expect(frame).toMatchObject({ ptr: '/author/address', variant: 'frame' });
    const title = plan.marks.find((m) => m.kind === 'title' && m.slot === '/author');
    if (title?.kind !== 'title') throw new Error('no title');
    expect(title.trail.map((c) => c.text)).toEqual(['author', 'address']);
    expect(plan.marks.filter((m) => m.kind === 'crumb' && m.slot === '/author').map((m) => m.ptr)).toEqual(['/author']);
    // The root and its other rows stay where they were.
    expect(plan.marks.find((m) => m.kind === 'token' && m.ptr === '/name')).toBeTruthy();
    expect(plan.marks.some((m) => m.ptr === '/author/name')).toBe(false);
    // A scalar opened in a slot sits under a bar.
    const scalar = planner.plan({ views: { '/author': '/author/name' } }, { w: 1000, h: 700 });
    expect(scalar.marks.find((m) => m.kind === 'frame' && m.slot === '/author')).toMatchObject({ variant: 'bar', ptr: '/author/name' });
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

  it('minifies a node that would otherwise be shown, and expanding brings it back', () => {
    const planner = new Planner(buildTree(PKG, 'package'), fakeMetrics);
    const vp = { w: 1200, h: 900 };
    expect(isShown(planner.plan({}, vp), '/author')).toBe(true);
    const mini = planner.plan({ minified: ['/author'] }, vp);
    expect(isShown(mini, '/author')).toBe(false);
    expect(mini.marks.some((m) => (m.kind === 'chip' || m.kind === 'segment') && m.ptr === '/author')).toBe(true);
    // The outermost choice wins: something expanded inside it stays hidden.
    expect(isShown(planner.plan({ minified: ['/author'], expanded: ['/author/name'] }, vp), '/author/name')).toBe(false);
  });

  it('navigating in one container keeps the other containers measured', () => {
    let measured = 0;
    const counting: Variant = {
      id: 'test/count', layout: 'block',
      match: (n) => (n.ptr === '/b' ? 10 : null),
      measure: (n, w, m) => { measured++; return m.frame(n, w); },
    };
    const doc: Json = { a: { x: { p: 1 }, y: { q: 2 } }, b: { u: 1, v: 2 } };
    const planner = new Planner(buildTree(doc), fakeMetrics, undefined, [counting]);
    const vp = { w: 1000, h: 800 };
    planner.plan({}, vp);
    const first = measured;
    expect(first).toBeGreaterThan(0);
    planner.plan({ expanded: ['/a/x'] }, vp);
    planner.plan({ minified: ['/a/y'] }, vp);
    expect(measured).toBe(first);
    planner.plan({ minified: ['/b/u'] }, vp); // inside /b: measured again
    expect(measured).toBeGreaterThan(first);
  });

  it('updates a node in place, keeping the nodes (and sizes) of unchanged parts', () => {
    const doc: Json = { a: { x: 1, y: { deep: true } }, b: [1, 2, 3], c: 'text' };
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const keptY = find(planner.tree, '/a/y');
    const changed: string[] = [];
    expect(replaceAt(planner.tree, '/a', { x: 2, y: { deep: true } }, (n) => changed.push(n.ptr))).toBe(true);
    expect(find(planner.tree, '/a/y')).toBe(keptY); // equal content: the same node
    expect(changed.sort()).toEqual(['', '/a', '/a/x']);
    expect(planner.tree.value).toEqual({ a: { x: 2, y: { deep: true } }, b: [1, 2, 3], c: 'text' });
    expect(doc).toEqual({ a: { x: 1, y: { deep: true } }, b: [1, 2, 3], c: 'text' }); // never mutated
    expect(planner.update('/nowhere', 1)).toBe(false);
  });

  it('paging forward starts at the first element that was not shown in full', () => {
    const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i % 17}`).join(' ');
    const doc: Json = { chapters: Array.from({ length: 8 }, (_, i) => ({ n: i + 1, text: words(60 + 40 * (i % 3)) })) };
    const planner = new Planner(buildTree(doc), fakeMetrics);
    let checked = 0;
    let partial = 0;
    for (let h = 300; h <= 1400; h += 50) {
      const plan = planner.plan({ views: { '': '/chapters' } }, { w: 700, h });
      const range = plan.marks.find((m) => m.kind === 'range');
      const next = plan.marks.find((m) => m.kind === 'pager' && m.dir === 'next');
      if (range?.kind !== 'range' || next?.kind !== 'pager' || next.disabled || !('window' in next.set)) continue;
      // An element is cut short if its text scrolls or some of its keys collapsed into chips.
      const cut = (i: number) => plan.marks.some((m) =>
        (m.kind === 'text' && m.ptr === `/chapters/${i}/text` && m.scroll) ||
        (m.kind === 'chip' && m.ptr.startsWith(`/chapters/${i}/`)));
      let expected = range.end + 1;
      for (let i = range.start + 1; i <= range.end; i++) if (cut(i)) { expected = i; break; }
      expect(next.set.window).toEqual({ start: expected });
      checked++;
      if (expected <= range.end) partial++;
    }
    expect(checked).toBeGreaterThan(5);
    expect(partial).toBeGreaterThan(0); // some page did end on an element cut short
  });

  it('an array element shown in a container gets arrows to its neighbours', () => {
    const doc: Json = { list: [{ a: 1 }, { a: 2 }, { a: 3 }], box: { items: ['x', 'y'] } };
    const planner = new Planner(buildTree(doc), fakeMetrics);
    const arrows = (plan: ReturnType<typeof planner.plan>) => plan.marks.filter((m) => m.kind === 'pager' && 'sibling' in m.set);
    // The outermost frame showing /list/1: ◀ opens /list/0, ▶ opens /list/2.
    const outer = arrows(planner.plan({ views: { '': '/list/1' } }, { w: 900, h: 600 }));
    expect(outer.map((m) => m.kind === 'pager' && [m.dir, m.set, m.disabled])).toEqual([
      ['prev', { sibling: '/list/0', slot: '' }, false],
      ['next', { sibling: '/list/2', slot: '' }, false],
    ]);
    // At the end, ▶ is disabled.
    const last = arrows(planner.plan({ views: { '': '/list/2' } }, { w: 900, h: 600 }));
    expect(last.map((m) => m.kind === 'pager' && m.disabled)).toEqual([false, true]);
    // A nested container opened to an element of an array inside it.
    const nested = arrows(planner.plan({ views: { '/box': '/box/items/0' } }, { w: 900, h: 600 }));
    expect(nested.map((m) => m.kind === 'pager' && m.set)).toEqual([
      { sibling: '/box/items/0', slot: '/box' }, { sibling: '/box/items/1', slot: '/box' },
    ]);
    // Not for the document root, nor an element in a plain list (its own frame is its container).
    expect(arrows(planner.plan({}, { w: 900, h: 600 }))).toEqual([]);
  });
});
