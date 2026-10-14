import '@fontsource/antonio/600.css';
import '@fontsource/source-serif-4/400.css';
import './style.css';
import { mountArch } from './arch';
import { createEditor } from './editor';
import { parseInput, type InputMode } from './parse';
import { SAMPLES } from './samples';
import { loadSettings, saveSettings, type Settings } from './settings';
import { FONT, TextView } from './view';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const settings: Settings = loadSettings();
const app = $('app');
const status = $('status');
const modeSelect = $<HTMLSelectElement>('mode');
const dialog = $<HTMLDialogElement>('settings');
const first = SAMPLES[0];

// Keep in step with --bar, --side, --outer and --inner in style.css.
mountArch($('editor-pane'), { bar: 36, side: 12, outer: 44, inner: 14 });

const editor = createEditor($('editor'), first.text, first.mode, () => show());
const view = new TextView($('view'), settings);

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
    const stats = view.show(result.value, settings);
    const kind = Array.isArray(result.value) ? 'array' : result.value === null ? 'null' : typeof result.value;
    status.textContent = stats
      ? `${result.as} → ${kind} · ${fmt.format(stats.words)} words · ${fmt.format(stats.lines)} lines` +
        ` · ${Math.round(stats.millis)} ms` + (stats.notOptimal ? ` · ${fmt.format(stats.notOptimal)} lines not optimal` : '')
      : `${result.as} → ${kind}`;
    if (matchMedia('(max-width: 760px)').matches) setCollapsed(true);
    document.body.dataset.ready = 'true';
  }, 0));
}

function setCollapsed(collapsed: boolean): void {
  app.classList.toggle('collapsed', collapsed);
  $('sheet-toggle').setAttribute('aria-expanded', String(!collapsed));
  $('sheet-toggle').setAttribute('aria-label', collapsed ? 'Expand editor' : 'Collapse editor');
}

$('send').addEventListener('click', show);
$('sheet-toggle').addEventListener('click', () => setCollapsed(!app.classList.contains('collapsed')));
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
for (const sample of SAMPLES) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = sample.label;
  b.addEventListener('click', () => {
    modeSelect.value = sample.mode;
    editor.setText(sample.text);
    dialog.close();
    show();
  });
  $('examples').append(b);
}

$('version').textContent = `v${__VERSION__}`;

// Hook for end-to-end tests.
Object.assign(window, { pocketview: { setInput: (t: string) => editor.setText(t), show } });

document.fonts.load(FONT).then(show);
