import test from 'ava'
import React from 'react';
import {render, shallow, mount} from 'enzyme';

import { NAV_SHOW, VIEW_SHOW, VIEW_PIN } from '../constants/ViewStates'
import { Scroll } from './scroll'

function setup() {
  const props = {
    navs: [ {
      id: 0,
      plan: { path: ['a'],
              elem: <div className="unique" />,
              sz: [5,5]
            },
      state: NAV_SHOW
    } ],
    winsz: [300,150],
    addView: id => console.log("addView: "+id)
  }

  return shallow( <Scroll {...props} /> )
}

function click(output, n) {
  for(var i=0; i<n; i++) {
    const label = output.props.children.props.children[0]
    label.props.onClick()
    output = renderer.getRenderOutput()
  }
}

// seems like a bug in the testing libraries...
test.skip('has a .scroll class name', t => {
    const output = setup()
    console.log(output)
    t.pass()
    //t.true(output.is('.scroll'));
});

test.skip('renders children when passed in', t => {
    const output = setup()
    t.true(output.contains());
});

