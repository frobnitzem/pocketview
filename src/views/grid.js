import React from 'react'

export var Grid = React.createClass({
    render() {
        return <div className="grid"> { this.props.children } </div>
    }
})
