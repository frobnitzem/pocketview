import { toggleSorted } from "../lib.js";

// props : { title : String,
//           doc   : { 'title' : ReactElement },
//           winsz : [Int,Int],
//           minsz : [Int,Int],
//           totsz : [Int,Int] }
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
      Object.keys(this.props.doc).forEach(function(idx) {
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
      let cols = this.state.expanded.map(function(idx) {
          return (
              <div className="row" key={idx}> {
                  React.cloneElement(props.doc[idx], {
                          winsz : [100, 100],
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
    return ( <table className="box_nav"><tbody>
      <tr>
        <th id="box11"></th>
        <th id="box12">
          <div className="lhspace" style={{width:"120px"}}>&nbsp;</div>
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
          <div className="bcap" style={{height:"100px"}}>&nbsp;</div>
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

