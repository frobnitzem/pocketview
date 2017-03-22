import test from 'ava';
import React from 'react';

import {shallow, mount} from 'enzyme';

import {renderToStaticMarkup} from 'react-dom/server';
import { ArrTbl, planArray } from './array';

const plan1 = {elem: <p key={1}> 1 </p>,
               path: ['X', 'Y'],
               sz:   [50,50]
              }
const plan2 = {elem: <p key={2}> 2 </p>,
               path: ['X', 'Z'],
               sz:   [60,50]
              }
const plan9 = {
            sub: [plan1, plan2],
            sz: [100, 100],
            tsz: [100, 137],
            path: [],
        }

test('ArrTbl renders a capsule', t => {
  // render <ArrTbl /> with renderToStaticMarkup and get the output
  const ret = renderToStaticMarkup(
                  <ArrTbl winsz={[100,100]} plan={plan9} />
              );
  // assert the the output string includes the text for the classname
  t.true(ret.match(/capsule/) != null);
});

test('planArray creates planElem and renders content', t => {
  const ret = planArray(['1', '2'], ["feed","face"]);
  isPlanElem(t, ret);
  t.deepEqual(ret.path, ['1', '2']);

  const wrapper = shallow(ret.elem);
  t.true(wrapper.hasClass('content'));
});

