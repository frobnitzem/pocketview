/** Pareto fronts over (height, shown): lower height and more shown are better. */
export interface Point<T> {
  h: number;
  s: number;
  data: T;
}

/**
 * Keeps the Pareto-optimal points, sorted by increasing height (and so
 * increasing `shown`), thinned to at most 2 × `keep` points spread over the range.
 */
export function pareto<T>(points: readonly Point<T>[], keep: number): Point<T>[] {
  const sorted = [...points].sort((a, b) => a.h - b.h || b.s - a.s);
  const front: Point<T>[] = [];
  let best = -Infinity;
  for (const p of sorted) {
    if (p.s > best + 1e-9) {
      front.push(p);
      best = p.s;
    }
  }
  if (front.length <= keep) return front;
  // Thin by height: split the height range into `keep` buckets and keep, in
  // each, the lowest point and the one showing the most (the first and last,
  // as the front is sorted). Keeping both means a point just under any
  // height budget survives, not only the best point of its bucket.
  const lo = front[0]!.h;
  const span = front[front.length - 1]!.h - lo || 1;
  const out: Point<T>[] = [];
  let bucket = -1;
  let first: Point<T> | null = null;
  for (const p of front) {
    const b = Math.min(keep - 1, Math.floor(((p.h - lo) / span) * keep));
    if (b !== bucket) {
      out.push(p);
      first = p;
      bucket = b;
    } else if (out[out.length - 1] === first) {
      out.push(p);
    } else {
      out[out.length - 1] = p;
    }
  }
  return out;
}

/** The point with the most shown whose height fits, or the lowest point. */
export function bestFit<T>(front: readonly Point<T>[], maxH: number): { point: Point<T>; fits: boolean } {
  let best: Point<T> | undefined;
  for (const p of front) if (p.h <= maxH + 1e-6 && (!best || p.s > best.s)) best = p;
  if (best) return { point: best, fits: true };
  const lowest = front.reduce((a, b) => (b.h < a.h ? b : a));
  return { point: lowest, fits: false };
}
