export interface Settings {
  /** Mark text whose line breaks are not optimal. */
  diagnostics: boolean;
  align: 'justify' | 'left';
}

const KEY = 'pocketview.settings';
const DEFAULTS: Settings = { diagnostics: false, align: 'justify' };

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
