import { max2, add2, titleWidth, linkWidth, textWidth } from '../lib.js';
import { planDisplay } from './display.jsx';

// For now, just renders 1 per row.
// props : { title : String,
//           doc   : 'a,
//           winsz : [Int,Int],
//           minsz : [Int,Int],
//           totsz : [Int,Int],
//           fn    :  'a -> ReactElem }
export function ArrTbl(props) {
    let items = props.doc.map( (x) => {
        return <div className="row"> {props.fn(x)} </div>
    });
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

var identity = (x) => { return x; }

// Calculate wrapper size.
export function planArrTbl(title, doc) {
    let mysz = [title ? 35 : 0, 13*2];

    var minsz = [ title ? titleWidth(title) : 0, 0 ];
    var children = [];

    doc.forEach( u => {
        let ret = planDisplay("", u);
        children.push(ret[0]);
        max2(minsz, ret[1]);
    });

    var totsz = [ doc.length*18, minsz[1] ];

    add2(minsz, mysz);
    add2(totsz, mysz);
    var disp = <ArrTbl title={title} doc={children} winsz={[640,480]}
                       minsz={minsz} totsz={totsz} fn={identity} /> ;
    return [disp, minsz, totsz];
}

