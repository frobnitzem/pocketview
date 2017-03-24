import { combineReducers } from 'redux'
import views, {addprops, forward} from './views'

import { NAV_SHOW } from '../constants/ViewStates'

/* The reducer manages a set of hierarchy objects by managing
 * transitions between 3 states:
 *
 *   NAV_SHOW   -- nav set
 *   VIEW_SHOW  -- current set
 *   VIEW_PIN   -- pinned set
 *
 *
 * Every plan comes with the option for complete or step-wise render:
 *
 * planElem : {
 *     path : [String]  -- title path of elem (or [0], [1], etc. for array)
 *     elem : Component -- complete render component
 *     sz  : [Int,Int]  -- size required for complete render
 *     tsz : [Int,Int]  -- size required for complete render with title
 *   ? sub : [] | {}    -- traversable sub-plans (if obj or array)
 * }
 * The store maps a dynamically generated id to
 * planElems plus additional info:
 * {
 *   state : NAV_SHOW | VIEW_SHOW | VIEW_PIN, -- current show state
 *   x: top-left x-pos, // when in grid
 *   y: top-left y-pos  // when in grid
 * }
 *
 */

// make a higher-level reducer
//combineReducers({ views })

function mk_lookup(plan) {
    return function(path) { // path should always be at least length 1!
        var d = plan
        for(var i=1; i<path.length; i++) {
            if(!d.sub) break
            d = d.sub[path[i]]
        }
        return d
    }
}

// creates a reducer, using plan to make the initial state
export default function(plan, winsz, gridsz) {
    let initialState = {
       path: plan.path,
       grid: {},
       navs: {},
       winsz, gridsz,
       nextID: 0,
       lookup_path: mk_lookup(plan)
    }
    Object.assign(initialState, forward(initialState, plan))

    return function(state, action) {
        if (typeof state === 'undefined') {
            return initialState
        }
        return views(state, action)
    }
}

