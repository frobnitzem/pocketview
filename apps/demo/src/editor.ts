import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import { basicSetup } from 'codemirror';
import type { InputMode } from './parse';

const theme = EditorView.theme({
  '&': { height: '100%', color: 'var(--ink)', backgroundColor: 'transparent', fontSize: '14px' },
  '.cm-scroller': { fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace', lineHeight: '1.5' },
  '.cm-content': { caretColor: 'var(--accent)' },
  '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--muted)', border: 'none' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'rgba(255,255,255,0.04)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'rgba(168,163,230,0.3) !important' },
  '&.cm-focused': { outline: 'none' },
}, { dark: true });

const highlight = HighlightStyle.define([
  { tag: [t.propertyName, t.definition(t.propertyName)], color: 'var(--key)' },
  { tag: [t.string, t.content], color: 'var(--str)' },
  { tag: t.number, color: 'var(--num)' },
  { tag: [t.bool, t.null, t.keyword], color: 'var(--lit)', fontStyle: 'italic' },
  { tag: [t.comment], color: 'var(--muted)', fontStyle: 'italic' },
  { tag: [t.punctuation, t.separator, t.brace, t.squareBracket], color: 'var(--muted)' },
]);

function language(mode: InputMode, doc: string): Extension {
  const m = mode === 'auto' ? (/^\s*[[{"]/.test(doc) ? 'json' : /^\s*[\w-]+\s*:(\s|$)/m.test(doc) ? 'yaml' : 'text') : mode;
  return m === 'json' ? json() : m === 'yaml' ? yaml() : [];
}

export interface Editor {
  view: EditorView;
  text(): string;
  setText(text: string): void;
  setMode(mode: InputMode): void;
}

export function createEditor(parent: HTMLElement, initial: string, mode: InputMode, onSubmit: () => void): Editor {
  const lang = new Compartment();
  let currentMode = mode;
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: initial,
      extensions: [
        keymap.of([{ key: 'Mod-Enter', run: () => { onSubmit(); return true; } }]),
        basicSetup,
        EditorView.lineWrapping,
        theme,
        syntaxHighlighting(highlight),
        lang.of(language(mode, initial)),
      ],
    }),
  });
  const relang = () => view.dispatch({ effects: lang.reconfigure(language(currentMode, view.state.doc.toString())) });
  return {
    view,
    text: () => view.state.doc.toString(),
    setText(text) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });
      relang();
    },
    setMode(m) { currentMode = m; relang(); },
  };
}
