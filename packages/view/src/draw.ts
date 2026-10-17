/**
 * Draws a plan: every mark becomes one absolutely positioned element,
 * coloured by its node's type (object, array, scalar) and status (the
 * target is purple). Drawing decides nothing: each click is handed back as
 * an `Input` for the rules (rules.ts).
 */
import { archPath, NAVIGABLE, OUTER, type Kind, type Mark, type Plan } from '@pocketview/core';
import { renderLines } from '@pocketview/typeset';
import { RENDERERS, type BrowserMetrics } from './metrics';
import type { Input } from './rules';
import { LINE_HEIGHT } from './text';

const SCROLLBAR = 14; // width kept free for a scroll box's scrollbar

export interface DrawContext {
  /** The targeted container, or null. */
  target: string | null;
  metrics: BrowserMetrics;
  /** Mark text whose line breaks are not optimal. */
  diagnostics: boolean;
  /** Called with each click. */
  input: (input: Input) => void;
}

export function drawPlan(plan: Plan, ctx: DrawContext): HTMLElement {
  const root = document.createElement('div');
  root.className = 'pv-layout';
  root.classList.toggle('targeted', ctx.target !== null);
  root.style.width = `${plan.width}px`;
  root.style.height = `${plan.height}px`;
  // Content that doesn't fit its frame scrolls inside it; the frame stays put.
  let region: HTMLElement | null = null;
  if (plan.scroll) {
    const r = plan.scroll.rect;
    region = document.createElement('div');
    region.className = 'pv-scroll';
    Object.assign(region.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    const inner = document.createElement('div');
    Object.assign(inner.style, { position: 'relative', height: `${plan.scroll.height}px` });
    region.append(inner);
  }
  const targetable = new Set(plan.marks.filter((m) => m.kind === 'frame' && m.targetable).map((m) => m.kind === 'frame' ? m.slot : ''));
  const isTarget = (slot: string) => ctx.target === slot && targetable.has(slot);
  for (const mark of plan.marks) {
    const el = draw(mark, ctx, isTarget);
    if (mark.scrolled && region) {
      const r = plan.scroll!.rect;
      (el as HTMLElement).style.left = `${mark.rect.x - r.x}px`;
      (el as HTMLElement).style.top = `${mark.rect.y - r.y}px`;
      region.firstElementChild!.append(el);
    } else {
      root.append(el);
    }
  }
  if (region) root.append(region);
  return root;
}

/** Labels cut short by their box get their full text as a tooltip (once the drawing is on the page). */
export function addTooltips(root: HTMLElement): void {
  for (const label of root.querySelectorAll<HTMLElement>('.pv-title, .pv-chip b, .pv-key span, .pv-crumb span, .pv-segment span')) {
    if (label.scrollWidth > label.clientWidth + 0.5) {
      const box = label.closest<HTMLElement>('.pv-layout > *')!;
      box.title = label.textContent ?? '';
    }
  }
}

/** Flashes the outermost border: the click was refused. */
export function blink(root: Element | null): void {
  if (!root) return;
  root.classList.remove('blink');
  void (root as HTMLElement).offsetWidth; // restart the animation
  root.classList.add('blink');
  window.setTimeout(() => root.classList.remove('blink'), 900);
}

/** Makes `el` a button that hands `input` to the rules. */
function button(el: HTMLElement, ctx: DrawContext, input: Input): void {
  el.classList.add('nav');
  el.setAttribute('role', 'button');
  el.tabIndex = 0;
  const go = () => ctx.input(input);
  el.addEventListener('click', go);
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
}

function draw(mark: Mark, ctx: DrawContext, isTarget: (slot: string) => boolean): Element {
  const r = mark.rect;
  if (mark.kind === 'frame') {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    const status = (mark.outer ? ' outer' : '') + (isTarget(mark.slot) ? ' target' : '');
    svg.setAttribute('class', `pv-frame v-${mark.variant} ${typeClass(mark.type)}${status}`);
    svg.setAttribute('viewBox', `0 0 ${r.w} ${r.h}`);
    svg.dataset.slot = mark.slot;
    Object.assign(svg.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', archPath(mark.arch, r.w, r.h, mark.geom));
    // The border itself is clickable: it toggles whether its container is the target.
    path.addEventListener('click', () => ctx.input({ on: 'border', slot: mark.slot }));
    svg.append(path);
    return svg;
  }
  const el = document.createElement('div');
  el.className = mark.kind === 'text' ? 'pv-textblock' : `pv-${mark.kind}`; // .pv-text is the lines inside
  Object.assign(el.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
  if ('type' in mark && mark.kind !== 'token' && mark.kind !== 'tag') el.classList.add(typeClass(mark.type));
  if ('slot' in mark) el.dataset.slot = mark.slot; // the container whose nav bar this is
  switch (mark.kind) {
    case 'title':
      el.style.fontSize = `${14 * mark.scale}px`; // as measured: KEY_FONT × scale
      el.style.lineHeight = `${r.h}px`;
      el.textContent = mark.text;
      el.classList.add(typeClass(mark.trail.at(-1)!.type));
      if (mark.outer) el.classList.add('outer');
      if (isTarget(mark.slot)) el.classList.add('target');
      button(el, ctx, { on: 'title', ptr: mark.ptr });
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
      // A scroll box keeps room for its scrollbar, so lines are never clipped.
      const par = ctx.metrics.prepared(mark.ptr, mark.text, mark.style).layout(mark.scroll ? r.w - SCROLLBAR : r.w);
      el.append(renderLines(par, { lineHeight: LINE_HEIGHT }));
      if (mark.scroll) el.classList.add('scroll');
      if (ctx.diagnostics && par.quality !== 'optimal') {
        el.dataset.quality = par.quality;
        el.title = `${par.quality} line breaking`;
      }
      break;
    }
    case 'range':
      el.textContent = mark.text;
      el.classList.add(typeClass('array'));
      break;
    case 'pager': {
      el.innerHTML = '<span></span>';
      el.firstElementChild!.textContent = { up: '▲', down: '▼', prev: '◀', next: '▶' }[mark.dir];
      el.classList.add(typeClass(mark.type), mark.dir === 'up' || mark.dir === 'down' ? 'v' : 'h');
      if (mark.outer && isTarget(OUTER)) el.classList.add('target');
      button(el, ctx, { on: 'pager', mark });
      el.setAttribute('aria-label', { up: 'Previous segments', down: 'More segments', prev: 'Previous page', next: 'Next page' }[mark.dir]);
      if (mark.disabled) {
        el.classList.add('disabled');
        el.tabIndex = -1;
      }
      return el;
    }
    case 'custom':
      RENDERERS[mark.variant]?.(mark, el);
      break;
    case 'menu': {
      el.innerHTML = '<button aria-label="More breadcrumbs">☰</button><ul hidden></ul>';
      const list = el.querySelector('ul')!;
      for (const item of mark.items) {
        const li = document.createElement('li');
        li.textContent = item.text;
        li.className = typeClass(item.type);
        li.addEventListener('click', () => ctx.input({ on: 'crumb', slot: mark.slot, ptr: item.ptr }));
        list.append(li);
      }
      el.querySelector('button')!.addEventListener('click', (e) => { e.stopPropagation(); list.hidden = !list.hidden; });
      break;
    }
  }
  if (NAVIGABLE.has(mark.kind)) {
    if (mark.kind === 'crumb') button(el, ctx, { on: 'crumb', slot: mark.slot, ptr: mark.ptr });
    else if (mark.kind === 'chip' || mark.kind === 'segment' || mark.kind === 'key') button(el, ctx, { on: mark.kind, ptr: mark.ptr });
  }
  return el;
}

/** Colour class by JSON type: objects, arrays, and scalars (all the rest). */
function typeClass(kind: Kind): string {
  return kind === 'object' ? 'ty-object' : kind === 'array' ? 'ty-array' : 'ty-scalar';
}
