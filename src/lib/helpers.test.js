import test from 'ava'

import { toggleSorted } from './helpers'

test('toggleSorted adds and deletes to empty list', t => {
    let lst = []
    toggleSorted(lst, 101)
    t.deepEqual(lst, [101])
    toggleSorted(lst, 101)
    t.deepEqual(lst, [])
})

test('toggleSorted adds and deletes to single item list', t => {
    let lst = [101]
    toggleSorted(lst, 100)
    t.deepEqual(lst, [100, 101])
    toggleSorted(lst, 101)
    t.deepEqual(lst, [100])
})

test('toggleSorted adds and deletes to 3 item list', t => {
    let lst = [0, 1]
    toggleSorted(lst, 2)
    t.deepEqual(lst, [0, 1, 2])
    toggleSorted(lst, 1)
    t.deepEqual(lst, [0, 2])
    toggleSorted(lst, 1)
    toggleSorted(lst, 0)
    t.deepEqual(lst, [1, 2])
    toggleSorted(lst, 0)
    toggleSorted(lst, 2)
    t.deepEqual(lst, [0, 1])
})


