import React, { PropTypes, Component } from 'react'
import { textWidth } from '../lib/helpers'

import Scroll from './Scroll'

const vborder1 = 10
const vborder2 =  5
const hborder = 32
const cmargin = 10

export default class Nav extends Component {
  render() {
    const { navs, winsz, actions, title } = this.props
    const wid = winsz[0]
    const ht  = winsz[1]
    //const sz = <p style={{color:"white",verticalAlign:"bottom"}}>
    //            {winsz[0]+" x "+winsz[1]}</p>
    const vborder = vborder1+vborder2

    const cstyle = { width:  wid   -hborder-2*cmargin,
                     height: ht-2*cmargin-vborder }

    return ( <div className="nav" style={{width: wid,
                                          height: ht}}>
               <div className="lblock" style={{width: wid-hborder,
                                               height: ht-vborder1,
                                               borderBottomWidth: vborder1,
                                               borderLeftWidth:   hborder,
                                  borderBottomLeftRadius: hborder+vborder1,
                                  }}>
                   <div className="contents" style={ cstyle }>
                     <Scroll navs={navs}
                             winsz={[cstyle.width, cstyle.height]}
                             addView={actions.addView}
                       /> 
                   </div>
                   <div className="title lvert" style={ {bottom: hborder} }
                        onClick={actions.backTree}>
                      { title }
                   </div>
                 </div>
             </div>
    )
  }
}

Nav.propTypes = {
    title:   PropTypes.string,
    navs:    PropTypes.array.isRequired, // [ planItem ]
    winsz:   PropTypes.array.isRequired, // [Int, Int]
    actions: PropTypes.object.isRequired
}

