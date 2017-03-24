import React, { Component, PropTypes } from 'react'

export default class Scroll extends Component {
  render() {
    const { navs, addView } = this.props
    var children = []
    for(var id in navs) {
        const path = navs[id].path
        const n = id
        children.push(<div className="link navItem" key={id}
                            onClick={() => addView(n)}>
                    { path[path.length-1] }
        </div>)
    }

    return <div className="scroll">{ children }</div>
  }
}

Scroll.propTypes = {
    navs:   PropTypes.object.isRequired, // { id: planElem }
    winsz:  PropTypes.array.isRequired,
    addView: PropTypes.func.isRequired
}

