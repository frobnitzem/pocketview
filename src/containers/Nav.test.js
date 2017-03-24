import test from 'ava'
import React from 'react';
import {shallow, mount} from 'enzyme';

import { NAV_SHOW, VIEW_SHOW, VIEW_PIN } from '../constants/ViewStates'
import Nav from './Nav'

const cpt = <div className="unique" plan={{id: 1, path:['Stale', 'a']}} />

const plan9 = { '9': {
                  path:['Stale'],
                  elem:cpt,
                  w: 100,
                  h: 100,
                  state: NAV_SHOW
                },
              }

const win = [640,480]

//sinon.spy(Foo.prototype, 'componentDidMount');
const setup = propOverrides => {
  const props = Object.assign({
    navs: {},
    winsz: win,
    title: "Awesome Nav",
    actions: {
        addView: id => console.log("addView: "+ id),
        forwardTree: () => console.log("ForwardTree"),
        backTree:    () => console.log("BackTree")
    }
  }, propOverrides)

  return {
    props: props,
    output: shallow(<Nav {...props} />)
  }
}


test('Nav renders', t => {
    const { output } = setup()
    t.true(output.hasClass('nav'));
})

/*
test.skip('Nav renders link when passed in', t => {
    const { output } = setup( {navs: [cpt]} )
    t.true(output.contains(cpt));
})
*/
