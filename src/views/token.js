import React, {PropTypes, createElement} from 'react'

import Title from './title'

import { titleSize, textWidth } from '../lib/helpers'

export class Token extends React.Component {
    render() {
        const { winsz, plan, children, toggle } = this.props

        return <div>
                 <Title path={plan.path} toggle={toggle} />
                 <div className="token">{ children }</div>
               </div>
    }
}

Token.propTypes = {
    winsz : PropTypes.array.isRequired,
    children : PropTypes.any.isRequired,
    toggle : PropTypes.func
}

export function planToken(path, doc) {
    const title = path[path.length-1]
    let sz = [textWidth(doc) + 30, 21];

    doc = doc.toString();
    const wid = textWidth(doc) + 30;

    if(title) {
        const tsz = titleSize(title)
        sz[0] = Math.max(sz[0], tsz[0])
    }

    const plan = {
        sz, path
    }
    return Object.assign(plan, {
        elem: <Token key={path.join(".")} winsz={[300,150]}
                     plan={plan}>{doc}</Token>
    })
}

