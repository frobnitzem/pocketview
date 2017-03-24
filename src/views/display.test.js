import test from 'ava'

import { planDisplay } from './display.js'

var simple_doc = {
  str: 'A test string',
  tok: false,
  arr: [1,2,3,4],
  sub: { a: 1, b: 2 }
}

test('planDisplay plans a simple document', t => {
  const plan = planDisplay(["Ein"], simple_doc, [300,300])
  global.isPlanElem(t, plan)
  global.isPlanElem(t, plan.sub.arr)
  global.isPlanElem(t, plan.sub.sub)
})

