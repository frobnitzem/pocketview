import React from 'react'

import { Scroll } from './scroll'
import { Grid } from './grid'

import { max2, add2, linkWidth, toggleSorted } from '../lib/helpers'

const nrat    = 0.2
const vborder1 = 10
const vborder2 =  5
const hborder = 20
const cmargin = 10

/* This manages a set of hierarchy objects by dividing them into one of
 * 3 states, and their transitions are managed correspondingly
 * by moving items between 3 sets.
 *   nav-show     -- nav set
 *   display-show -- current set
 *   display-pin  -- pinned set
 *
 * They are tracked by giving every item a unique key.
 * "nav" has a special structure, since it must track
 * whether one of its items has been moved to the display area.
 * Each item in "nav" has an added 'display' property,
 * which is true iff the item is currently on loan
 * to the display area.
 *
 */

// props : { plan  : { 'title' : ReactElement },
//           winsz : [Int,Int] }
export var Main = React.createClass({
  getInitialState() {
    return { nav:     {}, // 'nav' displays (didn't fit display area)
             current: {}, // 'ephermal' displays (from current path)
             pinned:  {}, // pinned displays
             nextItem:  0, // serial number to track displayed items
             path:    ["Main"]  // NAV path in JSON tree
           };
  },
  
  backClick(event) { // ascend doc hierarchy
      if(path.length == 1)
        return;
  }

  selectClick(idx, event) { // select from nav
  }

  delClick(idx, event) { // delete pinned item from display area 
    event.preventDefault();

    this.setState((state, props) => {
        if(state.nav.hasOwnProperty(idx)) {
            state.nav[idx].display = false;
        }
        delete state.pinned[idx]
        return { nav: state.nav, pinned: state.pinned }
    }
  }

  pinClick(idx, event) { // pin to display area
    event.preventDefault();

    this.setState((state, props) => {
        state.pinned[idx] = state.current[idx]
        delete state.current[idx]
        return { current: state.current, pinned: state.pinned }
    });
  },
  
  clearClick(event) { // clear displays
    event.preventDefault();

    this.setState((state, props) => {
        for(key in state.pinned) {
            if(state.nav.hasOwnProperty, key) {
                state.nav[key].display = false;
            }
        }
        for(key in state.current) {
            state.nav[key].display = false;
        }
        // rebuild nav items from list of current and pinned ones
        return {
            nav: state.nav,
            current: {},
            pinned: {},
        }
    })
  }

  _unselected() {
      return <p> unselected </p>
  }
  _content() {
      return <p> content </p>
  }

  render() {
    const wid = this.props.winsz[0]
    const ht  = this.props.winsz[1]
    const sz = <p style={{color:"black",verticalAlign:"bottom"}}>
                {this.props.winsz[0]+" x "+this.props.winsz[1]}</p>
    const state = self.state
    const vborder = vborder1+vborder2
    const cstyle = { width:  wid-2*(hborder+cpad),
                     height: top_ht-2*cpad-vborder }

    const top_ht = ht*nrat < 100 ? 100 : (ht*nrat > 1000 ? 1000 : ht*nrat);

    return ( <div className="main">
               <div className="outer" style={{height: wid,
                                              width: top_ht}}>
                 <div className="lblock" style={{width: wid-2*hborder,
                                                 height: top_ht-vborder1,
                                                 borderTopWidth: vborder1,
                                                 borderLeftWidth: hborder,
                                  borderTopLeftRadius: hborder+vborder1,
                                  borderBottomLeftRadius: hborder}}>
                   <div className="contents" style={ cstyle }>
                     <Scroll winsz={[cstyle.width, cstyle.height]}>
                       { this._unselected() }
                     </Scroll> 
                   </div>
                   <div className="lvert" style={ {bottom: hborder} }>
                     state.path[state.path.length-1]
                   </div>
                 </div>
                 <div class="rblock" style={{width: wid-2*hborder,
                                             height: top_ht-vborder2
                                  borderBottomWidth: vborder2,
                                  borderRightWidth: hborder,
                                  borderTopRightRadius: hborder,
                                  borderBottomRightRadius: hborder+vborder1 }}>
                   <div class="rvert" style={top: hborder,
                                            right: -textWidth("")}>
                   </div>
                 </div>
               </div>

               <Grid>   { this._content()    } </Grid>
             </div>
    );
  }
});

