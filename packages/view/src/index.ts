/**
 * Embeds a pocketview in a page:
 *
 *   import { mount } from '@pocketview/view'; // its styles come with it
 *   const viewer = mount(document.getElementById('box')!, { title: 'Ada' }, { label: 'person' });
 *
 * The element keeps whatever size the page gives it: the layout fills it
 * exactly and never scrolls the page (only long text scrolls, in its box).
 */
import './pocketview.css';
import type { Json } from '@pocketview/core';
import { isMarkdown } from '@pocketview/markdown';
import { KEY_FONT, LayoutView } from './layout';
import type { Theme, ViewSettings } from './options';
import { FONT, TextView, type ViewStats } from './text';

export { THEMES, type Theme, type ViewSettings } from './options';
export type { ViewStats } from './text';
export type { Json } from '@pocketview/core';

export interface ViewerOptions extends Partial<ViewSettings> {
  /** Colour scheme (default 'pastel'). */
  theme?: Theme;
  /** Name of the document root, shown as its title (default: its type). */
  label?: string;
  /** Called with the JSON Pointer of the node the target shows, when it changes. */
  onFocus?: (ptr: string) => void;
}

/** What `show` drew: the reading view for a plain string, else the layout. */
export type Shown = ({ view: 'text' } & ViewStats) | { view: 'layout'; millis: number };

export interface Viewer {
  /** Shows a new document, resetting navigation. Fonts must be loaded (see `fontsReady`). */
  show(value: Json, label?: string): Shown;
  setTheme(theme: Theme): void;
  /** Changes text settings and redraws the current document. */
  configure(settings: Partial<ViewSettings>): void;
  /** Removes the drawing and stops listening to the element. */
  destroy(): void;
}

/** Resolves once the fonts the layout is measured in are loaded. */
export function fontsReady(): Promise<unknown> {
  return Promise.all([document.fonts.load(FONT), document.fonts.load(KEY_FONT)]);
}

/**
 * Turns `element` into a viewer. With a `value`, it is shown as soon as the
 * fonts are loaded; call `show` later to replace it.
 */
export function mount(element: HTMLElement, value?: Json, options: ViewerOptions = {}): Viewer {
  const settings: ViewSettings = { diagnostics: options.diagnostics ?? false, align: options.align ?? 'justify' };
  element.classList.add('pocketview');
  element.dataset.theme = options.theme ?? 'pastel';
  if (!element.hasAttribute('tabindex')) element.tabIndex = -1; // keyboard: Escape goes up
  const text = new TextView(element, settings);
  const layout = new LayoutView(element, settings, options.onFocus ?? (() => {}));
  let current: { value: Json; label?: string } | null = null;

  const show = (v: Json, label = options.label): Shown => {
    current = { value: v, label };
    if (typeof v === 'string' && !isMarkdown(v)) {
      // A whole document of text: the reading view.
      layout.clear();
      element.classList.add('pv-reading');
      return { view: 'text', ...text.show(v, settings) };
    }
    text.clear();
    element.classList.remove('pv-reading');
    return { view: 'layout', millis: layout.show(v, settings, label) };
  };

  if (value !== undefined) void fontsReady().then(() => { if (!current) show(value); });
  return {
    show,
    setTheme: (theme) => { element.dataset.theme = theme; },
    configure: (changes) => {
      Object.assign(settings, changes);
      if (current) show(current.value, current.label);
    },
    destroy: () => {
      text.destroy();
      layout.destroy();
      element.replaceChildren();
      element.classList.remove('pocketview', 'pv-reading');
    },
  };
}
