import React from 'react'

export var Scroll = React.createClass({
    render() {
        return <div className="scroll"> { this.props.children } </div>
    }
})
