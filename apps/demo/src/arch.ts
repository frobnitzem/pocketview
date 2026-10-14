/**
 * Arch frames drawn as one SVG path, so the elbow is a true curve from the
 * horizontal bar into the side bar. (Will move into the renderer package.)
 */
export interface ArchGeometry {
  bar: number;   // thickness of the horizontal bar
  side: number;  // width of the side bar
  outer: number; // radius of the outer elbow curve
  inner: number; // radius of the inner (concave) corner
}

/**
 * RT arch in a w × h box: a top bar whose open (left) end is a half circle,
 * an elbow at the top right, and a side bar down the right edge.
 */
export function rtArchPath(w: number, h: number, g: ArchGeometry): string {
  const { bar, side, outer: R, inner: r } = g;
  const c = bar / 2;
  return [
    `M${c},0`, `L${w - R},0`, `A${R},${R} 0 0 1 ${w},${R}`, `L${w},${h}`,
    `L${w - side},${h}`, `L${w - side},${bar + r}`, `A${r},${r} 0 0 0 ${w - side - r},${bar}`,
    `L${c},${bar}`, `A${c},${c} 0 0 1 ${c},0`, 'Z',
  ].join(' ');
}

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
    path.setAttribute('d', rtArchPath(width, height, g));
  }).observe(el);
}
