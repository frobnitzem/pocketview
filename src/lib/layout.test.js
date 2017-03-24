import test from 'ava'

import { addGrid, planCols } from './layout'

test('addGrid adds a fitting item', t => {
    let elems = {
        '0': { sz: [100, 100], tsz: [100,132] }
    }
    const rej = addGrid(elems, [100,132])

    t.is(Object.keys(rej).length,   0)
    t.is(Object.keys(elems).length, 1)
    t.is(elems[0].x, 0)
    t.is(elems[0].y, 0)
})

test('addGrid rejects non-fitting items', t => {
    let elems = {
        '0': {sz:[100, 100], tsz:[100,132]},
        '1': {sz:[101, 100], tsz:[100,132]}
    }
    const rej = addGrid(elems, [100,132])

    t.is(Object.keys(elems).length, 1)
    t.is(Object.keys(rej).length, 1)

    t.is(elems[0].x, 0)
    t.is(elems[0].y, 0)
    t.is(elems[0].sz[0], 100)
    t.is(elems[0].sz[1], 100)

    t.is(rej[1].sz[0], 101)
    t.is(rej[1].sz[1], 100)
})

test('planCols columnizes', t => {
    let subs = {
        'hello' : { sz: [100,100] },
        'world' : { sz: [101,100] }
    }
    const sz = planCols(subs)
    t.is(sz.length, 2)
    t.true(sz[0] >= 101)
    t.true(sz[1] >= 100)
    t.is(Object.keys(subs).length, 2)
    t.is(subs.hello.w.length, 2)
    t.is(subs.hello.h, 100)
    t.is(subs.world.w.length, 2)
    t.is(subs.world.h, 100)
})

