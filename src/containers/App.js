import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { NAV_SHOW, VIEW_SHOW, VIEW_PIN } from '../constants/ViewStates'

import Nav from './Nav'
import Grid from './Grid'

import * as ViewActions from '../actions'

// percent of space occupied by nav
const nrat    = 0.22

const App = ({title, navs, grid, winsz, actions}) => {
    const w = winsz[0];
    const h = Math.min(Math.max(winsz[1]*nrat, 100), 1000);
    return <div>
        <Nav  navs={navs} title={title} actions={actions} winsz={[w,h]} />
        <Grid grid={grid} toggle={actions.toggleView} winsz={[w,winsz[1]-h]} />
    </div>
}

App.propTypes = {
    title: PropTypes.string.isRequired,
    navs: PropTypes.array.isRequired,
    grid: PropTypes.array.isRequired,
    winsz: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    title: state.path[state.path.length-1] || "",
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
