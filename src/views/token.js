import React, {PropTypes, createElement} from 'react'

import Title from './title'

import { margin, add2, titleSize, textWidth } from '../lib/helpers'

const tok_ht = 24;

export class Token extends React.Component {
    render() {
        const { winsz, plan, children, toggle } = this.props

        if(!toggle) {
            return <span className="token">{ children }</span>
        }
        const title = plan.path[plan.path.length-1]
        return <div className="keytoken">
            <span className="title" onClick={toggle}>{ title }</span>
            <span>{ children }</span>
        </div>
    }
}

Token.propTypes = {
    winsz : PropTypes.array.isRequired,
    children : PropTypes.any.isRequired,
    toggle : PropTypes.func
}

export function planToken(path, doc) {
    doc = doc.toString();

    const title = path[path.length-1];
    let sz = [textWidth(doc), tok_ht];
    add2(sz, margin);

    let tsz = titleSize(title);
    tsz[0] += sz[0] - margin[0] + 10; // extra left-padding

    const plan = {
        tsz, sz, path
    }
    return Object.assign(plan, {
        elem: <Token key={path.join(".")} winsz={[300,150]}
                     plan={plan}>{doc}</Token>
    })
}

