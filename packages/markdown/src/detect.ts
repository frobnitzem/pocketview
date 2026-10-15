/**
 * Whether a string looks like Markdown. Any one of these is enough:
 * - at least two lines beginning with ``` (a fenced code block);
 * - at least three lines beginning with #, - or * (headings, list items);
 * - a Markdown link [text](url) or image ![alt](src).
 */
export function isMarkdown(text: string): boolean {
  let fences = 0;
  let marks = 0;
  for (const line of text.split(/\r?\n/)) {
    const l = line.replace(/^ {0,3}/, '');
    if (l.startsWith('```')) fences++;
    else if (/^(#|-|\*)/.test(l)) marks++;
    if (fences >= 2 || marks >= 3) return true;
  }
  return /!?\[[^\]\n]*\]\([^)\s]+(\s+"[^"]*")?\)/.test(text);
}
