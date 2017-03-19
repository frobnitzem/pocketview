import React, {PropTypes} from 'react'

import { max2, add2, titleSize, textWidth } from '../lib/helpers'
import { typeset } from '../lib/typeset/typeset'

export class Text extends React.Component {
    render() {
        const props = this.props

        return <div className="content" style={{ width:props.sz[0],
                                                 height:props.sz[1] }}>
                 { props.title &&
                   <div className="capsule"> <div className="title">
                     { props.title }
                   </div></div>
                 }
                 { props.doc }
               </div>
    }
}

Text.propTypes = {
    title : PropTypes.string,
    sz    : PropTypes.array.isRequired,
    doc   : PropTypes.element.isRequired
}

// Line lengths should be between 45 and 90 characters
// or 2-3 alphabets (use 2.6 or so), font between 15-25 px
// vert. spacing 120–145% of the point size (line-height: 1.35;)
export function planText(title, doc) {
    const width = 350
    var ret = typeset(doc, 'justify', [width], 3)
    var lines = ret[1].length

    var sz = [ Math.max.apply(null, ret[1]) + 30,
               21*lines + 30 ]
    if(title) {
        const tsz = titleSize(title)
        sz[0] = Math.max(sz[0], tsz[0])
        sz[1] += tsz[1]
    }
    //doc.split(/\r?\n/).forEach( (line) => {
    //    let w = textWidth(line);
    //    lines += 1;
    //    wid = wid >= w ? wid : w;
    //});
    console.log("Planned text: ", lines, sz)

    return [ <Text title={title} doc={ret[0]} sz={sz} />, sz ]
}

