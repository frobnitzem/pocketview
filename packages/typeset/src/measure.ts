/** Width of a string in pixels, in one fixed font. */
export type Measure = (text: string) => number;

/** Memoizes a measure function. Widths are queried for many prefixes, so this matters. */
export function cached(measure: Measure): Measure {
  const cache = new Map<string, number>();
  return (text) => {
    let w = cache.get(text);
    if (w === undefined) {
      w = measure(text);
      cache.set(text, w);
    }
    return w;
  };
}

/**
 * Measures with a 2D canvas, which applies kerning like the DOM does.
 * `font` is a CSS font shorthand, e.g. `17px "Source Serif 4"`. The font must
 * already be loaded (see `document.fonts.load`) or widths will be of the fallback.
 */
export function canvasMeasure(font: string): Measure {
  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(1, 1)
    : document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.font = font;
  ctx.fontKerning = 'normal';
  return cached((text) => ctx.measureText(text).width);
}
