import test from 'ava'

import mk_reducer from './'
import views, { forward } from './views'
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
  elem: null,
}

test('handles TOG_VIEW', t => {
  const reduce = mk_reducer(simple_plan, [3000,3000], [3000,2000])
  const state = reduce(undefined, {})
  const s = views(state, {type: types.TOG_VIEW, id: '1'})

  t.deepEqual(Object.keys(s.navs), [])
  t.is(s.grid['0'].state, VIEW_SHOW)
  t.is(s.grid['1'].state, VIEW_PIN)
  t.is(s.nextID, 2)
})

test('handles delete', t => {
  const reduce = mk_reducer(simple_plan, [1000,1000], [1000,800])
  const state = reduce(undefined, {})
  const s1 = views(state, {type: types.TOG_VIEW, id: '0'})
  const s = views(s1, {type: types.TOG_VIEW, id: '0'})

  t.deepEqual(Object.keys(s.navs), ['0'])
  t.deepEqual(Object.keys(s.grid), ['1'])

  t.is(s.nextID, 2)
})

test('handles CLEAR_VIEW', t => {
  const reduce = mk_reducer(simple_plan, [1000,1000], [1000,800])
  const state = reduce(undefined, {})
  const s = views(state, {type: types.CLEAR_VIEW})
  const shown = Object.keys(s.navs)

  t.is(shown.length, 2)
  t.true(shown.indexOf('0') != -1)
  t.true(shown.indexOf('1') != -1)
  t.is(Object.keys(s.grid).length, 0)
})


test('handles ADD_VIEW', t => {
  const reduce = mk_reducer(simple_plan, [1000,1000], [1000,800])
  const state = reduce(undefined, {})
  const s1 = views(state, {type: types.CLEAR_VIEW})
  let s = views(s1, {type: types.ADD_VIEW, id: '1'})

  t.is(Object.keys(s.navs).length, 1)
  t.is(Object.keys(s.grid).length, 1)
  t.true(s.navs.hasOwnProperty('0'))
  t.true(s.grid.hasOwnProperty('1'))

  s = views(s1, {type: types.ADD_VIEW, id: '0'})

  t.is(Object.keys(s.navs).length, 1)
  t.is(Object.keys(s.grid).length, 1)
  t.true(s.navs.hasOwnProperty('1'))
  t.true(s.grid.hasOwnProperty('0'))
})

test('handles forward', t => {
  const reduce = mk_reducer(simple_plan, [1000,1000], [1000,800])
  const state = reduce(undefined, {})
  let s = views(state, {type: types.CLEAR_VIEW})
  Object.assign(s, forward(s, s.navs['0']))

  t.deepEqual(s.path, ['Ein','a'])
  t.is(Object.keys(s.navs).length, 0)
  t.is(Object.keys(s.grid).length, 1)
  t.true(s.grid.hasOwnProperty('2'))
  t.is(s.grid['2'].state, VIEW_SHOW)
  t.is(s.nextID, 3)
})

test('handles BACK_TREE', t => {
  const reduce = mk_reducer(simple_plan, [1000,1000], [1000,800])
  const state = reduce(undefined, {})
  let s1 = views(state, {type: types.CLEAR_VIEW})
  Object.assign(s1, forward(s1, s1.navs['0']))
  const s  = views(s1, {type: types.BACK_TREE})

  t.deepEqual(s.path, ['Ein'])
  t.is(Object.keys(s.navs).length, 0)
  t.is(Object.keys(s.grid).length, 2)
  let shown = []
  for(var key in s.grid) {
      t.is(s.grid[key].path.length, 2)
      t.is(s.grid[key].path[0], 'Ein')
      t.is(s.grid[key].state, VIEW_SHOW)
      shown.push(s.grid[key].path[1])
  }
  t.true(shown.indexOf('a') != -1)
  t.true(shown.indexOf('b') != -1)
})

