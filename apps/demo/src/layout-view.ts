/**
 * Draws a plan from @pocketview/core: every mark becomes one absolutely
 * positioned element. Clicking a chip, segment, crumb, title or key moves
 * the focus; the plan is then recomputed for the new focus.
 */
import {
  archPath, buildTree, NAVIGABLE, Planner, find, type Json, type Mark, type Metrics, type Plan,
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
  private focus = '';
  private plan: Plan | null = null;
  private readonly observer = new ResizeObserver(() => this.render());

  constructor(private readonly scroller: HTMLElement, private settings: Settings, private onFocus: (ptr: string) => void) {
    scroller.addEventListener('keydown', (e) => {
      if ((e.key === 'Escape' || e.key === 'Backspace') && this.planner && this.focus !== '') {
        const node = find(this.planner.tree, this.focus);
        if (node?.parent) this.setFocus(node.parent.ptr);
      }
    });
  }

  /** Shows a document; returns the time taken to plan it, in ms. */
  show(value: Json, settings: Settings, label?: string): number {
    this.settings = settings;
    this.metrics = browserMetrics();
    this.planner = new Planner(buildTree(value, label), this.metrics);
    this.focus = '';
    this.observer.observe(this.scroller);
    const t0 = performance.now();
    this.render();
    return performance.now() - t0;
  }

  clear(): void {
    this.observer.disconnect();
    this.planner = null;
    this.plan = null;
  }

  setFocus(ptr: string): void {
    this.focus = ptr;
    this.scroller.scrollTop = 0;
    this.render();
    this.onFocus(ptr);
    this.scroller.focus({ preventScroll: true });
  }

  private render(): void {
    if (!this.planner) return;
    const vp = { w: Math.floor(this.scroller.clientWidth), h: Math.floor(this.scroller.clientHeight) };
    if (vp.w <= 0 || vp.h <= 0) return;
    if (this.plan && this.plan.focus === this.focus && this.plan.width === vp.w && this.plan.height === vp.h && this.scroller.firstChild) return;
    this.plan = this.planner.plan(this.focus, vp);
    const root = document.createElement('div');
    root.className = 'pv-layout';
    root.style.width = `${this.plan.width}px`;
    root.style.height = `${this.plan.height}px`;
    for (const mark of this.plan.marks) root.append(this.draw(mark));
    this.scroller.replaceChildren(root);
  }

  private draw(mark: Mark): Element {
    const r = mark.rect;
    if (mark.kind === 'frame') {
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('class', `pv-frame depth-${mark.depth % 3}`);
      svg.setAttribute('viewBox', `0 0 ${r.w} ${r.h}`);
      Object.assign(svg.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', archPath(mark.arch, r.w, r.h, mark.geom));
      svg.append(path);
      return svg;
    }
    const el = document.createElement('div');
    el.className = mark.kind === 'text' ? 'pv-textblock' : `pv-${mark.kind}`; // .pv-text is the lines inside
    Object.assign(el.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    switch (mark.kind) {
      case 'title':
        el.textContent = mark.text;
        el.style.fontSize = `${14 * mark.scale}px`; // as measured: KEY_FONT × scale
        el.style.lineHeight = `${r.h}px`;
        el.classList.toggle('focus', mark.ptr === this.focus);
        el.classList.add(`depth-${this.depthOf(mark.ptr) % 3}`);
        break;
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
        el.innerHTML = '<button aria-label="More breadcrumbs">☰</button><ul hidden></ul>';
        const list = el.querySelector('ul')!;
        for (const item of mark.items) {
          const li = document.createElement('li');
          li.textContent = item.text;
          li.addEventListener('click', () => this.setFocus(item.ptr));
          list.append(li);
        }
        el.querySelector('button')!.addEventListener('click', (e) => { e.stopPropagation(); list.hidden = !list.hidden; });
        break;
      }
    }
    if (NAVIGABLE.has(mark.kind) && mark.ptr !== this.focus) {
      el.classList.add('nav');
      el.setAttribute('role', 'button');
      el.tabIndex = 0;
      const go = () => this.setFocus(mark.ptr);
      el.addEventListener('click', go);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    }
    return el;
  }

  private depthOf(ptr: string): number {
    return this.planner ? (find(this.planner.tree, ptr)?.depth ?? 0) : 0;
  }
}
