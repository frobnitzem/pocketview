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

export const JSON_STRING = JSON.stringify(
  'A JSON document can be a single string. Newlines in it separate paragraphs.\n' +
  'Long tokens such as https://github.com/frobnitzem/pocketview/tree/main/packages/typeset ' +
  'break after slashes and dots, never with a hyphen.',
  null, 2,
);

export const OBJECT = `name: pocketview
version: 0.1.0
keywords: [json, yaml, viewer, typesetting]
author:
  name: David M. Rogers
`;

export const SAMPLES = [
  { label: 'Pride and Prejudice (text)', mode: 'auto', text: AUSTEN },
  { label: 'A JSON string', mode: 'auto', text: JSON_STRING },
  { label: 'An object (needs the layout engine)', mode: 'auto', text: OBJECT },
] as const;
