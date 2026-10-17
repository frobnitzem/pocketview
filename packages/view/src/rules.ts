/**
 * The interaction rules, as pure functions. Each action (`setTarget`,
 * `open`, `expand`, `minify`, `pageBy`, …) takes its arguments and the
 * current state (layout spec and target) and gives a new state and the
 * change to report, or a refusal. `decide` maps a click to an action. The
 * viewer's API calls the same actions. Nothing here touches the DOM or
 * plans; the viewer does both (see "Mental model" and "Targeting, opening
 * and expanding" in DESIGN.md).
 */
import { find, isShown, OUTER, rootOf, type ArrayWindow, type Mark, type Plan, type TreeNode } from '@pocketview/core';

/** The layout spec, with every field present (see `LayoutSpec` in core). */
export interface Spec {
  views: Record<string, string>;
  expanded: string[];
  minified: string[];
  windows: Record<string, ArrayWindow>;
  offsets: Record<string, number>;
}

export interface State {
  spec: Spec;
  /** The container clicks open into (`OUTER` for the outermost frame), or null. */
  target: string | null;
}

export const initialState = (): State => ({
  spec: { views: {}, expanded: [], minified: [], windows: {}, offsets: {} },
  target: OUTER,
});

export type Pager = Extract<Mark, { kind: 'pager' }>;

/** What was clicked. */
export type Input =
  | { on: 'border'; slot: string }
  | { on: 'title' | 'key' | 'chip' | 'segment'; ptr: string }
  /** A breadcrumb (or menu item) in the nav bar of `slot`. */
  | { on: 'crumb'; slot: string; ptr: string }
  | { on: 'pager'; mark: Pager }
  /** Escape: the target shows its node's parent. */
  | { on: 'up' };

export type ChangeType = 'target' | 'open' | 'expand' | 'minify' | 'page' | 'update' | 'refuse';

/** What an action did, as reported to listeners. */
export interface Change {
  type: ChangeType;
  /** The node acted on (for 'target', what the target shows; null when untargeted). */
  path: string | null;
  /** For 'open': the container it opened into. */
  slot?: string;
}

export type Outcome =
  | {
      state: State;
      change: Change;
      /** Checked against the new plan; if it fails, the action is refused. */
      expect?: (plan: Plan) => boolean;
    }
  | { refuse: string | null };

export interface Context {
  tree: TreeNode;
  plan: Plan;
}

/** Whether `ptr` is `root` or lies below it. */
const within = (ptr: string, root: string): boolean => ptr === root || ptr.startsWith(`${root}/`);
const below = (ptr: string, root: string): boolean => ptr !== root && within(ptr, root);

/** The node a slot shows. */
export function shown(spec: Spec, slot: string): string {
  return slot === OUTER ? rootOf(spec) : spec.views[slot] ?? slot;
}

export function decide(input: Input, state: State, ctx: Context): Outcome {
  const { target } = state;
  switch (input.on) {
    case 'border': return border(input.slot, state, ctx);
    case 'chip':
    case 'segment': return target !== null ? open(input.ptr, state, ctx) : expand(input.ptr, state, ctx);
    case 'key':
    case 'title': return activate(input.ptr, state, ctx);
    case 'crumb': return crumb(input.slot, input.ptr, state, ctx);
    case 'pager': return page(input.mark, state);
    case 'up': return up(state, ctx);
  }
}

/** A border toggles whether its container is the target, in place. */
function border(slot: string, state: State, ctx: Context): Outcome {
  return setTarget(state.target === slot ? null : slot, state, ctx);
}

/**
 * Makes the container `slot` the target (or none, for null). It must be a
 * container on the page that can be a target: an opened scalar's bar cannot.
 */
export function setTarget(slot: string | null, state: State, ctx: Context): Outcome {
  if (slot !== null && !ctx.plan.marks.some((m) => m.kind === 'frame' && m.slot === slot && m.targetable)) {
    return { refuse: slot };
  }
  return {
    state: { ...state, target: slot },
    change: { type: 'target', path: slot === null ? null : shown(state.spec, slot) },
  };
}

/** A key or title: open it if targeted, else toggle it. */
function activate(ptr: string, state: State, ctx: Context): Outcome {
  return state.target !== null ? open(ptr, state, ctx) : toggle(ptr, state, ctx);
}

/**
 * Opens `ptr` into the target. It must lie under what the target shows.
 * Opening into the outermost frame re-roots the view.
 */
export function open(ptr: string, state: State, ctx: Context): Outcome {
  const slot = state.target;
  if (slot === null || !find(ctx.tree, ptr) || !below(ptr, shown(state.spec, slot))) return { refuse: ptr };
  if (slot === OUTER) return reroot(ptr, state);
  return view(slot, ptr, state);
}

/** Points a nested slot at `ptr`: itself, or one of its descendants. */
function view(slot: string, ptr: string, state: State): Outcome {
  const views = { ...state.spec.views };
  if (ptr === slot) delete views[slot];
  else views[slot] = ptr;
  return { state: { ...state, spec: { ...state.spec, views } }, change: { type: 'open', path: ptr, slot } };
}

/**
 * The outermost frame shows `ptr`. Annotations outside it no longer apply
 * and are dropped. The target stays: untargeted stays untargeted, and a
 * nested target that is still inside is kept.
 */
function reroot(ptr: string, state: State): Outcome {
  const { spec } = state;
  const keep = <T>(rec: Record<string, T>) => Object.fromEntries(Object.entries(rec).filter(([k]) => within(k, ptr)));
  const views = keep(spec.views);
  views[OUTER] = ptr;
  const target = state.target === null || state.target === OUTER || below(state.target, ptr) ? state.target : OUTER;
  return {
    state: {
      target,
      spec: {
        views,
        expanded: spec.expanded.filter((p) => within(p, ptr)),
        minified: spec.minified.filter((p) => within(p, ptr)),
        windows: keep(spec.windows),
        offsets: keep(spec.offsets),
      },
    },
    change: { type: 'open', path: ptr, slot: OUTER },
  };
}

/**
 * A breadcrumb acts on the container whose nav bar it is in. The outermost
 * bar's crumbs re-root; the target's crumbs step back within it (a step at
 * or above the container's own node shows the container itself); any other
 * container's crumbs activate their node.
 */
function crumb(slot: string, ptr: string, state: State, ctx: Context): Outcome {
  if (slot === OUTER) return reroot(ptr, state);
  if (state.target !== slot) return activate(ptr, state, ctx);
  return view(slot, within(slot, ptr) ? slot : ptr, state);
}

/**
 * Expands `ptr` in place: it is shown in preference to everything else, its
 * array ancestors page to it, and it and its ancestors are no longer minified.
 */
export function expand(ptr: string, state: State, ctx: Context): Outcome {
  const { spec } = state;
  const hidden = spec.minified.some((m) => within(ptr, m)); // it, or an ancestor, is minified
  if (!find(ctx.tree, ptr)) return { refuse: ptr };
  const change: Change = { type: 'expand', path: ptr };
  const expect = (plan: Plan) => isShown(plan, ptr);
  if (spec.expanded.includes(ptr) && !hidden) return { state, change, expect }; // already: idempotent
  const windows = { ...spec.windows };
  for (let n = find(ctx.tree, ptr); n?.parent; n = n.parent) {
    if (n.parent.kind === 'array') windows[n.parent.ptr] = { start: Number(n.label) };
  }
  return {
    state: {
      ...state,
      spec: {
        ...spec,
        windows,
        expanded: spec.expanded.includes(ptr) ? spec.expanded : [...spec.expanded, ptr],
        // It and its ancestors must be drawn to show it.
        minified: spec.minified.filter((p) => !within(ptr, p)),
      },
    },
    change,
    expect,
  };
}

/**
 * A key or title, untargeted: a node that is expanded or shown is minified;
 * one that is minified or collapsed is expanded.
 */
function toggle(ptr: string, state: State, ctx: Context): Outcome {
  const { spec } = state;
  const shrink = !spec.minified.includes(ptr) && (spec.expanded.includes(ptr) || isShown(ctx.plan, ptr));
  return shrink ? minify(ptr, state, ctx) : expand(ptr, state, ctx);
}

/**
 * Minifies `ptr`: it is collapsed (a chip or side-bar segment) even when
 * there is room. What is expanded inside it stays on the list, hidden
 * while it is minified, so expanding it again restores the same priorities.
 */
export function minify(ptr: string, state: State, ctx: Context): Outcome {
  const { spec } = state;
  if (!find(ctx.tree, ptr) || ptr === rootOf(spec)) return { refuse: ptr };
  const change: Change = { type: 'minify', path: ptr };
  // Elements of a bare array have nowhere to collapse to.
  const expect = (plan: Plan) => !isShown(plan, ptr);
  if (spec.minified.includes(ptr)) return { state, change, expect }; // already: idempotent
  return {
    state: {
      ...state,
      spec: { ...spec, minified: [...spec.minified, ptr] },
    },
    change,
    expect,
  };
}

/**
 * Pages the container `ptr` by one page: 'next' and 'prev' for an array
 * container, 'down' and 'up' for the outer side bar. It must be paged on
 * the page, with an arrow in that direction that is not disabled.
 */
export function pageBy(ptr: string, dir: Pager['dir'], state: State, ctx: Context): Outcome {
  const mark = ctx.plan.marks.find((m): m is Pager => m.kind === 'pager' && m.ptr === ptr && m.dir === dir);
  return mark ? page(mark, state) : { refuse: ptr };
}

/** A paging arrow moves an array window or the side bar by a page. */
function page(mark: Pager, state: State): Outcome {
  if (mark.disabled) return { refuse: mark.ptr };
  const { spec } = state;
  const next = 'offset' in mark.set
    ? { ...spec, offsets: { ...spec.offsets, [mark.ptr]: mark.set.offset } }
    : { ...spec, windows: { ...spec.windows, [mark.ptr]: mark.set.window } };
  return { state: { ...state, spec: next }, change: { type: 'page', path: mark.ptr } };
}

/** Escape: the target (or the outermost frame) shows its node's parent. */
function up(state: State, ctx: Context): Outcome {
  const slot = state.target ?? OUTER;
  const node = shown(state.spec, slot);
  const parent = find(ctx.tree, node)?.parent;
  if (!parent || (slot !== OUTER && node === slot)) return { refuse: node };
  return slot === OUTER ? reroot(parent.ptr, state) : view(slot, parent.ptr, state);
}

/**
 * After planning: a window paged backwards (`{ end }`) is recorded by where
 * the page starts, so the page stays put when the view is re-planned.
 */
export function settleWindows(spec: Spec, plan: Plan): Spec {
  let windows: Record<string, ArrayWindow> | null = null;
  for (const [ptr, w] of Object.entries(spec.windows)) {
    if (!('end' in w)) continue;
    const range = plan.marks.find((m) => m.kind === 'range' && m.ptr === ptr);
    if (range?.kind !== 'range') continue;
    windows ??= { ...spec.windows };
    windows[ptr] = { start: range.start };
  }
  return windows ? { ...spec, windows } : spec;
}

/**
 * After the document changed: annotations whose nodes are gone are dropped.
 * The outermost frame falls back to the nearest ancestor that still exists,
 * and a nested target that no longer exists hands back to it.
 */
export function prune(state: State, tree: TreeNode): State {
  const { spec } = state;
  const node = (p: string) => find(tree, p);
  const exists = (p: string) => node(p) !== undefined;
  let root = rootOf(spec);
  while (!exists(root)) root = root.slice(0, root.lastIndexOf('/'));
  const views: Record<string, string> = {};
  for (const [slot, ptr] of Object.entries(spec.views)) {
    if (slot !== OUTER && exists(ptr) && below(ptr, slot) && (node(slot)?.children.length ?? 0) > 0) views[slot] = ptr;
  }
  if (root !== '') views[OUTER] = root;
  const keep = <T>(rec: Record<string, T>) => Object.fromEntries(Object.entries(rec).filter(([k]) => exists(k)));
  const target = state.target === null || state.target === OUTER || (node(state.target)?.children.length ?? 0) > 0
    ? state.target : OUTER;
  return {
    target,
    spec: {
      views,
      expanded: spec.expanded.filter(exists),
      minified: spec.minified.filter(exists),
      windows: keep(spec.windows),
      offsets: keep(spec.offsets),
    },
  };
}
