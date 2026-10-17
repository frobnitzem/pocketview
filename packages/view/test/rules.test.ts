/** The interaction rules are pure: they are tested here without a browser. */
import { describe, expect, it } from 'vitest';
import { buildTree, isShown, OUTER, Planner, type Json, type Plan } from '@pocketview/core';
import { fakeMetrics } from '../../core/test/helpers';
import { decide, expand, initialState, minify, pageBy, prune, setTarget, settleWindows, type Input, type Outcome, type State } from '../src/rules';

const DOC: Json = {
  name: 'x',
  a: { b: { c: { x: 1, y: 2 }, d: { z: 3 } }, e: 1 },
  f: { g: 1 },
  list: Array.from({ length: 40 }, (_, i) => `item number ${i} with some words`),
};
const tree = buildTree(DOC);
const planner = new Planner(tree, fakeMetrics);
const VP = { w: 1200, h: 900 };

/** Applies `inputs` in turn, planning after each accepted one, as the viewer does. */
function run(inputs: Input[], start: State = initialState()): { state: State; plan: Plan; outcomes: Outcome[] } {
  let state = start;
  let plan = planner.plan(state.spec, VP);
  const outcomes: Outcome[] = [];
  for (const input of inputs) {
    const out = decide(input, state, { tree, plan });
    outcomes.push(out);
    if ('refuse' in out) continue;
    const next = planner.plan(out.state.spec, VP);
    if (out.expect && !out.expect(next)) { outcomes[outcomes.length - 1] = { refuse: out.change.path }; continue; }
    state = { ...out.state, spec: settleWindows(out.state.spec, next) };
    plan = next;
  }
  return { state, plan, outcomes };
}

describe('interaction rules', () => {
  it('borders toggle the target in place, without changing the spec', () => {
    const { state, outcomes } = run([{ on: 'border', slot: '/a/b' }]);
    expect(state.target).toBe('/a/b');
    expect(state.spec).toEqual(initialState().spec);
    expect(outcomes[0]).toMatchObject({ change: { type: 'target', path: '/a/b' } });
    expect(run([{ on: 'border', slot: OUTER }]).state.target).toBeNull();
  });

  it('opening into the outermost frame re-roots, dropping annotations outside the new root', () => {
    const start: State = { ...initialState(), spec: { ...initialState().spec, expanded: ['/f/g', '/a/e'] } };
    const { state, outcomes } = run([{ on: 'title', ptr: '/a' }], start);
    expect(state.spec.views).toEqual({ [OUTER]: '/a' });
    expect(state.spec.expanded).toEqual(['/a/e']);
    expect(state.target).toBe(OUTER);
    expect(outcomes[0]).toMatchObject({ change: { type: 'open', path: '/a', slot: OUTER } });
  });

  it('opening into a nested target redraws only that slot; outside it is refused', () => {
    const { state, outcomes } = run([
      { on: 'border', slot: '/a/b' },
      { on: 'key', ptr: '/a/b/c/x' },
      { on: 'key', ptr: '/f/g' }, // not under what /a/b shows
    ]);
    expect(state.spec.views).toEqual({ '/a/b': '/a/b/c/x' });
    expect(outcomes[2]).toEqual({ refuse: '/f/g' });
  });

  it("the target's crumbs step back within it; the outermost bar's crumbs re-root", () => {
    const { state } = run([
      { on: 'border', slot: '/a/b' },
      { on: 'key', ptr: '/a/b/c/x' },
      { on: 'crumb', slot: '/a/b', ptr: '/a/b/c' },
    ]);
    expect(state.spec.views).toEqual({ '/a/b': '/a/b/c' });
    const back = run([{ on: 'crumb', slot: '/a/b', ptr: '/a' }], state).state;
    expect(back.spec.views).toEqual({}); // at or above the slot: the slot shows itself
    const rooted = run([{ on: 'title', ptr: '/a/b/c' }]).state;
    expect(run([{ on: 'crumb', slot: OUTER, ptr: '/a' }], rooted).state.spec.views).toEqual({ [OUTER]: '/a' });
  });

  it('untargeted, keys and titles toggle between minified and expanded', () => {
    const untargeted: State = { ...initialState(), target: null };
    const { state, plan, outcomes } = run([{ on: 'title', ptr: '/a' }], untargeted);
    expect(outcomes[0]).toMatchObject({ change: { type: 'minify', path: '/a' } });
    expect(state.spec.minified).toEqual(['/a']);
    expect(isShown(plan, '/a')).toBe(false);
    const again = run([{ on: 'chip', ptr: '/a' }], state);
    expect(again.state.spec).toMatchObject({ minified: [], expanded: ['/a'] });
    const off = run([{ on: 'key', ptr: '/a' }], again.state); // expanded: minified again
    expect(off.state.spec).toMatchObject({ minified: ['/a'], expanded: ['/a'] });
  });

  it('minifying keeps what is expanded inside, hidden; expanding again restores it', () => {
    const untargeted: State = { ...initialState(), target: null };
    const inner = run([{ on: 'chip', ptr: '/a/b' }], untargeted).state;
    expect(inner.spec.expanded).toEqual(['/a/b']);
    const mini = run([{ on: 'title', ptr: '/a' }], inner);
    expect(mini.state.spec).toMatchObject({ minified: ['/a'], expanded: ['/a/b'] });
    expect(isShown(mini.plan, '/a/b')).toBe(false); // the outermost choice wins
    const back = run([{ on: 'chip', ptr: '/a' }], mini.state);
    expect(back.state.spec).toMatchObject({ minified: [], expanded: ['/a/b', '/a'] });
    expect(isShown(back.plan, '/a/b')).toBe(true);
    // Expanding something inside a minified node un-minifies its ancestors.
    const deep = run([{ on: 'title', ptr: '/a' }, { on: 'chip', ptr: '/a/b' }], untargeted);
    expect(deep.state.spec.minified).toEqual([]);
  });

  it('expanding pages array ancestors to the element; expanding or minifying twice changes nothing', () => {
    const untargeted: State = { ...initialState(), target: null };
    const { state, plan } = run([{ on: 'chip', ptr: '/list/30' }], untargeted);
    expect(state.spec.windows['/list']).toEqual({ start: 30 });
    expect(expand('/list/30', state, { tree, plan })).toMatchObject({ state, change: { type: 'expand' } });
    const mini = run([{ on: 'title', ptr: '/a' }], untargeted);
    expect(minify('/a', mini.state, { tree, plan: mini.plan })).toMatchObject({ state: mini.state, change: { type: 'minify' } });
  });

  it('the actions behind the API refuse what cannot be done', () => {
    const state = initialState();
    const plan = planner.plan(state.spec, VP);
    const ctx = { tree, plan };
    expect(setTarget('/nowhere', state, ctx)).toEqual({ refuse: '/nowhere' }); // not a container on the page
    expect(setTarget(null, state, ctx)).toMatchObject({ state: { target: null }, change: { type: 'target', path: null } });
    expect(expand('/nowhere', state, ctx)).toEqual({ refuse: '/nowhere' });
    expect(minify('', state, ctx)).toEqual({ refuse: '' }); // the root itself
    expect(pageBy('/list', 'prev', state, ctx)).toMatchObject({ refuse: '/list' }); // no arrow that way
  });

  it('escape shows the parent of what the target shows', () => {
    const rooted = run([{ on: 'title', ptr: '/a/b' }]).state;
    expect(run([{ on: 'up' }], rooted).state.spec.views).toEqual({ [OUTER]: '/a' });
    expect(run([{ on: 'up' }]).outcomes[0]).toEqual({ refuse: '' }); // at the document root
  });

  it('after an update, annotations on nodes that are gone are dropped', () => {
    const state: State = {
      target: '/a/b',
      spec: {
        views: { [OUTER]: '/a/b/c', '/a/b': '/a/b/d' },
        expanded: ['/a/e', '/f/g'], minified: ['/a/b/d/z'], windows: {}, offsets: {},
      },
    };
    const smaller = buildTree({ a: { b: 7, e: 1 }, f: { g: 1 } });
    expect(prune(state, smaller)).toEqual({
      target: OUTER, // /a/b is no longer a container
      spec: { views: { [OUTER]: '/a/b' }, expanded: ['/a/e', '/f/g'], minified: [], windows: {}, offsets: {} },
    });
  });
});
