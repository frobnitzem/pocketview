import test from 'ava'
import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { NAV_SHOW, VIEW_SHOW, VIEW_PIN } from '../constants/ViewStates'
import { Scroll } from './Scroll'


const mockStore = configureStore()
const initialState = { grid: {} }

import {render, shallow, mount} from 'enzyme'

test.skip('renders without crashing', t => {
  const div = document.createElement('div')
  const store = mockStore(initialState)
  ReactDOM.render(
    <Provider store={store}>
      <Scroll />
    </Provider>,
    div
  )
})


function setup() {
  const props = {
    navs: {
      '0': { path: ['a'],
              elem: <div className="unique" />,
              w: 5, h: 5,
              state: NAV_SHOW
            },
    },
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
// (it's the difficulty of loading the redux store)
test.skip('has a .scroll class name', t => {
    const output = setup()
    console.log(output)
    t.pass()
    //t.true(output.is('.scroll'));
});

test.skip('renders children when passed in', t => {
    const output = setup()
    t.true(output.contains())
});

