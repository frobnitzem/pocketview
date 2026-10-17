import type { Theme, ViewSettings } from '@pocketview/view';

export { THEMES, type Theme } from '@pocketview/view';

export interface Settings extends ViewSettings {
  theme: Theme;
}

/** Applies a colour scheme to the demo page (the viewer gets its own, via setTheme). */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

const KEY = 'pocketview.settings';
const DEFAULTS: Settings = { diagnostics: false, align: 'justify', theme: 'pastel' };

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(s: Settings): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
}
