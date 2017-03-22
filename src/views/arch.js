import React, { PropTypes } from 'react'

import Title from './title'

import { max2, add2, titleSize, navWidth, toggleSorted,
         capsule_wid, title_ht, margin } from "../lib/helpers"
import { planDisplay } from './display'
import { planCols } from '../lib/layout'

const vpad   = 18
const vborder2 = 5

// props : { plan  : planElem,
//           winsz : [Int,Int]
//         }
export class Arch extends React.Component {
  /*componentDidMount() {
      const { plan } = this.props
      const wid = plan.sz[0] - margin[0]
      const title = plan.path[plan.path.length-1]
      //const cols = plan.cols -- need to get set of x-vals
      const twid = titleSize(title)[0] - capsule_wid
      const tstart = wid - capsule_wid/2 - 5 - twid
      const cpt  = title_ht + vborder2 // curve 'horizontal run' 
      const cpt2 = cpt*vpad/(vpad+title_ht)
      // cpt2/vpad === cpt/(vpad+title_ht)
      console.log(twid, tstart, cpt, cpt2)

      let ctx = this.canvas.getContext('2d')
      // draw arches...
      ctx.clearRect(0, 0, wid, title_ht+vpad);
      ctx.beginPath();
      ctx.moveTo(0, title_ht+vpad);
      if(cpt < tstart) {
          ctx.quadraticCurveTo(0, 0, cpt, 0);
          ctx.lineTo(twid, 0);
      } else {
          ctx.quadraticCurveTo(0, 0, tstart, 0);
      }
      ctx.lineTo(tstart, title_ht);
      if(cols[0][1]+cpt2 < tstart) {
          ctx.lineTo(cols[0][1]+cpt2, title_ht);
          ctx.quadraticCurveTo(cols[0][1]+cpt2, title_ht+vpad,
                               cols[0][1], title_ht+vpad);
      } else {
          ctx.quadraticCurveTo(tstart, title_ht+vpad,
                               cols[0][1], title_ht+vpad);
      }
      ctx.closePath();
      ctx.fillStyle="#FF55FF";
      ctx.fill();

      ctx.fillStyle="#FFF";
      ctx.font="20px FinalNew, serif";
      ctx.fillText("Hello World!",tstart+5,0);
  }*/

  renderChildren() {
      const { plan } = this.props
      let children = []
      var i = -2
      for(var k in plan.sub) {
          const ch = plan.sub[k]
          i += 2;
          children.push(
              <div className="archNav" key={i} style={{
                          position: "absolute",
                          left: ch.x[0], top: ch.y,
                          width: ch.x[1]-ch.x[0]-margin[0],
                          height: ch.h - margin[1]
                        }}>{k}</div>
          )
          children.push(
              <div key={i+1} style={{
                          position: "absolute",
                          margin: "5px",
                          left: ch.x[1], top: ch.y,
                          width: ch.w[1]-margin[0],
                          height: ch.h-margin[1]
               }}>{
                  React.cloneElement(ch.elem, { winsz: [ch.w, ch.h] })
              }</div>
          )
      }
      return children
  }

  render() {
    const { plan, winsz, toggle } = this.props;
    const title = plan.path[plan.path.length-1]

             /*<canvas ref={e => { this.canvas = e; }}
               style={{width: plan.tsz[0], height: title_ht+vpad}}
               className="arch" onClick={toggle}>{title}</canvas>*/
    return <div className="content" style={{width: plan.tsz[0],
                                            height:plan.tsz[1]}}>
             <Title path={plan.path} toggle={toggle} />
             <div style={{width:plan.tsz[0],
                          height:plan.tsz[1]-title_ht-vpad,
                          position:"relative"
                    }}>{ this.renderChildren() }</div>
           </div>
  }
}
Arch.propTypes = {
    plan:  PropTypes.object.isRequired,
    winsz: PropTypes.array.isRequired,
    toggle: PropTypes.func
}

export function planArch(path, doc) {
    const title = path[path.length-1]

    var sub = {}
    for(var key in doc) {
        sub[key] = planDisplay(path.concat(key), doc[key])
    }
    var sz = planCols(sub)

    var tsz = titleSize(title) // includes margins
    sz[0] = Math.max(tsz[0], sz[0])
    sz[1] += tsz[1] + vpad

    let plan = {
            sz, tsz: sz, path, sub
        };
    const elem = <Arch key={path.join(".")} plan={plan} winsz={[300,150]} />
    return Object.assign(plan, { elem } )
}

