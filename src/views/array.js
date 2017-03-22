import React, {PropTypes} from 'react'

import Title from './title'
import { max2, add2, titleSize, linkWidth, textWidth } from '../lib/helpers'
import { planDisplay } from './display'

const margin = [5*2, 5*2];
const capsule_width = 13*2;

export class ArrTbl extends React.Component {
  render() {
    const { plan, toggle, winsz } = this.props
    const items = plan.sub.map((s,i) =>
        <div key={i.toString()} className={plan.display}>{ s.elem }</div>)

    return ( <div className="content">
               <Title path={plan.path} toggle={toggle} wid={plan.tsz[0]} />
               <div className="capsule"><div className="table">
                 { items }
               </div></div>
             </div>
           );
  }
}

ArrTbl.propTypes = {
    plan  : PropTypes.object.isRequired, // planElem
    winsz : PropTypes.array.isRequired, // [Number, Number]
    toggle : PropTypes.func
}

// Calculate wrapper size.
export function planArray(path, doc) {
    //var num = count_arr(doc);
    //if(is_pure(num)) { // TODO: make better plans...
    //} 
    const title = path[path.length-1]
    let sub = [];

    // Find total and max and decide whether to use row- or column- layout.
    var totsz = [0,0], maxsz = [0,0];
    var display;
    doc.forEach((u,i) => {
        let ret = planDisplay(path.concat('['+i+']'), u);
        sub.push(ret);
        add2(totsz, ret.sz);
        max2(maxsz, ret.sz);
    });
    // use log(width / height) to decide penalty
    if(Math.abs(Math.log(totsz[0]/maxsz[1])) <=
                Math.abs(Math.log(totsz[1]/maxsz[0]))) {
        totsz[1] = maxsz[1]
        display = "cell"
    } else {
        totsz[0] = maxsz[0]
        display = "row"
    }
    totsz[0] += capsule_width
    add2(totsz, margin)

    var tsz = titleSize(title)
    tsz[0] = Math.max(tsz[0], totsz[0])
    tsz[1] += totsz[1] - margin[1]/2

    const plan = {
            sz:   totsz,
            tsz,
            path, sub,
            display
          };
    const elem = <ArrTbl winsz={[300,150]} plan={plan} key={path.join(".")} />
    return Object.assign(plan, {elem})
}

