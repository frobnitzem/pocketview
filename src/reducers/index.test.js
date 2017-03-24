import test from 'ava'

import mk_reducer from './'
import { forward } from './views'
import * as types from '../constants/ActionTypes'
import { NAV_SHOW, VIEW_SHOW, VIEW_PIN } from '../constants/ViewStates'

var simple_plan = {
  path: ['Ein'],
  sz: [1000,800],
  tsz: [1000,832],
  sub: { a: {
            path: ['Ein', 'a'],
            sz:   [400, 800],
            tsz:  [400, 800],
            elem: null,
            sub:  [{path:['Ein','a','c'], sz:[100,100],
                    tsz:[100,100], elem:null}]
         },
         b: {
            path: ['Ein', 'b'],
            sz:   [410, 800],
            tsz:  [410, 800],
            elem: null
         },
       },
  elem: null
}

test('reduce function returns initial plan', t => {
  const reduce = mk_reducer(simple_plan, [300,300], [300,200])
  const state = reduce(undefined, {})
  t.deepEqual(Object.keys(state.navs), ['0', '1'])
  t.deepEqual(Object.keys(state.grid), [])
  t.is(state.winsz.length, 2)
  t.is(state.lookup_path(['Ein', 'b']), simple_plan.sub.b)
})

test('forward correctly reconfigures nav, grid', t => {
  const reduce = mk_reducer(simple_plan, [1000,1000], [1000,800])
  const state = reduce(undefined, {})
  const st2 = forward(state, simple_plan.sub.a)
  t.deepEqual(Object.keys(st2.navs), [])
  t.deepEqual(Object.keys(st2.grid), ['2'])
  t.is(st2.grid['2'].state, VIEW_SHOW)
})

