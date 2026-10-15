/** Opening of Pride and Prejudice (Jane Austen, 1813; public domain). */
export const AUSTEN = `It is a truth universally acknowledged, that a single man in possession
of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his
first entering a neighbourhood, this truth is so well fixed in the minds
of the surrounding families, that he is considered the rightful property
of some one or other of their daughters.

“My dear Mr. Bennet,” said his lady to him one day, “have you heard that
Netherfield Park is let at last?”

Mr. Bennet replied that he had not.

“But it is,” returned she; “for Mrs. Long has just been here, and she
told me all about it.”

Mr. Bennet made no answer.

“Do you not want to know who has taken it?” cried his wife impatiently.

“You want to tell me, and I have no objection to hearing it.”

This was invitation enough.
`;

/** Excerpt on Non-Euclidean Geometry from Poincaré's Science and Hypothesis (Poincaré, 1902; public domain). */
export const POINCARE = `
Riemann’s Geometry.—Let us imagine to ourselves
a world only peopled with beings of no thickness, and
suppose these “infinitely flat” animals are all in one and
the same plane, from which they cannot emerge. Let us
further admit that this world is sufficiently distant from
other worlds to be withdrawn from their influence, and
while we are making these hypotheses it will not cost
us much to endow these beings with reasoning power,
and to believe them capable of making a geometry. In
that case they will certainly attribute to space only two
dimensions.

But now suppose that these imaginary animals, while remaining without thickness, have the form
of a spherical, and not of a plane figure, and are all on
the same sphere, from which they cannot escape. What
kind of a geometry will they construct? In the first place,
it is clear that they will attribute to space only two dimensions.

The straight line to them will be the shortest
distance from one point on the sphere to another—that
is to say, an arc of a great circle.

In a word, their geometry will be spherical geometry. What they will call
space will be the sphere on which they are confined, and
on which take place all the phenomena with which they
are acquainted. Their space will therefore be unbounded,
`;

export const JSON_STRING = JSON.stringify(
  'A JSON document can be a single string. Newlines in it separate paragraphs.\n' +
  'Long tokens such as https://github.com/frobnitzem/pocketview/tree/main/packages/typeset ' +
  'break after slashes and dots, never with a hyphen.',
  null, 2,
);

export const OBJECT = `# A package manifest, as YAML
name: pocketview
version: 0.2.0
private: false
license: Apache-2.0
description: >
  A viewer for JSON and YAML trees, with publication-quality typesetting and
  an automatic layout that decides what to show, where, and how. Every node
  offers a few display variants; a bottom-up sweep keeps a Pareto front of
  sizes, and a top-down pass picks one option per visible node.
keywords: [json, yaml, viewer, typesetting, layout, lcars]
author:
  name: David M. Rogers
  url: https://github.com/frobnitzem
repository:
  type: git
  url: https://github.com/frobnitzem/pocketview
scripts:
  test: pnpm -r test
  typecheck: pnpm -r typecheck
  e2e: pnpm -r e2e
  licenses:check: node scripts/check-licenses.mjs
packages:
  - name: "@pocketview/typeset"
    role: Knuth-Plass line breaking with hyphenation
  - name: "@pocketview/core"
    role: measure, plan and the navigation contracts
  - name: "@pocketview/demo"
    role: this page
`;

export const ARRAY = JSON.stringify([
  { id: 1, title: 'Breaking Paragraphs into Lines', authors: ['Knuth', 'Plass'], year: 1981 },
  { id: 2, title: 'Word Hy-phen-a-tion by Com-put-er', authors: ['Liang'], year: 1983 },
  { id: 3, title: 'The TeXbook', authors: ['Knuth'], year: 1984 },
], null, 2);

export const NOTES = JSON.stringify({
  title: 'Release notes',
  version: '0.3.0',
  notes: '# What changed\n\n- Display **variants** are plugins now\n- Markdown is the first plugin\n- Short strings wrap plainly\n\n'
    + 'Read the [design notes](https://github.com/frobnitzem/pocketview/blob/main/DESIGN.md).\n\n```ts\n'
    + "planner.plan('', { w: 800, h: 600 });\n```",
  summary: 'Plain wrapping for short strings; Knuth–Plass typesetting for long ones.',
}, null, 2);

export interface Sample {
  label: string;
  mode: 'auto' | 'json' | 'yaml' | 'text';
  /** The input, or a loader for large inputs (fetched only when chosen). */
  text: string | (() => Promise<string>);
}

export const SAMPLES: readonly [Sample & { text: string }, ...Sample[]] = [
  { label: 'Science and Hypothesis (text)', mode: 'auto', text: POINCARE },
  { label: 'A JSON string', mode: 'auto', text: JSON_STRING },
  { label: 'An object (YAML)', mode: 'auto', text: OBJECT },
  { label: 'An array of records (JSON)', mode: 'auto', text: ARRAY },
  { label: 'Markdown inside JSON', mode: 'auto', text: NOTES },
  {
    // H. G. Wells, 1897 (public domain): 27 chapters, about 290 KB.
    label: 'The Invisible Man (YAML, a book)', mode: 'auto',
    text: () => import('../../../examples/invisible_man.yaml?raw').then((m) => m.default),
  },
];
