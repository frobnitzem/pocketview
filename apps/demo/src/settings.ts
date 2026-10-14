export interface Settings {
  /** Mark text whose line breaks are not optimal. */
  diagnostics: boolean;
  align: 'justify' | 'left';
  theme: Theme;
}

export const THEMES = [
  { id: 'pastel', label: 'Pastel' },
  { id: 'lux', label: 'Lux' },
  { id: 'solar-dark', label: 'Solarized dark' },
  { id: 'solar-light', label: 'Solarized light' },
] as const;
export type Theme = (typeof THEMES)[number]['id'];

/** Applies a colour scheme to the page (all colours are CSS variables). */
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
