import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { NAV_SHOW, VIEW_SHOW, VIEW_PIN } from '../constants/ViewStates'

import Nav from './Nav'
import Grid from './Grid'

import * as ViewActions from '../actions'

const App = ({title, navs, grid, winsz, gridsz, actions}) => {
    return <div>
        <Nav  navs={navs} title={title} actions={actions}
              winsz={[winsz[0], winsz[1]-gridsz[1]]} />
        <Grid grid={grid} toggle={actions.toggleView} winsz={gridsz} />
    </div>
}

App.propTypes = {
    title: PropTypes.string.isRequired,
    navs: PropTypes.object.isRequired, // { id: planElem }
    grid: PropTypes.object.isRequired, // { id: planElemPlus }
    winsz: PropTypes.array.isRequired,
    gridsz: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    title: state.path[state.path.length-1] || "",
    winsz: state.winsz,
    gridsz: state.gridsz,
    navs: state.navs,
    grid: state.grid
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(ViewActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
