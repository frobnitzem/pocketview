/** The input pane's RT arch, drawn with the same paths as the view's frames. */
import { archPath, type ArchGeometry } from '@pocketview/core';
export type { ArchGeometry } from '@pocketview/core';

/** Draws an RT arch behind the contents of `el`, following its size. */
export function mountArch(el: HTMLElement, g: ArchGeometry): void {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.classList.add('arch');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(ns, 'path');
  svg.append(path);
  el.prepend(svg);
  new ResizeObserver(() => {
    const { width, height } = el.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    path.setAttribute('d', archPath('RT', width, height, g));
  }).observe(el);
}
