import React, { cloneElement, Component, PropTypes } from 'react'

import * as types from '../constants/ViewStates'

export default class Grid extends Component {
  layout_items(grid, toggle) {
      var children = []
      for(var id in grid) {
          const g = grid[id]
          children.push(<div key={id} style={{position:"absolute",
                                              left:g.x, top:g.y}}>{
                cloneElement(g.elem, { toggle: () => toggle(id),
                                       winsz: g.tsz })
             }</div>)
      }
      return children
  }
  render() {
    const { grid, toggle, winsz } = this.props
    return <div className="grid" style={{width:winsz[0], height:winsz[1]}}>{
             this.layout_items(grid, toggle)
           }</div>
  }
}

Grid.propTypes = {
    grid: PropTypes.object.isRequired,
    winsz: PropTypes.array.isRequired,
    toggle: PropTypes.func.isRequired
}

