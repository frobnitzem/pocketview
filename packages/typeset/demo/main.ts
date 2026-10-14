import '@fontsource/source-serif-4/400.css';
import { canvasMeasure, prepare, renderLines } from '../src/index';
import { englishUS } from '../src/en-us';

export const SAMPLES: Record<string, string> = {
  frog: 'In olden times when wishing still helped one, there lived a king whose daughters ' +
    'were all beautiful; and the youngest was so beautiful that the sun itself, which has seen ' +
    'so much, was astonished whenever it shone in her face. Close by the king’s castle lay a ' +
    'great dark forest, and under an old lime-tree in the forest was a well, and when the day ' +
    'was very warm, the king’s child went out into the forest and sat down by the side of the ' +
    'cool fountain; and when she was bored she took a golden ball, and threw it up on high and ' +
    'caught it; and this ball was her favorite plaything.',
  json: 'Fetched from https://api.github.com/repos/frobnitzem/pocketview/contents/packages/typeset ' +
    'on retry 3 of 5.\nThe response was cached for 3600 s.',
};

const FONT = '17px "Source Serif 4"';
const LINE = 25;

async function main() {
  await document.fonts.load(FONT);
  const measure = canvasMeasure(FONT);
  const out = document.getElementById('out')!;
  for (const [name, text] of Object.entries(SAMPLES)) {
    const p = prepare(text, { measure, lineHeight: LINE, hyphenate: englishUS });
    for (const width of name === 'frog' ? [240, 340] : [240]) {
      const row = document.createElement('div');
      row.className = 'row';

      const browser = document.createElement('figure');
      browser.innerHTML = `<figcaption>browser: text-align justify, hyphens auto — ${width}px</figcaption>`;
      const b = document.createElement('div');
      b.className = 'browser frame';
      b.lang = 'en';
      b.style.width = `${width}px`;
      b.textContent = text;
      browser.appendChild(b);

      const ours = document.createElement('figure');
      const par = p.layout(width);
      ours.innerHTML = `<figcaption>pocketview: Knuth–Plass, ${par.lines.length} lines, ${par.quality} — ${width}px</figcaption>`;
      const el = renderLines(par, { lineHeight: LINE });
      el.classList.add('frame');
      el.dataset.sample = name;
      el.dataset.width = String(width);
      ours.appendChild(el);

      row.append(browser, ours);
      out.appendChild(row);
    }
  }
  document.body.dataset.ready = 'true';
}

main();
