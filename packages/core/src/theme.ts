/** Sizes of the visual language, in px. Bars and sides stand 3 : 1 (DESIGN.md). */
export interface ArchGeometry {
  bar: number;   // thickness of the horizontal bar
  side: number;  // width of the side bar (left side for LTR)
  sideR?: number; // right side width, for three-sided frames
  outer: number; // outer elbow radius
  inner: number; // inner corner radius
}

export interface Theme {
  /** Widths are snapped down to multiples of this, which bounds the work. */
  unit: number;
  rowH: number;
  gap: number;
  pad: number;
  keyMin: number;
  keyMax: number;
  keyPad: number;
  tagH: number;
  tagPad: number;
  chipH: number;
  /** Horizontal padding of a chip's label; a badge adds `badgePad` more. */
  chipPad: number;
  badgePad: number;
  segH: number;
  segGap: number;
  crumbPad: number;
  /** Font size of the outermost title relative to key labels. */
  titleScale: number;
  scrollMax: number;
  /** Minimum height of a stretchable text scroll box (it grows into leftover space). */
  scrollMin: number;
  /** Strings longer than this (or with a line break) are typeset; shorter ones wrap plainly. */
  longText: number;
  /** Width of the reading column for a focused string. */
  measure: number;
  /** Widest list when an array is focused. */
  listMax: number;
  /** Pareto points kept per node and width. */
  keep: number;
  /**
   * What a node one level deeper is worth, relative to its parent's level.
   * Content near the focus counts for more, so the planner prefers a parent's
   * own rows over its grandchildren.
   */
  depthDiscount: number;
  /** Nodes more than this many levels below the focus are always collapsed. */
  maxDepth: number;
  root: ArchGeometry & { sideR: number };
  frame: ArchGeometry;
}

export const defaultTheme: Theme = {
  unit: 8,
  rowH: 28,
  gap: 6,
  pad: 10,
  keyMin: 48,
  keyMax: 150,
  keyPad: 22,
  tagH: 26,
  tagPad: 20,
  chipH: 28,
  chipPad: 22,
  badgePad: 21,
  segH: 60,
  segGap: 4,
  crumbPad: 22,
  titleScale: 1.5,
  scrollMax: 280,
  scrollMin: 112,
  longText: 280,
  measure: 648,
  listMax: 960,
  keep: 16,
  depthDiscount: 0.7,
  maxDepth: 4,
  root: { bar: 36, side: 108, sideR: 12, outer: 44, inner: 16 },
  frame: { bar: 24, side: 8, outer: 22, inner: 10 },
};

/** 'plain': wrapped, ragged right, no hyphenation; 'typeset': Knuth–Plass, justified. */
export type TextStyle = 'plain' | 'typeset';

/** Text measurement supplied by the host (the browser, or a fake in tests). */
export interface TextMetrics {
  /** Height of the text set at `width`. */
  height(width: number): number;
}

export interface Metrics {
  /** Width of a key label (uppercase, small caps font), without padding. */
  key(text: string): number;
  /** Width of a one-line value in the text font. */
  value(text: string): number;
  /** Multi-line text, keyed by the node's pointer so hosts can cache it. */
  text(ptr: string, text: string, style?: TextStyle): TextMetrics;
}
