import test from 'ava';
import React from 'react';

import {shallow, mount} from 'enzyme';

import {renderToStaticMarkup} from 'react-dom/server';
import { Arch, planArch } from './arch';

const plan1 = {elem: <p key={1}> 1 </p>,
               path: ['X', 'Y'],
               sz:   [50,50],
               x:    [0, 10],
               y:    0,
               w:    [10,40],
               h:    50
              }
const plan2 = {elem: <p key={2}> 2 </p>,
               path: ['X', 'Z'],
               sz:   [60,50],
               x:    [50, 65],
               y:    0,
               w:    [15,45],
               h:    50
              }
const plan9 = {
            sub: {'a': plan1, 'b': plan2},
            sz: [110, 50],
            tsz: [110, 87],
            path: ['X'],
            cols: [[0,10], [50,65], [110,110]]
        }

test('Arch renders content', t => {
  const wrapper = shallow(
                  <Arch winsz={[100,100]} plan={plan9} toggle={() => {}}/>
              );
  t.true(wrapper.hasClass('content'));
});

test('planArch creates planElem and renders content', t => {
  const ret = planArch(['X'], {'Y':1, 'Z':2})
  isPlanElem(t, ret);
  t.deepEqual(ret.path, ['X']);
  t.deepEqual(ret.sub.Y.path, ['X', 'Y']);
  t.deepEqual(ret.sub.Z.path, ['X', 'Z']);

  const wrapper = shallow(ret.elem);
  t.true(wrapper.hasClass('content'));
});

