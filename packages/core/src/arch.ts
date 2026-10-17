/**
 * SVG paths for arch frames. Every variant is one closed path: rounded outer
 * elbow, concave inner corner, and a half-circle cap at a bar's open end.
 */
import type { ArchVariant } from './plan.js';
import type { ArchGeometry } from './theme.js';

type Seg = { t: 'M' | 'L'; x: number; y: number } | { t: 'A'; r: number; x: number; y: number; sweep: 0 | 1 };

/** LT in a w × h box: side bar on the left, bar on top, capped at the right. */
function lt(w: number, h: number, g: ArchGeometry): Seg[] {
  const { bar: b, side: s, inner: r } = g;
  const R = Math.min(g.outer, w / 2, h);
  const c = b / 2;
  return [
    { t: 'M', x: 0, y: h }, { t: 'L', x: 0, y: R }, { t: 'A', r: R, x: R, y: 0, sweep: 1 },
    { t: 'L', x: w - c, y: 0 }, { t: 'A', r: c, x: w - c, y: b, sweep: 1 },
    { t: 'L', x: s + r, y: b }, { t: 'A', r, x: s, y: b + r, sweep: 0 }, { t: 'L', x: s, y: h },
  ];
}

/** LTR: side bars left (g.side) and right (g.sideR), bar on top. */
function ltr(w: number, h: number, g: ArchGeometry): Seg[] {
  const { bar: b, side: sl, inner: r } = g;
  const sr = g.sideR ?? g.side;
  const R = Math.min(g.outer, w / 2, h);
  return [
    { t: 'M', x: 0, y: h }, { t: 'L', x: 0, y: R }, { t: 'A', r: R, x: R, y: 0, sweep: 1 },
    { t: 'L', x: w - R, y: 0 }, { t: 'A', r: R, x: w, y: R, sweep: 1 }, { t: 'L', x: w, y: h },
    { t: 'L', x: w - sr, y: h }, { t: 'L', x: w - sr, y: b + r }, { t: 'A', r, x: w - sr - r, y: b, sweep: 0 },
    { t: 'L', x: sl + r, y: b }, { t: 'A', r, x: sl, y: b + r, sweep: 0 }, { t: 'L', x: sl, y: h },
  ];
}

/** T: a bar with half-circle caps at both ends. */
function bar(w: number, g: ArchGeometry): Seg[] {
  const c = g.bar / 2;
  return [
    { t: 'M', x: c, y: 0 }, { t: 'L', x: w - c, y: 0 }, { t: 'A', r: c, x: w - c, y: g.bar, sweep: 1 },
    { t: 'L', x: c, y: g.bar }, { t: 'A', r: c, x: c, y: 0, sweep: 1 },
  ];
}

/** TB: an array container's top and bottom bars, rounded outside, square inside. */
function bars(w: number, h: number, g: ArchGeometry): Seg[] {
  const b = g.bar;
  const R = Math.min(g.outer, b, w / 2);
  return [
    { t: 'M', x: 0, y: b }, { t: 'L', x: 0, y: R }, { t: 'A', r: R, x: R, y: 0, sweep: 1 },
    { t: 'L', x: w - R, y: 0 }, { t: 'A', r: R, x: w, y: R, sweep: 1 }, { t: 'L', x: w, y: b },
    { t: 'L', x: 0, y: b },
    { t: 'M', x: 0, y: h - b }, { t: 'L', x: w, y: h - b }, { t: 'L', x: w, y: h - R },
    { t: 'A', r: R, x: w - R, y: h, sweep: 1 }, { t: 'L', x: R, y: h }, { t: 'A', r: R, x: 0, y: h - R, sweep: 1 },
    { t: 'L', x: 0, y: h - b },
  ];
}

function mirror(segs: Seg[], w: number, h: number, fx: boolean, fy: boolean): Seg[] {
  const flipSweep = fx !== fy;
  return segs.map((s) => {
    const x = fx ? w - s.x : s.x;
    const y = fy ? h - s.y : s.y;
    return s.t === 'A' ? { ...s, x, y, sweep: (flipSweep ? 1 - s.sweep : s.sweep) as 0 | 1 } : { ...s, x, y };
  });
}

const fmt = (n: number) => Number(n.toFixed(2));

export function archPath(variant: ArchVariant, w: number, h: number, g: ArchGeometry): string {
  let segs: Seg[];
  switch (variant) {
    case 'LTR': segs = ltr(w, h, g); break;
    case 'T': segs = bar(w, g); break;
    case 'TB': segs = bars(w, h, g); break;
    case 'LT': segs = lt(w, h, g); break;
    case 'RT': segs = mirror(lt(w, h, g), w, h, true, false); break;
    case 'LB': segs = mirror(lt(w, h, g), w, h, false, true); break;
    case 'RB': segs = mirror(lt(w, h, g), w, h, true, true); break;
  }
  // Each subpath is closed before the next begins.
  return segs.map((s, i) => s.t === 'A'
    ? `A${fmt(s.r)},${fmt(s.r)} 0 0 ${s.sweep} ${fmt(s.x)},${fmt(s.y)}`
    : `${s.t === 'M' && i > 0 ? 'Z ' : ''}${s.t}${fmt(s.x)},${fmt(s.y)}`).join(' ') + ' Z';
}
