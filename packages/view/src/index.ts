/**
 * Embeds a pocketview in a page:
 *
 *   import { mount } from '@pocketview/view'; // its styles come with it
 *   const viewer = mount(document.getElementById('box')!, { title: 'Ada' }, { label: 'person' });
 *   viewer.on('open', (e) => console.log('opened', e.path));
 *
 * The element keeps whatever size the page gives it: the layout fills it
 * exactly and never scrolls the page (only long text scrolls, in its box).
 */
import './pocketview.css';
import type { Json } from '@pocketview/core';
import { Viewer, type ViewerOptions } from './viewer.js';

export { Viewer, fontsReady, type Listener, type Shown, type ViewerEvent, type ViewerOptions } from './viewer.js';
export type { Change, ChangeType, Spec, State } from './rules.js';
export { THEMES, type Theme, type ViewSettings } from './options.js';
export type { ViewStats } from './text.js';
export type { Json } from '@pocketview/core';

/** Turns `element` into a viewer (see `Viewer`). */
export function mount(element: HTMLElement, value?: Json, options?: ViewerOptions): Viewer {
  return new Viewer(element, value, options);
}
