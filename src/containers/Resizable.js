import React, { PropTypes, Component } from 'react'

function lowerbound(a) {
    return a < 300 ? 300 : a;
}

// This component provides top-level resize information.
// Sizes are reported as width x height.
export default class Display extends Component {
    getInitialState() {
        return ({
            winsz:  [window.innerWidth, window.innerHeight].map(lowerbound),
        });
    }

    updateDimensions() {
        this.setState({ winsz: [window.innerWidth,
                                window.innerHeight].map(lowerbound)
                      });
    }

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }

    render() {
        return React.cloneElement(this.props.children[0],
                                  { winsz: this.state.winsz });
    }
}

Display.propTypes = {
    children: PropTypes.element.isRequired
}
