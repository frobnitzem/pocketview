/// <reference path="./hyphen.d.ts" />
import enUS from 'hyphen/en-us/index.js'; // CommonJS, without an exports map: name the file
import { fromHyphen, type Hyphenator } from './hyphenate.js';

/** American English hyphenation (TeX `hyph-en-us` patterns). */
export const englishUS: Hyphenator = fromHyphen(enUS);
