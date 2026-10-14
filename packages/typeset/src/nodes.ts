/** Items of the Knuth–Plass paragraph model, in pixels. */

export interface Box {
  type: 'box';
  width: number;
  text: string;
}

export interface Glue {
  type: 'glue';
  width: number;
  stretch: number;
  shrink: number;
}

export interface Penalty {
  type: 'penalty';
  width: number;
  penalty: number;
  flagged: boolean;
  /** Text shown at the end of the line when breaking here ('-' for a hyphen). */
  text: string;
}

export type Node = Box | Glue | Penalty;

/** Penalties at or beyond ±INFINITY forbid (+) or force (−) a break. */
export const INFINITY = 10000;

/** Stretch of the glue that fills the last line of a paragraph. */
export const FILL = 1e5;

export const box = (width: number, text: string): Box => ({ type: 'box', width, text });

export const glue = (width: number, stretch: number, shrink: number): Glue =>
  ({ type: 'glue', width, stretch, shrink });

export const penalty = (width: number, value: number, flagged = false, text = ''): Penalty =>
  ({ type: 'penalty', width, penalty: value, flagged, text });

export const isForced = (n: Node | undefined): boolean =>
  n !== undefined && n.type === 'penalty' && n.penalty <= -INFINITY;
