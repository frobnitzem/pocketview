/** Colour schemes: each sets the CSS variables of `[data-theme]` (see pocketview.css). */
export const THEMES = [
  { id: 'pastel', label: 'Pastel' },
  { id: 'lux', label: 'Lux' },
  { id: 'solar-dark', label: 'Solarized dark' },
  { id: 'solar-light', label: 'Solarized light' },
] as const;
export type Theme = (typeof THEMES)[number]['id'];

/** How text is drawn. */
export interface ViewSettings {
  /** Mark text whose line breaks are not optimal. */
  diagnostics: boolean;
  /** Long text: justified, or ragged right. */
  align: 'justify' | 'left';
}
