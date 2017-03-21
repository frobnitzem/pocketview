import React, {PropTypes} from 'react'

import Title from './title'
import { max2, add2, titleSize, linkWidth, textWidth } from '../lib/helpers'
import { planDisplay } from './display'

export class ArrTbl extends React.Component {
  render() {
    const { plan, toggle } = this.props
    const items = plan.sub.map((s,i) =>
        <div key={i.toString()} className="row">{ s.elem }</div>)

    return ( <div className="content">
               <Title path={plan.path} toggle={toggle} />
               <div className="capsule"><div className="table">
                 { items }
               </div></div>
             </div>
           );
  }
}

ArrTbl.propTypes = {
    plan  : PropTypes.object,           // planElem
    winsz : PropTypes.array.isRequired, // [Number, Number]
    toggle : PropTypes.func
}

// Calculate wrapper size.
export function planArray(path, doc) {
    //var num = count_arr(doc);
    //if(is_pure(num)) { // make better plans...
    //} 
    const title = path[path.length-1] || "";
    const mysz = [13*2, title ? 35 : 0];

    var minsz = title ? titleSize(title) : [0,0];
    var sub = [];
    minsz[1] = 0; // height of title not included

    doc.forEach((u,i) => {
        let ret = planDisplay(path.concat('['+i+']'), u);
        sub.push(ret);
        max2(minsz, ret.sz);
    });

    var totsz = [ minsz[0], doc.length*18 ];

    add2(minsz, mysz);
    add2(totsz, mysz);

    const plan = {
            sz:   totsz,
            path, sub
          };
    const elem = <ArrTbl winsz={[300,150]} plan={plan} key={path.join(".")} />
    return Object.assign(plan, {elem})
}

