import '@fontsource/antonio/600.css';
import '@fontsource/source-serif-4/400.css';
import './style.css';
import { mountArch } from './arch';
import { createEditor } from './editor';
import { parseInput, type InputMode } from './parse';
import { SAMPLES } from './samples';
import { applyTheme, loadSettings, saveSettings, THEMES, type Settings, type Theme } from './settings';
import type { Json } from '@pocketview/core';
import { isMarkdown } from '@pocketview/markdown';
import { KEY_FONT, LayoutView } from './layout-view';
import { FONT, TextView } from './view';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const settings: Settings = loadSettings();
applyTheme(settings.theme);
const app = $('app');
const status = $('status');
const modeSelect = $<HTMLSelectElement>('mode');
const dialog = $<HTMLDialogElement>('settings');
const first = SAMPLES[0];

// Keep in step with --bar, --side, --outer and --inner in style.css.
mountArch($('editor-pane'), { bar: 36, side: 12, outer: 44, inner: 14 });

const editor = createEditor($('editor'), first.text, first.mode, () => show());
const viewEl = $('view');
const textView = new TextView(viewEl, settings);
const layoutView = new LayoutView(viewEl, settings, () => {});

const fmt = new Intl.NumberFormat();

function show(): void {
  const result = parseInput(editor.text(), modeSelect.value as InputMode);
  status.classList.toggle('error', !result.ok);
  if (!result.ok) {
    status.textContent = result.error;
    return;
  }
  status.textContent = 'Typesetting…';
  // Let the status paint before a long text is set.
  requestAnimationFrame(() => setTimeout(() => {
    const value = result.value as Json;
    const kind = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
    if (typeof value === 'string' && !isMarkdown(value)) {
      // A whole document of text: the reading view.
      layoutView.clear();
      viewEl.classList.remove('layout');
      const stats = textView.show(value, settings);
      status.textContent = `${result.as} → ${kind} · ${fmt.format(stats.words)} words · ${fmt.format(stats.lines)} lines` +
        ` · ${Math.round(stats.millis)} ms` + (stats.notOptimal ? ` · ${fmt.format(stats.notOptimal)} lines not optimal` : '');
    } else {
      textView.clear();
      viewEl.classList.add('layout');
      const millis = layoutView.show(value, settings);
      status.textContent = `${result.as} → ${kind} · ${fmt.format(countNodes(value))} nodes · planned in ${Math.round(millis)} ms`;
    }
    if (isPhone()) setCollapsed(true);
    document.body.dataset.ready = 'true';
  }, 0));
}

function countNodes(v: Json): number {
  if (v === null || typeof v !== 'object') return 1;
  return 1 + (Array.isArray(v) ? v : Object.values(v)).reduce((n: number, c) => n + countNodes(c), 0);
}

const isPhone = () => matchMedia('(max-width: 760px)').matches;

/** Desktop: fold the input pane to a narrow strip at the left. */
function setSideCollapsed(collapsed: boolean): void {
  app.classList.toggle('side-collapsed', collapsed);
  $('sheet-toggle').setAttribute('aria-expanded', String(!collapsed));
  $('sheet-toggle').setAttribute('aria-label', collapsed ? 'Expand editor' : 'Collapse editor');
}

function setCollapsed(collapsed: boolean): void {
  app.classList.toggle('collapsed', collapsed);
  $('sheet-toggle').setAttribute('aria-expanded', String(!collapsed));
  $('sheet-toggle').setAttribute('aria-label', collapsed ? 'Expand editor' : 'Collapse editor');
}

$('send').addEventListener('click', show);
$('sheet-toggle').addEventListener('click', () => {
  if (isPhone()) setCollapsed(!app.classList.contains('collapsed'));
  else setSideCollapsed(!app.classList.contains('side-collapsed'));
});
modeSelect.value = first.mode;
modeSelect.addEventListener('change', () => editor.setMode(modeSelect.value as InputMode));

// Settings modal.
const diag = $<HTMLInputElement>('opt-diagnostics');
const ragged = $<HTMLInputElement>('opt-ragged');
diag.checked = settings.diagnostics;
ragged.checked = settings.align === 'left';
$('settings-open').addEventListener('click', () => dialog.showModal());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
diag.addEventListener('change', () => { settings.diagnostics = diag.checked; saveSettings(settings); show(); });
ragged.addEventListener('change', () => { settings.align = ragged.checked ? 'left' : 'justify'; saveSettings(settings); show(); });
const themeSelect = $<HTMLSelectElement>('opt-theme');
for (const t of THEMES) themeSelect.add(new Option(t.label, t.id));
themeSelect.value = settings.theme;
themeSelect.addEventListener('change', () => {
  settings.theme = themeSelect.value as Theme;
  applyTheme(settings.theme);
  saveSettings(settings);
});
for (const sample of SAMPLES) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = sample.label;
  b.addEventListener('click', async () => {
    modeSelect.value = sample.mode;
    dialog.close();
    if (typeof sample.text !== 'string') status.textContent = 'Loading example…';
    editor.setText(typeof sample.text === 'string' ? sample.text : await sample.text());
    show();
  });
  $('examples').append(b);
}

$('version').textContent = `v${__VERSION__}`;

// Hook for end-to-end tests.
Object.assign(window, { pocketview: { setInput: (t: string) => editor.setText(t), show } });

Promise.all([document.fonts.load(FONT), document.fonts.load(KEY_FONT)]).then(show);
