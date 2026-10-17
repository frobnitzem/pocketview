/**
 * A viewer: one object owning a document, its layout spec and the target
 * (see "Mental model" in DESIGN.md). Every click takes the same path:
 *
 *   rules (pure) → plan, if the spec changed → draw → notify listeners
 *
 * and a refused click blinks the outer border instead. The API calls
 * (`target`, `open`, `expand`, `minify`, `page`) run the same actions.
 */
import { buildTree, isShown as shownIn, OUTER, Planner, type Json, type Plan, type Viewport } from '@pocketview/core';
import { isMarkdown } from '@pocketview/markdown';
import { addTooltips, blink, drawPlan } from './draw.js';
import { browserMetrics, KEY_FONT, plugins } from './metrics.js';
import type { Theme, ViewSettings } from './options.js';
import {
  decide, expand, initialState, minify, open, pageBy, prune, setTarget, settleWindows,
  type Change, type ChangeType, type Context, type Input, type Outcome, type Pager, type Spec, type State,
} from './rules.js';
import { FONT, TextView, type ViewStats } from './text.js';

export interface ViewerOptions extends Partial<ViewSettings> {
  /** Colour scheme (default 'pastel'). */
  theme?: Theme;
  /** Name of the document root, shown as its title (default: its type). */
  label?: string;
}

/** What `show` drew: the reading view for a plain string, else the layout. */
export type Shown = ({ view: 'text' } & ViewStats) | { view: 'layout'; millis: number };

/** A change, reported after it has been drawn. Paths are JSON Pointers into the document. */
export interface ViewerEvent extends Change {
  viewer: Viewer;
}

export type Listener = (event: ViewerEvent) => void;

export class Viewer {
  private readonly settings: ViewSettings;
  private readonly metrics = browserMetrics();
  private readonly plugins = plugins();
  private readonly reading: TextView;
  private readonly listeners = new Map<ChangeType | '*', Set<Listener>>();
  private readonly observer = new ResizeObserver(() => this.render());
  private readonly abort = new AbortController();
  /** The document, when it is laid out (null in the reading view). */
  private planner: Planner | null = null;
  private current: { value: Json; label?: string } | null = null;
  private now: State = initialState();
  /** The plan of the current spec, and the spec and viewport it was made for. */
  private planned: { key: string; plan: Plan } | null = null;
  private drawn = '';
  /** Counts updates to the document. */
  private version = 0;

  /**
   * Turns `element` into a viewer. With a `value`, it is shown as soon as the
   * fonts are loaded; call `show` later to replace it.
   */
  constructor(readonly element: HTMLElement, value?: Json, private readonly options: ViewerOptions = {}) {
    this.settings = { diagnostics: options.diagnostics ?? false, align: options.align ?? 'justify' };
    element.classList.add('pocketview');
    element.dataset.theme = options.theme ?? 'pastel';
    if (!element.hasAttribute('tabindex')) element.tabIndex = -1; // keyboard: Escape goes up
    this.reading = new TextView(element, this.settings);
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Backspace') this.act({ on: 'up' });
    }, { signal: this.abort.signal });
    this.observer.observe(element);
    if (value !== undefined) void fontsReady().then(() => { if (!this.current) this.show(value); });
  }

  /**
   * The layout spec (what each container shows, what is expanded, minified
   * and paged) and the target (`""` for the outermost frame, or null).
   */
  get state(): Readonly<State> {
    return this.now;
  }

  /*
   * The actions, as API calls: each runs the same rule as the click, then
   * plans and draws. Each returns whether it succeeded. A listener hears of
   * it only when `notify` is true; a failure changes nothing and does not blink.
   */

  /** Makes the container `slot` the target (`""` for the outermost frame), or none for null. */
  target(slot: string | null, notify = false): boolean {
    return this.call((ctx) => setTarget(slot, this.now, ctx), notify);
  }

  /** Opens `path` into the target: it must lie under what the target shows. */
  open(path: string, notify = false): boolean {
    return this.call((ctx) => open(path, this.now, ctx), notify);
  }

  /** Expands `path` in place: it is shown in preference to everything else. */
  expand(path: string, notify = false): boolean {
    return this.call((ctx) => expand(path, this.now, ctx), notify);
  }

  /** Minifies `path`: it is collapsed even when there is room. */
  minify(path: string, notify = false): boolean {
    return this.call((ctx) => minify(path, this.now, ctx), notify);
  }

  /** Pages the container `path` by a page: 'next'/'prev' (array containers) or 'down'/'up' (the side bar). */
  page(path: string, dir: Pager['dir'], notify = false): boolean {
    return this.call((ctx) => pageBy(path, dir, this.now, ctx), notify);
  }

  /** Blinks the outer border, as a refused click does; with `notify`, reports a 'refuse' for `path`. */
  refuse(path: string | null = null, notify = false): boolean {
    blink(this.element.querySelector('.pv-layout'));
    if (notify) this.emit({ type: 'refuse', path });
    return true;
  }

  /**
   * Replaces the node at `path` with `value`, keeping the navigation and the
   * sizes of everything unchanged. Annotations on nodes that are gone are
   * dropped (the outermost frame falls back to the nearest remaining
   * ancestor). Returns false if there is no node at `path`. The reading view
   * (a document that is one plain string) only takes `path` "".
   */
  update(path: string, value: Json, notify = false): boolean {
    if (!this.current) return false;
    if (!this.planner) {
      if (path !== '') return false;
      this.show(value, this.current.label);
    } else {
      if (!this.planner.update(path, value)) return false;
      this.current = { value: this.planner.tree.value, label: this.current.label };
      this.version++;
      this.now = prune(this.now, this.planner.tree);
      this.render();
    }
    if (notify) this.emit({ type: 'update', path });
    return true;
  }

  /** Whether the node at `path` is drawn itself (not only as a chip, segment or breadcrumb). */
  isShown(path: string): boolean {
    if (!this.current) return false;
    if (!this.planner) return path === '';
    return this.planned !== null && shownIn(this.planned.plan, path);
  }

  /** The document as currently shown, after any updates (the caller's objects are never mutated). */
  get value(): Json | undefined {
    return this.current?.value;
  }

  /** Shows a new document, resetting navigation. Fonts must be loaded (see `fontsReady`). */
  show(value: Json, label = this.options.label): Shown {
    this.current = { value, label };
    this.now = initialState();
    this.planned = null;
    this.drawn = '';
    if (typeof value === 'string' && !isMarkdown(value)) {
      // A whole document of text: the reading view.
      this.planner = null;
      this.element.classList.add('pv-reading');
      return { view: 'text', ...this.reading.show(value, this.settings) };
    }
    this.reading.clear();
    this.element.classList.remove('pv-reading');
    this.planner = new Planner(buildTree(value, label), this.metrics, undefined, this.plugins);
    const t0 = performance.now();
    this.render();
    return { view: 'layout', millis: performance.now() - t0 };
  }

  /** Calls `listener` after each change of `type` (or every change, for '*'); returns an unsubscribe function. */
  on(type: ChangeType | '*', listener: Listener): () => void {
    let set = this.listeners.get(type);
    if (!set) this.listeners.set(type, (set = new Set()));
    set.add(listener);
    return () => set.delete(listener);
  }

  setTheme(theme: Theme): void {
    this.element.dataset.theme = theme;
  }

  /** Changes text settings and redraws, keeping the navigation. */
  configure(changes: Partial<ViewSettings>): void {
    Object.assign(this.settings, changes);
    if (!this.planner && this.current) this.reading.show(this.current.value as string, this.settings);
    this.drawn = '';
    this.render();
  }

  /** Removes the drawing and stops listening to the element. */
  destroy(): void {
    this.observer.disconnect();
    this.abort.abort();
    this.reading.destroy();
    this.listeners.clear();
    this.planner = null;
    this.element.replaceChildren();
    this.element.classList.remove('pocketview', 'pv-reading');
  }

  /** One click: the rules decide, then plan, draw and notify; a refusal blinks. */
  private act(input: Input): void {
    const outcome = this.run((ctx) => decide(input, this.now, ctx));
    if (outcome === null) return;
    if ('refuse' in outcome) {
      this.refuse(outcome.refuse, true);
      return;
    }
    this.element.focus({ preventScroll: true }); // keep the keyboard here after a redraw
    this.emit(outcome.change);
  }

  /** An API call: like a click, but silent unless `notify`, and a refusal only returns false. */
  private call(action: (ctx: Context) => Outcome, notify: boolean): boolean {
    const outcome = this.run(action);
    if (outcome === null || 'refuse' in outcome) return false;
    if (notify) this.emit(outcome.change);
    return true;
  }

  /**
   * Runs an action against the current state; if it succeeds (and the new
   * plan meets its expectation), makes the result current and draws it.
   * Returns the outcome (a refusal if the plan failed it), or null with
   * nothing to act on.
   */
  private run(action: (ctx: Context) => Outcome): Outcome | null {
    const planner = this.planner;
    const vp = this.viewport();
    if (!planner || !this.planned || !vp) return null;
    const outcome = action({ tree: planner.tree, plan: this.planned.plan });
    if ('refuse' in outcome) return outcome;
    const { state, change, expect } = outcome;
    const key = this.keyOf(state.spec, vp);
    const plan = key === this.planned.key ? this.planned.plan : planner.plan(state.spec, vp);
    if (expect && !expect(plan)) return { refuse: change.path };
    this.commit(state, plan, vp);
    return outcome;
  }

  private emit(change: Change): void {
    const event: ViewerEvent = { ...change, viewer: this };
    for (const type of [change.type, '*'] as const) {
      for (const listener of this.listeners.get(type) ?? []) listener(event);
    }
  }

  /** Makes `state` current with its plan, and draws it. */
  private commit(state: State, plan: Plan, vp: Viewport): void {
    const spec = settleWindows(state.spec, plan);
    let target = state.target;
    // A nested target that is no longer on the page hands back to the outermost frame.
    if (target !== null && target !== OUTER && !plan.marks.some((m) => m.kind === 'frame' && m.slot === target)) target = OUTER;
    this.now = { spec, target };
    this.planned = { key: this.keyOf(spec, vp), plan };
    this.draw();
  }

  /** Brings the drawing up to date: re-plans if the viewport changed (or nothing was planned yet). */
  private render(): void {
    const vp = this.viewport();
    if (!this.planner || !vp) return;
    if (this.planned?.key === this.keyOf(this.now.spec, vp)) return this.draw();
    this.commit(this.now, this.planner.plan(this.now.spec, vp), vp);
  }

  private draw(): void {
    if (!this.planned) return;
    const key = JSON.stringify([this.planned.key, this.now.target, this.settings.diagnostics]);
    if (key === this.drawn && this.element.firstChild) return;
    this.drawn = key;
    const root = drawPlan(this.planned.plan, {
      target: this.now.target, metrics: this.metrics, diagnostics: this.settings.diagnostics,
      input: (input) => this.act(input),
    });
    this.element.replaceChildren(root);
    addTooltips(root);
  }

  /** What a plan depends on: the document (its version), the spec and the viewport. */
  private keyOf(spec: Spec, vp: Viewport): string {
    return JSON.stringify([this.version, spec, vp.w, vp.h]);
  }

  /** The space inside the element's padding: the plan fills it exactly. */
  private viewport(): Viewport | null {
    const cs = getComputedStyle(this.element);
    const px = (v: string) => parseFloat(v) || 0;
    const w = Math.floor(this.element.clientWidth - px(cs.paddingLeft) - px(cs.paddingRight));
    const h = Math.floor(this.element.clientHeight - px(cs.paddingTop) - px(cs.paddingBottom));
    return w > 0 && h > 0 ? { w, h } : null;
  }
}

/** Resolves once the fonts the layout is measured in are loaded. */
export function fontsReady(): Promise<unknown> {
  return Promise.all([document.fonts.load(FONT), document.fonts.load(KEY_FONT)]);
}
