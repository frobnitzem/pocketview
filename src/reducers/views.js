import React from 'react'

import * as types from '../constants/ActionTypes'
import { NAV_SHOW, VIEW_SHOW, VIEW_PIN } from '../constants/ViewStates'

export default function views(state, action) {
    var ns = {};
    var e;
    console.log("Handling: " + state, action)

    switch (action.type) {
    case types.ADD_VIEW: // TODO: test direct mutation
        // TODO: test add children to grid.
        e = state.navs.find(it => it.id === action.id)
        e = addprops(e, {state: VIEW_SHOW})
        ns = { navs: state.navs.filter(it => it.id !== action.id),
               grid:  state.grid.concat(e)
             }
        break
    case types.TOG_VIEW:
        e = state.grid.find(it => it.id === action.id)
        if(e.state == VIEW_PIN) { // delete
            ns = { grid: state.grid.filter(it => it.id !== action.id) }
            if(same_path(state.path,
                        e.plan.path.slice(0,e.plan.path.length-1))) {
               e = addprops(e, {state: NAV_SHOW})
               ns.navs = state.navs.concat(e)
            }
        } else {
            e = addprops(e,  {state: VIEW_PIN})
            ns = { grid: state.grid.map(it =>
                            it.id === action.id ? e : it) }
        }
        break
    case types.CLEAR_VIEW:
        ns = { grid: [] }
        ret = state.grid.filter(it => same_path(state.path, 
                                it.plan.path.slice(0,it.plan.path.length-1)))
        if(navs.length > 0) {
            ns.navs = ret.map(it => addprops(it, {state: NAV_SHOW}))
        }
        break
    case types.FORWARD_TREE:
        ns = { grid: state.grid.filter(it => it.state === VIEW_PIN) }
        break
    case types.BACK_TREE: // TODO -- add more nav items here
        if(state.path.length == 1)
            return state;
        break
    }

    return addprops(state, ns)
}


function same_path(a, b) {
  if(a.length !== b.length) return false;
  for(var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
  }
  return true;
}

function addprops(old, n) {
    if(Object.keys(n).length == 0)
        return old
    Object.keys(old).forEach(function(key) {
        if(!n.hasOwnProperty(key))
            n[key] = old[key]
    })
    return n;
}
