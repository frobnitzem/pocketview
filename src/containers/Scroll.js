import React, { Component, PropTypes } from 'react'

export default class Scroll extends Component {
  render() {
    const { navs, addView } = this.props
    const children = navs.map(nav => {
                const path = nav.plan.path
                return <div className="link navItem" key={nav.id}
                            onClick={() => addView(nav.id)}>
                    { path[path.length-1] }
                </div>
              })

    return <div className="scroll">
             { children }
           </div>
  }
}

Scroll.propTypes = {
    navs:   PropTypes.array.isRequired,
    winsz:  PropTypes.array.isRequired,
    addView: PropTypes.func.isRequired
}

