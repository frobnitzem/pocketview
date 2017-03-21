import { combineReducers } from 'redux'
import views from './views'

import { NAV_SHOW } from '../constants/ViewStates'

// make a higher-level reducer
//combineReducers({ views })

// creates a reducer, using plan to make the initial state
export default function(plan) {
    let i = -1
    const navs = Object.keys(plan.sub).map(key => {
                        i += 1
                        return { id: i, state: NAV_SHOW, plan: plan.sub[key] }
                 })
    console.log(navs)
    const initialState = {
       path:  plan.path,
       grid:  [],
       navs,
       nextID: i+1
    }

    return function(state, action) {
        if (typeof state === 'undefined') {
            return initialState
        }
        return views(state, action)
    }
}

/* The reducer manages a set of hierarchy objects by managing
 * transitions between 3 states:
 *
 *   NAV_SHOW   -- nav set
 *   VIEW_SHOW  -- current set
 *   VIEW_PIN   -- pinned set
 *
 */

/* Every plan comes with the option for complete or step-wise render:
 *
 * planElem : {
 *     path : [String]  -- title path of elem (or [0], [1], etc. for array)
 *     elem : Component -- complete render component
 *     sz  : [Int,Int]  -- size required for complete render
 *   ? sub : [] | {}    -- traversable sub-plans (if obj or array)
 * }
 * The store must re-wrap these elements to save additional info:
 * {
 *   id : Int,          -- dynamically generated id by store
 *   state : NAV_SHOW | VIEW_SHOW | VIEW_PIN, -- current show state
 *   plan  : planElem   -- wrapped elem
 * }
 *
 * props : { plan    : planElem,
 *           winsz   : [Int,Int],
 *           actions : { action handlers } }
 */

