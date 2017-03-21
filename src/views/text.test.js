import test from 'ava';
import React, {createElement} from 'react';

import {shallow, mount} from 'enzyme';

import {renderToStaticMarkup} from 'react-dom/server';
import { Text, planText } from './text';

const para = "A long and winding paragraph can begin with only a few words.  Before you know it, there's another sentence... and then another.  Until finally there's more text than anyone had ever planned for or even concieved of.";

const plan10 = {
  path: ["System", "Line"],
  sz: [299,151],
}

test('Text renders title and contents', t => {
  const sub = [ <span className="line">A single line.</span> ]
  const ret = shallow( createElement(Text, { winsz:[300,150], plan:plan10,
                                             toggle: () => {} },
                                     sub) );
  //t.true(ret.hasClass(Text));
  t.true(ret.find('.capsule').exists());
});

test('Text plans and renders content', t => {
  const path = ["System", "Text"];
  const ret = planText(path, para);
  isPlanElem(t, ret);
  t.deepEqual(ret.path, path);

  const wrapper = shallow(ret.elem);
  t.true(wrapper.hasClass('content'));
});

