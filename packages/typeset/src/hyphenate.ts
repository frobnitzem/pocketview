/** Splits a word into the pieces between its permitted hyphenation points. */
export type Hyphenator = (word: string) => string[];

const SOFT_HYPHEN = '­';

interface HyphenModule {
  hyphenateSync(text: string, options?: { minWordLength?: number }): string;
}

/** Wraps a Liang-pattern hyphenator from the `hyphen` package. */
export function fromHyphen(mod: HyphenModule, minWordLength = 5): Hyphenator {
  return (word) => mod.hyphenateSync(word, { minWordLength }).split(SOFT_HYPHEN);
}
