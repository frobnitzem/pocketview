/**
 * A viewer: one object owning a document, its layout spec and the target
 * (see "Mental model" in DESIGN.md). Every click takes the same path:
 *
 *   rules (pure) → plan, if the spec changed → draw → notify listeners
 *
 * and a refused click blinks the outer border instead.
 */
import { buildTree, OUTER, Planner, type Json, type Plan, type Viewport } from '@pocketview/core';
import { isMarkdown } from '@pocketview/markdown';
import { addTooltips, blink, drawPlan } from './draw';
import { browserMetrics, KEY_FONT, plugins } from './metrics';
import type { Theme, ViewSettings } from './options';
import { decide, initialState, settleWindows, type Change, type ChangeType, type Input, type Spec, type State } from './rules';
import { FONT, TextView, type ViewStats } from './text';

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

  /** The layout spec: what each container shows, what is expanded, minified and paged. */
  get spec(): Readonly<Spec> {
    return this.now.spec;
  }

  /** The targeted container (`""` for the outermost frame), or null. */
  get target(): string | null {
    return this.now.target;
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

  /** One click: the rules decide, then plan, draw, and notify. */
  private act(input: Input): void {
    const planner = this.planner;
    const vp = this.viewport();
    if (!planner || !this.planned || !vp) return;
    const outcome = decide(input, this.now, { tree: planner.tree, plan: this.planned.plan });
    if ('refuse' in outcome) return this.refuse(outcome.refuse);
    const { state, change, expect } = outcome;
    const key = this.keyOf(state.spec, vp);
    const plan = key === this.planned.key ? this.planned.plan : planner.plan(state.spec, vp);
    if (expect && !expect(plan)) return this.refuse(change.path);
    this.commit(state, plan, vp);
    this.element.focus({ preventScroll: true }); // keep the keyboard here after a redraw
    this.emit(change);
  }

  private refuse(path: string | null): void {
    blink(this.element.querySelector('.pv-layout'));
    this.emit({ type: 'refuse', path });
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

  private keyOf(spec: Spec, vp: Viewport): string {
    return JSON.stringify([spec, vp.w, vp.h]);
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
