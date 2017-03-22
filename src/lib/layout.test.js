import test from 'ava'

import { addGrid, planCols } from './layout'

test('addGrid adds a fitting item', t => {
    let elems = [
        { plan: {sz: [100,100]} }
    ]
    const rej = addGrid(elems, [100,100])

    t.is(rej.length, 0)
    t.is(elems.length, 1)
    t.is(elems[0].x, 0)
    t.is(elems[0].y, 0)
    t.is(elems[0].w, 100)
    t.is(elems[0].h, 100)
})

test('addGrid rejects non-fitting items', t => {
    let elems = [
        { id: 0, plan: {sz: [100,100]} },
        { id: 1, plan: {sz: [101,100]} }
    ]
    const rej = addGrid(elems, [100,100])

    t.is(rej.length, 1)
    t.is(elems.length, 1)
    t.is(elems[0].id, 0)
    t.is(elems[0].x, 0)
    t.is(elems[0].y, 0)
    t.is(elems[0].w, 100)
    t.is(elems[0].h, 100)

    t.is(rej[0].id, 1)
    t.is(rej[0].w, 101)
    t.is(rej[0].h, 100)
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

