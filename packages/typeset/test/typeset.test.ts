import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { englishUS } from '../src/en-us';
import { breakLines, cached, format, prepare, type Measure } from '../src/index';

// A fake proportional font: deterministic widths, no browser needed.
const fakeMeasure: Measure = cached((s) => {
  let w = 0;
  for (const c of s) {
    if (c === ' ') w += 5;
    else if ('iljt.,;:!\'|-'.includes(c)) w += 4;
    else if ('mwMW'.includes(c)) w += 13;
    else if (c >= 'A' && c <= 'Z') w += 10;
    else w += 8;
  }
  return w;
});

const FROG = 'In olden times when wishing still helped one, there lived a king whose daughters ' +
  'were all beautiful; and the youngest was so beautiful that the sun itself, which has seen ' +
  'so much, was astonished whenever it shone in her face. Close by the king\'s castle lay a ' +
  'great dark forest, and under an old lime-tree in the forest was a well, and when the day ' +
  'was very warm, the king\'s child went out into the forest and sat down by the side of the ' +
  'cool fountain; and when she was bored she took a golden ball, and threw it up on high and ' +
  'caught it; and this ball was her favorite plaything.';

const opts = { measure: fakeMeasure, lineHeight: 20, hyphenate: englishUS };

/** Words of the source text, in order, recovered from a layout. */
function wordsOf(lines: { items: { text: string }[]; hyphenated: boolean }[]): string[] {
  let text = '';
  for (const line of lines) {
    const t = line.items.map((it) => it.text).join(' ');
    text += line.hyphenated ? t.slice(0, -1) : t + ' ';
  }
  return text.split(' ').filter(Boolean);
}

describe('format', () => {
  it('hyphenates words but not URLs, and keeps explicit hyphens', () => {
    const nodes = format('typesetting lime-tree https://example.com/a/b', {
      measure: fakeMeasure, align: 'justify', hyphenate: englishUS,
    });
    const boxes = nodes.filter((n) => n.type === 'box').map((n) => n.text);
    expect(boxes).toEqual(['type', 'set', 'ting', 'lime-', 'tree', 'https://', 'example.', 'com/', 'a/', 'b']);
    const hyphens = nodes.filter((n) => n.type === 'penalty' && n.text === '-');
    expect(hyphens).toHaveLength(2);
  });

  it('measures pieces as prefixes so they sum to the word', () => {
    const nodes = format('hyphenation', { measure: fakeMeasure, align: 'justify', hyphenate: englishUS });
    const total = nodes.reduce((s, n) => s + (n.type === 'box' ? n.width : 0), 0);
    expect(total).toBe(fakeMeasure('hyphenation'));
  });

  it('keeps no-break spaces inside a word and makes empty paragraphs', () => {
    const nodes = format('10 kg\n\nend', { measure: fakeMeasure, align: 'left' });
    const boxes = nodes.filter((n) => n.type === 'box').map((n) => n.text);
    expect(boxes).toEqual(['10 kg', '', 'end']);
  });
});

describe('breakLines', () => {
  it('finds the exact fit', () => {
    // Six 10px words, 5px spaces: two words fill a 25px line exactly.
    const nodes = format('aa aa aa aa aa aa', { measure: (s) => (s === ' ' ? 5 : s.length * 5), align: 'justify' });
    const breaks = breakLines(nodes, [25])!;
    expect(breaks).toHaveLength(3);
    expect(breaks.slice(0, 2).map((b) => b.ratio)).toEqual([0, 0]);
  });

  it('returns null when nothing fits within tolerance', () => {
    const nodes = format('aaaaaaaaaa', { measure: (s) => s.length * 5, align: 'justify' });
    expect(breakLines(nodes, [20])).toBeNull();
  });
});

describe('prepare', () => {
  it('sets the frog-king paragraph with every line within tolerance', () => {
    const par = prepare(FROG, opts).layout(300);
    expect(par.quality).toBe('optimal');
    for (const line of par.lines.slice(0, -1)) {
      expect(line.ratio).toBeGreaterThanOrEqual(-1);
      expect(line.ratio).toBeLessThanOrEqual(3); // the loosest pass's tolerance
      const last = line.items[line.items.length - 1]!;
      expect(last.x + last.width).toBeCloseTo(300, 6);
    }
    expect(par.lines.at(-1)!.justify).toBe(false);
    expect(wordsOf(par.lines)).toEqual(FROG.split(' '));
  });

  it('reports bounds and heights', () => {
    const p = prepare(FROG, opts);
    expect(p.maxWidth).toBe(fakeMeasure(FROG));
    expect(p.minWidth).toBeGreaterThan(0);
    const [h1, h2] = p.heights([200, 400]);
    expect(h1).toBeGreaterThan(h2!);
    expect(p.layout(p.maxWidth + 1).lines).toHaveLength(1);
  });

  it('accepts loose lines in narrow prose rather than splitting words', () => {
    // At 150px no breaks stay within tolerance; TeX would set loose lines too.
    const par = prepare(FROG, opts).layout(150);
    expect(par.quality).toBe('loose');
    expect(wordsOf(par.lines)).toEqual(FROG.split(' '));
  });

  it('breaks a long URL without overflowing', () => {
    const url = 'https://github.com/frobnitzem/pocketview/blob/main/packages/typeset/src/linebreak.ts';
    const par = prepare(`see ${url} for details`, opts).layout(120);
    expect(par.quality).not.toBe('overfull');
    for (const line of par.lines) {
      for (const it of line.items) expect(it.x + it.width).toBeLessThanOrEqual(120 + 1e-6);
    }
    expect(par.lines.map((l) => l.items.map((i) => i.text).join(' ')).join(' ').replace(/ /g, ''))
      .toBe(`see${url}fordetails`);
  });

  it('still lays out when the line is narrower than a glyph', () => {
    const par = prepare('wide words', opts).layout(3);
    expect(par.quality).toBe('overfull');
    expect(par.lines.map((l) => l.text).join('')).toBe('widewords');
  });

  it('supports per-line widths', () => {
    const par = prepare(FROG, opts).layout([150, 150, 300]);
    expect(par.lines[0]!.width).toBe(150);
    expect(par.lines[2]!.width).toBe(300);
    expect(par.lines.at(-1)!.width).toBe(300);
  });
});

describe('paragraphs', () => {
  it('breaks each paragraph on its own and reports quality per line', () => {
    const p = prepare(`${FROG}\nAn\u00A0unbreakable\u00A0run\u00A0of\u00A0words\u00A0glued\u00A0together.`, opts);
    const par = p.layout(200);
    const first = par.lines.filter((l) => l.quality === 'optimal' || l.quality === 'loose');
    expect(first.length).toBeGreaterThan(5);
    expect(par.lines.at(-1)!.quality).toBe('emergency');
    expect(par.quality).toBe('emergency');
  });

  it('indents paragraphs after the first', () => {
    const par = prepare('One two three.\nFour five six.', { ...opts, indent: 24 }).layout(400);
    expect(par.lines.map((l) => l.indent)).toEqual([0, 24]);
    expect(par.lines[1]!.text).toBe('Four five six.');
    expect(par.lines[1]!.items[0]!.x).toBe(24);
  });
});

describe('properties', () => {
  const word = fc.constantFrom(
    'the', 'a', 'typesetting', 'of', 'hyphenation', 'JSON', 'paragraph', 'is',
    'beautiful', 'lime-tree', 'x', 'extraordinarily', 'data,', 'tree.', '42', 'https://a.example/b/c',
  );
  const text = fc.array(fc.array(word, { minLength: 1, maxLength: 40 }).map((ws) => ws.join(' ')),
    { minLength: 1, maxLength: 3 }).map((ps) => ps.join('\n'));
  const align = fc.constantFrom('justify' as const, 'left' as const);

  it('keeps every word, in order, at any width', () => {
    fc.assert(fc.property(text, fc.integer({ min: 40, max: 700 }), align, (t, w, a) => {
      const par = prepare(t, { ...opts, align: a }).layout(w);
      const expected = t.split(/\s+/).join('');
      return par.lines.map((l) => l.items.map((i) => i.text).join('')).join('')
        .replace(/-/g, '') === expected.replace(/-/g, '');
    }));
  });

  it('never overflows unless forced to', () => {
    fc.assert(fc.property(text, fc.integer({ min: 40, max: 700 }), align, (t, w, a) => {
      const par = prepare(t, { ...opts, align: a }).layout(w);
      if (par.quality === 'overfull') return true;
      return par.lines.every((l) => l.items.every((i) => i.x + i.width <= w + 1e-6));
    }));
  });

  it('fills justified lines exactly', () => {
    fc.assert(fc.property(text, fc.integer({ min: 120, max: 700 }), (t, w) => {
      const par = prepare(t, opts).layout(w);
      if (par.quality !== 'optimal') return true;
      return par.lines.filter((l) => l.justify && l.items.length > 1).every((l) => {
        const last = l.items.at(-1)!;
        return Math.abs(last.x + last.width - w) < 1e-6;
      });
    }));
  });
});
