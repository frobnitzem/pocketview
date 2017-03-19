import React, {PropTypes} from 'react'

import { max2, add2, titleSize, linkWidth, textWidth } from '../lib/helpers'
import { planDisplay } from './display'

var identity = x => x

export class ArrTbl extends React.Component {
  render() {
    const props = this.props
    let items = []

    for(var i=0; i<props.doc.length; i++) {
        items.push(<div key={i.toString()} className="row">
                        { props.doc[i] } </div>)
    }
    return ( <div className="content">
               { props.title &&
               <div className="capsule"> <div className="title">
                    { props.title }
               </div> </div> }
               <div className="capsule"><div className="table">
                 { items }
               </div></div>
             </div>
           );
  }
}

ArrTbl.propTypes = {
    title : PropTypes.string,
    doc   : PropTypes.array,
    winsz : PropTypes.array.isRequired, // [Number, Number]
    fn    : PropTypes.func.isRequired
}

// Specifies the default values for props:
ArrTbl.defaultProps = {
    fn: identity
}

// Calculate wrapper size.
export function planArrTbl(title, doc) {
    let mysz = [title ? 35 : 0, 13*2];

    var minsz = title ? titleSize(title) : [0,0];
    var children = [];

    doc.forEach( u => {
        let ret = planDisplay("", u);
        children.push(ret[0]);
        max2(minsz, ret[1]);
    });

    var totsz = [ doc.length*18, minsz[1] ];

    add2(minsz, mysz);
    add2(totsz, mysz);
    const disp = <ArrTbl title={title} winsz={[0,0]} doc={children}
                         totsz={totsz} fn={identity}></ArrTbl>
    return [disp, totsz];
}

