import { describe, expect, it } from 'vitest';
import { buildTree, Planner } from '@pocketview/core';
import { isMarkdown, markdownVariant, renderMarkdown } from '../src/index';

describe('isMarkdown', () => {
  it('detects fenced code, three list or heading lines, and links or images', () => {
    expect(isMarkdown('text\n```js\nx = 1\n```')).toBe(true);
    expect(isMarkdown('# Title\n- one\n- two')).toBe(true);
    expect(isMarkdown('see [the docs](https://example.com)')).toBe(true);
    expect(isMarkdown('![logo](logo.png)')).toBe(true);
  });

  it('leaves ordinary text alone', () => {
    expect(isMarkdown('Just a sentence - with a dash.')).toBe(false);
    expect(isMarkdown('# one heading\n- one item')).toBe(false);
    expect(isMarkdown('[not a link] (url)')).toBe(false);
    expect(isMarkdown('```only one fence')).toBe(false);
  });
});

describe('renderMarkdown', () => {
  it('renders Markdown', () => {
    const el = renderMarkdown('# Hi\n\n- a\n- b\n\n[x](https://example.com)');
    expect(el.querySelector('h1')!.textContent).toBe('Hi');
    expect(el.querySelectorAll('li')).toHaveLength(2);
    const a = el.querySelector('a')!;
    expect(a.getAttribute('href')).toBe('https://example.com');
    expect(a.rel).toBe('noopener noreferrer');
  });

  it('neutralizes script injection', () => {
    const el = renderMarkdown([
      '<script>alert(1)</script>',
      '<img src=x onerror="alert(1)">',
      '[click](javascript:alert(1))',
      '![img](javascript:alert(1))',
    ].join('\n\n'));
    // Raw HTML is shown as text, never as elements; no event handlers and no
    // javascript: URLs survive anywhere.
    expect(el.querySelector('script, img[onerror]')).toBeNull();
    expect(el.textContent).toContain('<script>alert(1)</script>');
    for (const n of el.querySelectorAll('*')) {
      for (const attr of n.attributes) {
        expect(attr.name.startsWith('on'), attr.name).toBe(false);
        expect(attr.value).not.toMatch(/^\s*javascript:/i);
      }
    }
  });
});

describe('markdownVariant', () => {
  it('displays Markdown strings as custom marks', () => {
    const metrics = { key: (s: string) => 7 * s.length, value: (s: string) => 8 * s.length, text: () => ({ height: () => 28 }) };
    const variant = markdownVariant({ height: () => 120 });
    const plan = new Planner(buildTree({ doc: '# A\n- b\n- c', name: 'x' }), metrics, undefined, [variant]).plan('', { w: 900, h: 600 });
    expect(plan.marks.find((m) => m.kind === 'custom')).toMatchObject({ ptr: '/doc', variant: 'markdown', rect: { h: 120 } });
  });
});
