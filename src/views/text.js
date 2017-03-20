import React, {PropTypes, createElement} from 'react'

import { max2, add2, titleSize, textWidth } from '../lib/helpers'
import { typeset } from '../lib/typeset/typeset'

export class Text extends React.Component {
    render() {
        const { winsz, plan, children } = this.props
        const title = plan.path[plan.path.length-1]

        return <div className="content" style={{ width: winsz[0],
                                                 height: winsz[1] }}>
                 { title &&
                   <div className="capsule"> <div className="title">
                     { title }
                   </div></div>
                 }
                 { children }
               </div>
    }
}

Text.propTypes = {
    plan  : PropTypes.object,
    winsz : PropTypes.array.isRequired,
    children : PropTypes.any.isRequired
}

// Line lengths should be between 45 and 90 characters
// or 2-3 alphabets (use 2.6 or so), font between 15-25 px
// vert. spacing 120–145% of the point size (line-height: 1.35;)
export function planText(path, doc) {
    const width = 350
    const title = path[path.length-1]

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

    const plan = {
        sz, path
    }
    return Object.assign(plan, {
                elem: createElement(Text, {winsz:[300,150], plan}, ret[0])
    })
}

