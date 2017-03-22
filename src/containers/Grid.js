import React, { cloneElement, Component, PropTypes } from 'react'

import * as types from '../constants/ViewStates'

// TODO: clone element when id is first defined...
export default class Grid extends Component {
  render() {
    const { grid, toggle, winsz } = this.props
    return <div className="grid" style={{width:winsz[0], height:winsz[1]}}>{
             grid.map(g => cloneElement(g.plan.elem, {
                                          toggle: () => toggle(g.id) })
               )
           }</div>
  }
}

Grid.propTypes = {
    grid: PropTypes.array.isRequired,
    winsz: PropTypes.array.isRequired,
    toggle: PropTypes.func.isRequired
}

