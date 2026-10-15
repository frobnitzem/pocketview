/**
 * Draws a plan from @pocketview/core: every mark becomes one absolutely
 * positioned element, coloured by its node's type (object, array, scalar)
 * and status (the target is purple).
 *
 * Targeted (the default): clicking a chip, segment, key, title or crumb
 * makes that node the target, and the view is re-rooted at it. Clicking the
 * target's border un-targets it. Untargeted: clicking a collapsed node
 * expands it in place; clicking one already shown, or with no room, blinks
 * the outer border; breadcrumbs (top bar and container titles) still target.
 */
import {
  archPath, buildTree, find, isShown, NAVIGABLE, Planner, TRAIL_SEPARATOR,
  type Json, type Kind, type Mark, type Metrics, type Plan,
} from '@pocketview/core';
import { canvasMeasure, prepare, renderLines, type Prepared } from '@pocketview/typeset';
import { englishUS } from '@pocketview/typeset/en-us';
import type { Settings } from './settings';
import { FONT, FONT_SIZE, LINE_HEIGHT } from './view';

export const KEY_FONT = '600 14px Antonio';
const KEY_TRACKING = 0.05 * 14; // letter-spacing of key labels (.05em), per character

/** Browser metrics: canvas widths in the fonts the marks are drawn in. */
function browserMetrics(): Metrics & { prepared(ptr: string, text: string): Prepared } {
  const key = canvasMeasure(KEY_FONT);
  const value = canvasMeasure(FONT);
  const texts = new Map<string, Prepared>();
  const prepared = (ptr: string, text: string) => {
    let p = texts.get(ptr);
    if (!p) {
      p = prepare(text, { measure: value, lineHeight: LINE_HEIGHT, hyphenate: englishUS, paragraphSpacing: FONT_SIZE / 2 });
      texts.set(ptr, p);
    }
    return p;
  };
  return {
    key: (s) => key(s.toUpperCase()) + KEY_TRACKING * s.length,
    value: (s) => value(s),
    text: (ptr, s) => ({ height: (w) => prepared(ptr, s).layout(w).height }),
    prepared,
  };
}

export class LayoutView {
  private planner: Planner | null = null;
  private metrics = browserMetrics();
  /** The node the view is rooted at (the outermost frame). */
  private root = '';
  /**
   * Targeted: clicking any node makes it the new root. Untargeted: clicking a
   * collapsed node expands it in place; breadcrumbs still target.
   */
  private targeted = true;
  /** Nodes expanded in place while untargeted. */
  private expanded: string[] = [];
  private plan: Plan | null = null;
  private drawnKey = '';
  private readonly observer = new ResizeObserver(() => this.render());

  constructor(private readonly scroller: HTMLElement, private settings: Settings, private onFocus: (ptr: string) => void) {
    scroller.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.key === 'Backspace') && this.planner) {
        const node = find(this.planner.tree, this.root);
        if (node?.parent) this.target(node.parent.ptr);
      }
    });
  }

  /** Shows a document; returns the time taken to plan it, in ms. */
  show(value: Json, settings: Settings, label?: string): number {
    this.settings = settings;
    this.metrics = browserMetrics();
    this.planner = new Planner(buildTree(value, label), this.metrics);
    this.root = '';
    this.targeted = true;
    this.expanded = [];
    this.plan = null; // a new document: never reuse the previous drawing
    this.drawnKey = '';
    this.observer.observe(this.scroller);
    const t0 = performance.now();
    this.render();
    return performance.now() - t0;
  }

  clear(): void {
    this.observer.disconnect();
    this.planner = null;
    this.plan = null;
    this.drawnKey = '';
  }

  /** Makes `ptr` the target: the view is re-rooted at it. */
  target(ptr: string): void {
    this.root = ptr;
    this.targeted = true;
    this.expanded = [];
    this.scroller.scrollTop = 0;
    this.render();
    this.onFocus(ptr);
    this.scroller.focus({ preventScroll: true });
  }

  /** Clicking the outermost border toggles whether it is the target. */
  private toggleTarget(): void {
    this.targeted = !this.targeted;
    this.expanded = [];
    this.render();
  }

  /** Untargeted click on a collapsed node: show it in place, or blink. */
  private expand(ptr: string): void {
    if (!this.plan || isShown(this.plan, ptr)) return this.blink();
    this.expanded = [...this.expanded, ptr];
    this.render();
    if (this.plan && !isShown(this.plan, ptr)) {
      this.expanded = this.expanded.slice(0, -1);
      this.render();
      this.blink();
    }
  }

  /** Flashes the outermost border: some enclosure must be targeted first. */
  private blink(): void {
    const el = this.scroller.querySelector('.pv-layout');
    if (!el) return;
    el.classList.remove('blink');
    void (el as HTMLElement).offsetWidth; // restart the animation
    el.classList.add('blink');
    window.setTimeout(() => el.classList.remove('blink'), 900);
  }

  private click(mark: Mark): void {
    switch (mark.kind) {
      case 'chip':
      case 'segment':
        return this.targeted ? this.target(mark.ptr) : this.expand(mark.ptr);
      case 'key':
        return this.targeted ? this.target(mark.ptr) : this.blink(); // already shown
      case 'crumb':
        return this.target(mark.ptr);
      default:
        return;
    }
  }

  private render(): void {
    if (!this.planner) return;
    const vp = { w: Math.floor(this.scroller.clientWidth), h: Math.floor(this.scroller.clientHeight) };
    if (vp.w <= 0 || vp.h <= 0) return;
    const key = JSON.stringify([this.root, this.targeted, this.expanded, vp.w, vp.h]);
    if (key === this.drawnKey && this.scroller.firstChild) return;
    this.drawnKey = key;
    this.plan = this.planner.plan(this.root, vp, { expanded: this.expanded });
    const root = document.createElement('div');
    root.className = 'pv-layout';
    root.classList.toggle('targeted', this.targeted);
    root.style.width = `${this.plan.width}px`;
    root.style.height = `${this.plan.height}px`;
    for (const mark of this.plan.marks) root.append(this.draw(mark));
    this.scroller.replaceChildren(root);
    // Labels cut short by their box get their full text as a tooltip.
    for (const label of root.querySelectorAll<HTMLElement>('.pv-title, .pv-chip b, .pv-key span, .pv-crumb span, .pv-segment span')) {
      if (label.scrollWidth > label.clientWidth + 0.5) {
        const box = label.closest<HTMLElement>('.pv-layout > *')!;
        box.title = label.textContent ?? '';
      }
    }
  }

  private draw(mark: Mark): Element {
    const r = mark.rect;
    if (mark.kind === 'frame') {
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      const status = mark.outer ? (this.targeted ? ' outer target' : ' outer') : '';
      svg.setAttribute('class', `pv-frame ${typeClass(mark.type)}${status}`);
      svg.setAttribute('viewBox', `0 0 ${r.w} ${r.h}`);
      Object.assign(svg.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', archPath(mark.arch, r.w, r.h, mark.geom));
      // The border itself is clickable: the outer one toggles the target,
      // a nested one targets its container.
      path.addEventListener('click', () => (mark.outer ? this.toggleTarget() : this.target(mark.ptr)));
      svg.append(path);
      return svg;
    }
    const el = document.createElement('div');
    el.className = mark.kind === 'text' ? 'pv-textblock' : `pv-${mark.kind}`; // .pv-text is the lines inside
    Object.assign(el.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    if ('type' in mark && mark.kind !== 'token' && mark.kind !== 'tag') el.classList.add(typeClass(mark.type));
    switch (mark.kind) {
      case 'title':
        el.style.fontSize = `${14 * mark.scale}px`; // as measured: KEY_FONT × scale
        el.style.lineHeight = `${r.h}px`;
        if (mark.outer) {
          // The outermost title is the target's own name: it toggles the target.
          el.textContent = mark.text;
          el.classList.add('outer', typeClass(mark.trail[0]!.type));
          if (this.targeted) el.classList.add('target');
          el.classList.add('nav');
          el.addEventListener('click', () => this.toggleTarget());
        } else {
          // A nested container's breadcrumb trail; each step targets its node.
          mark.trail.forEach((c, i) => {
            if (i > 0) el.append(TRAIL_SEPARATOR);
            const step = document.createElement('span');
            step.className = `step nav ${typeClass(c.type)}`;
            step.textContent = c.text;
            step.addEventListener('click', () => this.target(c.ptr));
            el.append(step);
          });
        }
        return el;
      case 'key':
      case 'crumb':
      case 'segment':
        el.innerHTML = '<span></span>';
        el.firstElementChild!.textContent = mark.kind === 'segment' && mark.badge ? `${mark.text} ${mark.badge}` : mark.text;
        break;
      case 'chip':
        el.innerHTML = '<b></b><i></i>';
        el.firstElementChild!.textContent = mark.text;
        el.lastElementChild!.textContent = mark.badge;
        if (!mark.badge) el.lastElementChild!.remove();
        break;
      case 'token':
      case 'tag':
        el.textContent = mark.text;
        el.classList.add(`t-${mark.type}`);
        break;
      case 'text': {
        const par = this.metrics.prepared(mark.ptr, mark.text).layout(r.w);
        const lines = renderLines(par, { lineHeight: LINE_HEIGHT });
        el.append(lines);
        if (mark.scroll) el.classList.add('scroll');
        if (this.settings.diagnostics && par.quality !== 'optimal') {
          el.dataset.quality = par.quality;
          el.title = `${par.quality} line breaking`;
        }
        break;
      }
      case 'menu': {
        el.innerHTML = '<button aria-label="More breadcrumbs">\u2630</button><ul hidden></ul>';
        const list = el.querySelector('ul')!;
        for (const item of mark.items) {
          const li = document.createElement('li');
          li.textContent = item.text;
          li.className = typeClass(item.type);
          li.addEventListener('click', () => this.target(item.ptr));
          list.append(li);
        }
        el.querySelector('button')!.addEventListener('click', (e) => { e.stopPropagation(); list.hidden = !list.hidden; });
        break;
      }
    }
    if (NAVIGABLE.has(mark.kind)) {
      el.classList.add('nav');
      el.setAttribute('role', 'button');
      el.tabIndex = 0;
      const go = () => this.click(mark);
      el.addEventListener('click', go);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    }
    return el;
  }
}

/** Colour class by JSON type: objects, arrays, and scalars (all the rest). */
function typeClass(kind: Kind): string {
  return kind === 'object' ? 'ty-object' : kind === 'array' ? 'ty-array' : 'ty-scalar';
}
