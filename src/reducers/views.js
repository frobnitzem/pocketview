import React from 'react'

import * as types from '../constants/ActionTypes'
import { NAV_SHOW, VIEW_SHOW, VIEW_PIN } from '../constants/ViewStates'

export default function views(state, action) {
    var ns = {};
    var e;
    console.log("Handling: " + state, action)

    switch (action.type) {
    case types.ADD_VIEW: // TODO: test direct mutation
        e = state.navs.find(it => it.id === action.id)
        e = Object.assign( {state: VIEW_SHOW}, e )
        ns = { navs: state.navs.filter(it => it.id !== action.id),
               grid:  state.grid.concat(e)
             }
        break
    case types.TOG_VIEW: // TODO -- check if item goes back to nav
        e = state.grid.find(it => it.id === action.id)
        if(e.state == VIEW_PIN) { // delete
            ns = { grid: state.grid.filter(it => it.id !== action.id) }
        } else {
            e = Object.assign( {state: VIEW_PIN}, e )
            ns = { grid: state.grid.map(it =>
                            it.id === action.id ? e : it) }
        }
        break
    case types.CLEAR_VIEW: // TODO -- check if items go back to nav
        ns = { grid: [] }
        break
    case types.FORWARD_TREE:
        ns = { grid: state.grid.filter(it => it.state === VIEW_PIN) }
        break
    case types.BACK_TREE: // TODO -- add more nav items here
        if(state.path.length == 1)
            return state;
        break
    }

    if(Object.keys(ns).length == 0)
        return state
    Object.keys(state).forEach(function(key) {
        if(!ns.hasOwnProperty(key))
            ns[key] = state[key]
    })
    return ns
}
