import { toggleSorted } from "../lib.js";
import { max2, add2, titleWidth, linkWidth } from "../lib.js";
import { planDisplay } from './display.jsx';

// props : { title : String,
//           plan  : { 'title' : ReactElement },
//           winsz : [Int,Int],
//           fixwid : Int }
export var Elbow = React.createClass({
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
      Object.keys(this.props.plan).forEach(function(idx) {
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
  // TODO: re-factor this into a grid-display function.
  _renderContent() {
      var props = this.props;
      let wid = props.winsz[0] - props.fixsz[1] - 15;
      let ht  = ( props.winsz[1] - props.fixsz[0] - 15 )
                    / this.state.expanded.length;
      let cols = this.state.expanded.map(function(idx) {
          return (
              <div className="row" key={idx}> {
                  React.cloneElement(props.plan[idx], {
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
    let wid = this.props.winsz[0] - this.props.fixsz[3];
    let ht  = this.props.winsz[1] - this.props.fixsz[2] + 60;
    let sz = <p style={{color:"black",verticalAlign:"bottom"}}>
                {this.props.winsz[0]+" x "+this.props.winsz[1]}</p>;
    return ( <table className="box_nav"><tbody>
      <tr>
        <th id="box11"></th>
        <th id="box12">
          <div className="lhspace" style={{width:wid+"px"}}>
          {sz}
          &nbsp;</div>
          <div className="htitle">
            { this.props.title }
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
          <div className='elbow'>
            <div className='elbow_cut'></div>
          </div>
          { this._renderContent() }
        </td>
      </tr>
    </tbody></table>
    );
  }
});

export function planElbow(title, doc) {
    var minsz = [0,0];
    var totsz = [0,0];

    var name_width = 0;
    var names = 0;
    var plan = {};
    for(var key in doc) {
        let width = linkWidth(key);
        name_width = width > name_width ? width : name_width;
        names += 1;

        let ret = planDisplay(key, doc[key])
        plan[key] = ret[0];
        max2(minsz, ret[1]);
        add2(totsz, ret[2]);
    }
    let col1_w = name_width < 60 ? 60 : name_width;
    let col2_w = 20 + 5 + titleWidth(title) + 5 + 30;

    let row1_h = 120;
    let row2_h = 25 + (28+5)*names + 60;

    let content_pad = [15, 15];

    add2(minsz, content_pad);
    add2(totsz, content_pad);

    max2(minsz, [row2_h, col2_w]);
    max2(totsz, [row2_h, col2_w]);

    add2(minsz, [row1_h, col1_w]);
    add2(totsz, [row1_h, col1_w]);

    var disp = <Elbow title={title} plan={plan}
                  winsz={[640,480]}
                  fixsz={ [row1_h, col1_w, row1_h+row2_h-60, col1_w+col2_w-20] } />
    return [disp, minsz, totsz];
}

