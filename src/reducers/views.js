import React from 'react'

import * as types from '../constants/ActionTypes'
import { NAV_SHOW, VIEW_SHOW, VIEW_PIN } from '../constants/ViewStates'
import { realTypeOf } from '../views/display'

import { addGrid } from '../lib/layout'

// Note: Item state is not reset to NAV_SHOW when PINn-ed items move back
//       to the nav, since it's annoying and not useful.

function notify_fail() {
    var err = notify_fail.err ||
              (notify_fail.err = document.getElementById("err_sound")) 

    if(err)
        err.play()
    console.log("fail!")
}

function notify_success() {
    var click = notify_success.click ||
              (notify_success.click = document.getElementById("click_sound")) 

    if(click)
        click.play()
    console.log("success!")
}

// type navSet = { id: planElem }
// type gridSet = { id: planElemPlus } // plus indicates layout info.
// remove items from grid
// State -> gridSet
function clear_grid(state) {
    const grid = filter_set(state.grid, (key,it) => it.state === VIEW_PIN)
    let   navs = filter_set(state.grid, (key,it) =>
                         it.state !== VIEW_PIN && in_dir(state.path, it.path))
    Object.assign(navs, state.navs)
    return { navs, grid }
}


/* Can't do it this way because it mutates GrowingPacker...
// navElem -> GrowingPacker -> gridSet -> Bool
function just_add(e, pack, grid) {
    e.fit = null
    e.w = e.sz[0]
    e.h = e.sz[1]
    pack.fit(e)
    if(!e.fit) {
        return false
    }

    grid.push(e)

    return true
}*/

// TODO: make addGrid more incremental so that pin() actually works...

// move one item from the nav onto the grid
// State -> id -> StateUpd
// StateUpd is empty (i.e. {}) on fail
function select_one(state, id) {
    const e = state.navs[id]
    if(!e) {
        notify_fail()
        console.warn("forward: id not found")
        return {}
    }
    let { navs, grid } = clear_grid(state)

    grid[id] = addprops(e, {state: VIEW_SHOW})
    const rej = addGrid(grid, state.gridsz) // try to 'just add'

    if(Object.keys(rej).length === 0) { // done.
        notify_success()
        delete navs[id]
        return { navs, grid }
    }

    if(!e.hasOwnProperty('sub')) { // single display
        notify_fail(); // couldn't add!
        console.warn("Unexpected element display error. have: "+state.gridsz
                    +", need: "+e.tsz)
        return {}
    }

    // Didn't work.  need to move nav forward.
    return forward(state, e)
}

// move display forward (key is in nav) and return updates to state
// State -> planElem -> StateUpd
export function forward(state, e) {
    let grid = filter_set(state.grid, (key,it) => it.state === VIEW_PIN)
    let n = state.nextID

    if(realTypeOf(e.sub) === 'Object') {
        for(var name in e.sub) {
            let it = e.sub[name]
            if(it.state !== VIEW_PIN) {
                it.state = VIEW_SHOW
                grid[n] = it
                n += 1
            }
        }
    } else {
        e.sub.forEach(it => {
            if(it.state !== VIEW_PIN) {
                it.state = VIEW_SHOW
                grid[n] = it
                n += 1
            }
        })
    }
    const navs = addGrid(grid, state.gridsz)

    notify_success()
    return { nextID: n, navs, grid,
             path: e.path }
}

export default function views(state, action) {
    var ns = {}
    var e, navs, grid
    console.log("Handling: " + state, action)

    // TODO: test direct mutation of 'state' prop of pathElems
    switch (action.type) {
    case types.ADD_VIEW:
        ns = select_one(state, action.id)
        break
    case types.TOG_VIEW:
        e = state.grid[action.id]
        if(e.state === VIEW_SHOW) {
            e = addprops(e,  {state: VIEW_PIN})
            ns = { grid: fmap_obj(state.grid, (key,it) =>
                            key === action.id ? e : it) }
            break
        }
        // delete
        grid = filter_set(state.grid, (key,it) => key !== action.id)
        navs = addGrid(grid, state.gridsz) // re-grid
        if(in_dir(state.path, e.path)) {
           navs[action.id] = e
        }
        ns = { grid }
        if(Object.keys(navs).length > 0) { // set add
            ns.navs = Object.assign(navs, state.navs)
        }
        notify_success()
        break
    case types.CLEAR_VIEW:
        ns = { grid: {} }
        navs = filter_set(state.grid, (key,it) =>
                                            in_dir(state.path, it.path))
        if(Object.keys(navs).length > 0) { // set add
            ns.navs = Object.assign(navs, state.navs)
        }
        notify_success()
        break
    case types.FORWARD_TREE:
        ns = clear_grid(state)
        notify_success()
        break
    case types.BACK_TREE:
        if(state.path.length === 1) {
            notify_fail()
            return state
        }
        const path = state.path.slice(0, state.path.length-1)
        ns = forward(state, state.lookup_path(path))
    }

    fix_navs(ns)
    return addprops(state, ns)
}

/***** Helper functions *****/

function fix_navs(ns) {
    if(ns.hasOwnProperty('navs')) { // hack
        for(var id in ns.navs) {
            ns.navs[id].state = NAV_SHOW
        }
    }
}

function in_dir(dir, path) {
  if(dir.length+1 !== path.length) return false;
  for(var i = 0; i < dir.length; i++) {
      if (dir[i] !== path[i]) return false;
  }
  return true;
}

export function addprops(old, n) {
    if(Object.keys(n).length === 0)
        return old
    Object.keys(old).forEach(function(key) {
        if(!n.hasOwnProperty(key))
            n[key] = old[key]
    })
    return n;
}

// drops items returning null
// otherwise, maps them through f
// {A:B} -> (A -> B -> B | null) -> {A:B}
function fmap_obj(obj, f) {
    let out = {}
    for(var key in obj) {
        const val = f(key, obj[key])
        if(val !== null) {
            out[key] = val
        }
    }
    return out
}

// select a subset of the keys matching the test
// gridSet -> (pathElem -> Bool) -> gridSet
function filter_set(set, test) {
    return fmap_obj(set, (key, it) => test(key,it) ? it : null)
}

