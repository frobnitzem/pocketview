import test from 'ava';
import React from 'react';

import {shallow} from 'enzyme';

import {renderToStaticMarkup} from 'react-dom/server';
import { ArrTbl, planArrTbl } from './array';

test('ArrTbl renders a capsule', t => {
  // render <ArrTbl /> with renderToStaticMarkup and get the output
  const fn1 = <p key={1}> 1 </p>;
  const fn2 = <p key={2}> 2 </p>;
  const ret = renderToStaticMarkup(
                  <ArrTbl winsz={[100,100]} doc={[fn1, fn2]} />
              );
  // assert the the output string includes the text for the classname
  t.true(ret.match(/capsule/) != null);
});

test('planArrTbl estimates size and renders content', t => {
  const ret = planArrTbl(null, ["feed","face"]);
  const wrapper = shallow(ret[0]);
  t.true(wrapper.hasClass('content'));
  t.is(ret[1].length, 2);
});

