import { combineReducers } from 'redux'
import views from './views'

export default views
//combineReducers({ views })

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

