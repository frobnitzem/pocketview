import { parse as parseYaml } from 'yaml';

export type InputMode = 'auto' | 'json' | 'yaml' | 'text';
export type ParsedAs = 'json' | 'yaml' | 'text';

export type ParseResult =
  | { ok: true; value: unknown; as: ParsedAs }
  | { ok: false; error: string };

/**
 * Plain text follows Markdown's paragraph rule: blank lines separate
 * paragraphs, and single newlines inside a paragraph are just spaces
 * (so hard-wrapped e-texts, e.g. from Project Gutenberg, reflow).
 */
export function textToString(src: string): string {
  return src
    .replace(/\r\n?/g, '\n')
    .split(/\n[ \t]*\n+/)
    .map((p) => p.split('\n').map((l) => l.trim()).filter(Boolean).join(' '))
    .filter(Boolean)
    .join('\n');
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export function parseInput(src: string, mode: InputMode): ParseResult {
  if (mode === 'text') return { ok: true, value: textToString(src), as: 'text' };
  if (mode === 'json') {
    try { return { ok: true, value: JSON.parse(src), as: 'json' }; }
    catch (e) { return { ok: false, error: `JSON: ${message(e)}` }; }
  }
  if (mode === 'yaml') {
    try { return { ok: true, value: parseYaml(src), as: 'yaml' }; }
    catch (e) { return { ok: false, error: `YAML: ${message(e)}` }; }
  }
  // auto: JSON, then YAML if it yields structure, else plain text.
  const trimmed = src.trim();
  try { return { ok: true, value: JSON.parse(trimmed), as: 'json' }; } catch (jsonError) {
    try {
      const value: unknown = parseYaml(src);
      if (value !== null && typeof value === 'object') return { ok: true, value, as: 'yaml' };
    } catch { /* not YAML either */ }
    if (/^[[{]/.test(trimmed)) return { ok: false, error: `JSON: ${message(jsonError)}` };
    return { ok: true, value: textToString(src), as: 'text' };
  }
}
