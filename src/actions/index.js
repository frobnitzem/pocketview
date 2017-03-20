import * as types from '../constants/ActionTypes'

export const addView     = id => ({ type: types.ADD_VIEW, id })
export const toggleView  = id => ({ type: types.TOG_VIEW, id })
export const clearView   = () => ({ type: types.CLEAR_VIEW })

export const forwardTree = () => ({ type: types.FORWARD_TREE })
export const backTree    = () => ({ type: types.BACK_TREE })
