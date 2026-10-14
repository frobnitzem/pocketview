# Third-party notices

pocketview is licensed under the Apache License 2.0 (see `LICENSE`). It
includes or distributes the following third-party components.

## Shipped in the library

### hyphen (ISC)

Text hyphenation in JavaScript. https://github.com/ytiurin/hyphen

> Copyright (c) 2026, Yevhen Tiurin
>
> Permission to use, copy, modify, and/or distribute this software for any
> purpose with or without fee is hereby granted, provided that the above
> copyright notice and this permission notice appear in all copies.
>
> THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
> WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
> MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
> ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
> WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
> ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
> OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

### American English hyphenation patterns (hyph-en-us)

Shipped inside `hyphen` (`hyphen/en-us`), converted from `hyph-en-us.tex` of
the hyph-utf8 package (https://www.hyphenation.org/tex). The `hyphen` package
omits the original notice, so it is reproduced here as that notice requires:

> Copyright (C) 1990, 2004, 2005 Gerard D.C. Kuiken
>
> Copying and distribution of this file, with or without modification,
> are permitted in any medium without royalty provided the copyright
> notice and this notice are preserved.

The file also contains the original patterns from Donald E. Knuth's
`hyphen.tex` (Plain TeX), as noted in its header.

Patterns for other languages carry their own licences (some are LPPL or
copyleft). Each must be reviewed and listed here before it is used;
`pnpm licenses:check` enforces this.

## Distributed with the demo site

### Source Serif 4 (SIL Open Font License 1.1)

Via `@fontsource/source-serif-4`. Copyright Adobe (http://www.adobe.com/),
with Reserved Font Name "Source". The font files are distributed under the
OFL 1.1, whose full text is included in the package
(`node_modules/@fontsource/source-serif-4/LICENSE`). The gh-pages build must
copy that text next to the font files (to do when the build is set up).

## Acknowledgements (no code included)

- The line breaker in `packages/typeset/src/linebreak.ts` is written from
  D. E. Knuth and M. F. Plass, "Breaking Paragraphs into Lines", *Software:
  Practice and Experience* 11 (1981), with Bram Stein's `typeset`
  (BSD-licensed) as a reference.

## Development tools

Build and test tools (Vite, Vitest, TypeScript, Playwright, fast-check and
their dependencies) are not distributed. They are under MIT, ISC,
BSD, Apache-2.0 and, for `lightningcss` (used by Vite), MPL-2.0.
