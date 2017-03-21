import React from 'react'

import { max2, add2, titleSize, linkWidth, toggleSorted } from "../lib/helpers"
import { planDisplay } from './display'

// props : { plan  : planElem,
//           winsz : [Int,Int]
//         }
export var Arch = React.createClass({
  getInitialState() {
    return { expanded: [] };
  },
  
  onClick(idx, event) {
    event.preventDefault();

    var e = this.state.expanded;
    toggleSorted(e, idx);
    this.setState({
        expanded: e
    });
  },
  
  _renderTitles() {
      var _this = this;
      var keys = [];
      const { plan } = this.props;
      Object.keys(plan.sub).forEach(function(idx) {
          toggleSorted(keys, idx);
      }); // sort em
      return keys.map(function(idx) {
          let expanded = _this.state.expanded.includes(idx) ? "true" : "false";
          return (
              <div className="link" key={idx} role="row"
                   aria-expanded={expanded}
                   onClick={_this.onClick.bind(_this, idx)} >
                {idx}
              </div>
          );
      });
  },
  
  // Table of expanded elements
  _renderContent() {
      const { plan, winsz } = this.props;
      let wid = winsz[0] - plan.fixsz[0] - 15;
      let ht  = ( winsz[1] - plan.fixsz[1] - 15 )
                    / this.state.expanded.length;
      let cols = this.state.expanded.map(function(idx) {
          return (
              <div className="row" key={idx}> {
                  React.cloneElement(plan.sub[idx].elem, {
                          winsz : [wid, ht],
                  })
              } </div>
          );
      });
      return (
              <div className="table">
                { cols }
              </div>
      );
  },

  render() {
    const { plan, winsz } = this.props;
    let wid = winsz[0] - plan.fixsz[2];
    let ht  = winsz[1] - plan.fixsz[3] + 60;
    let sz = <p style={{color:"black",verticalAlign:"bottom"}}>
                {winsz[0]+" x "+winsz[1]}</p>;
    return ( <table className="box_nav"><tbody>
      <tr>
        <th id="box11"></th>
        <th id="box12">
          <div className="lhspace" style={{width:wid+"px"}}>
          {sz}
          &nbsp;</div>
          <div className="htitle">
            { plan.title }
          </div>
          <div className="rcap">&nbsp;</div>
        </th>
      </tr>
      <tr>
        <td id="box21" style={{width:"60px"}} role="treegrid" aria-readonly="true">
          <div className="tvspace">&nbsp;</div>
          { this._renderTitles() }
          <div className="bcap" style={{height:ht+"px"}}>&nbsp;</div>
        </td>
        <td id="box22">
          <div className='arch'>
            <div className='elbow_cut'></div>
          </div>
          { this._renderContent() }
        </td>
      </tr>
    </tbody></table>
    );
  }
});

export function planArch(path, doc) {
    const title = path[path.length-1] || "";
    var minsz = [0,0];
    var totsz = [0,0];

    var name_width = 0;
    var names = 0;
    var sub = {};
    for(var key in doc) {
        let width = linkWidth(key);
        name_width = width > name_width ? width : name_width;
        names += 1;

        sub[key] = planDisplay(path.concat(key), doc[key])
        max2(minsz, sub[key].sz);
        totsz[1] += sub[key].sz[1];
    }
    let tsz = titleSize(title);
    let col1_w = name_width < 60 ? 60 : name_width;
    let col2_w = 20 + 5 + tsz[0] + 5 + 30;

    let row1_h = 120;
    let row2_h = 25 + (28+5)*names + 60;

    let content_pad = [15, 15];

    add2(minsz, content_pad);
    add2(totsz, content_pad);

    max2(minsz, [col2_w, row2_h]);
    max2(totsz, [col2_w, row2_h]);

    add2(minsz, [col1_w, row1_h]);
    add2(totsz, [col1_w, row1_h]);

    let plan = {
            sz: totsz, path, sub,
            fixsz: [col1_w, row1_h, col1_w+col2_w-20, row1_h+row2_h-60]
        };
    const elem = <Arch title={title} key={path.join(".")}
                       plan={plan} winsz={[300,150]} />
    return Object.assign(plan, { elem } )
}

