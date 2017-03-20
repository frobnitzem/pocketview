import React, { PropTypes, Component } from 'react'
import { textWidth } from '../lib/helpers'

import Scroll from './Scroll'

const nrat    = 0.2
const vborder1 = 10
const vborder2 =  5
const hborder = 20
const cmargin = 10

export default class Nav extends Component {
  render() {
    const { navs, winsz, actions, title } = this.props
    const wid = winsz[0]
    const ht  = winsz[1]
    //const sz = <p style={{color:"white",verticalAlign:"bottom"}}>
    //            {winsz[0]+" x "+winsz[1]}</p>
    const vborder = vborder1+vborder2
    const top_ht = ht*nrat < 100 ? 100 : (ht*nrat > 1000 ? 1000 : ht*nrat);

    const cstyle = { width:  wid   -2*(hborder+cmargin),
                     height: top_ht-2*cmargin-vborder }

    return ( <div className="nav" style={{height: top_ht,
                                          width: wid}}>
               <div className="rblock" style={{width: wid-2*hborder,
                                             height: top_ht-vborder2,
                                  borderBottomWidth: vborder2,
                                  borderRightWidth: hborder,
                                  borderTopRightRadius: hborder,
                                  borderBottomRightRadius: hborder+vborder1 }}>
                   <div className="rvert" style={{top: hborder,
                                          right: -textWidth("")}}
                        onClick={actions.forwardTree}>
                   </div>
               </div>
               <div className="lblock" style={{width: wid-2*hborder,
                                               height: top_ht-vborder1,
                                               borderTopWidth: vborder1,
                                               borderLeftWidth: hborder,
                                  borderTopLeftRadius: hborder+vborder1,
                                  borderBottomLeftRadius: hborder}}>
                   <div className="contents" style={ cstyle }>
                     <Scroll navs={navs}
                             winsz={[cstyle.width, cstyle.height]}
                             addView={actions.addView}
                       /> 
                   </div>
                   <div className="lvert" style={ {bottom: hborder} }
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

