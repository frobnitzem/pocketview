import test from 'ava';
import React from 'react';

import { typeset } from './typeset/typeset';

import { renderToStaticMarkup } from 'react-dom/server';

const text = "Not that the incredulous person doesn't believe in anything. It's just that he doesn't believe everything. Or he believes in one thing at a time. He believes a second thing only if it somehow follows from the first thing. He is nearsighted and methodical, avoiding wide horizons. If two things don't fit, but you believe both of them, thinking that somewhere, hidden, there must be a third thing that connects them, that's credulity.";

test('typeset returns a list of spans with text', t => {
    const ret = typeset(text, 'justify', [350], 3);
    const html = renderToStaticMarkup(
                    <div className="text"> { ret[0] } </div>
                 );
    const n = (html.match(/span/g) || []).length;
    t.is(n, 22);
})



