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
               <div className="capsule"> <div className="title">
                    { props.title }
               </div> </div>
               <div className="capsule"><div className="table">
                 { items }
               </div></div>
             </div>
           );
}
