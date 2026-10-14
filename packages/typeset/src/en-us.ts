import enUS from 'hyphen/en-us';
import { fromHyphen, type Hyphenator } from './hyphenate';

/** American English hyphenation (TeX `hyph-en-us` patterns). */
export const englishUS: Hyphenator = fromHyphen(enUS);
