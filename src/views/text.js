import React, {PropTypes, createElement} from 'react'

import Title from './title'

import { line_ht, margin, max2, add2,
         titleSize, textWidth } from '../lib/helpers'
import { typeset } from '../lib/typeset/typeset'

const text_pad = [13*2, 5*2];

export class Text extends React.Component {
    render() {
        const { winsz, plan, children, toggle } = this.props
        const style = { width: winsz[0], height: winsz[1] }
        if(plan.scroll)
            style.overflowY = 'auto'

        return <div className="content" style={style}>
                 <Title path={plan.path} toggle={toggle} wid={plan.tsz[0]} />
                 { children }
               </div>
    }
}

Text.propTypes = {
    plan  : PropTypes.object,
    winsz : PropTypes.array.isRequired,
    children : PropTypes.any.isRequired,
    toggle : PropTypes.func
}

// Line lengths should be between 45 and 90 characters
// or 2-3 alphabets (use 2.6 or so), font between 15-25 px
// vert. spacing 120–145% of the point size (line-height: 1.35;)
export function planText(path, doc, winsz) {
    const width = Math.min(350, winsz[0]*0.8)
    const title = path[path.length-1]
    var scroll = false

    var ret = typeset(doc, 'justify', [width], 3)
    var lines = ret[1].length

    var sz = [ Math.max.apply(null, ret[1]), line_ht*lines ]
    add2(sz, text_pad)
    add2(sz, margin)

    var tsz = titleSize(title)
    tsz[0] = Math.max(tsz[0], sz[0])
    tsz[1] += sz[1] - margin[1]/2

    if(tsz[1] > winsz[1]-10) { // exceeds available vertical height
        var delta = winsz[1]-10 - tsz[1]
        sz[1]  += delta
        tsz[1] += delta
        scroll = true
    }

    //doc.split(/\r?\n/).forEach( (line) => {
    //    let w = textWidth(line);
    //    lines += 1;
    //    wid = wid >= w ? wid : w;
    //});
    //console.log("Planned text: ", lines, sz)

    const plan = {
        sz, tsz, path, scroll
    }
    return Object.assign(plan, {
        elem: createElement(Text, {winsz:[300,150], plan}, ret[0])
    })
}

