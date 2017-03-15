import { planDisplay } from './display.jsx';

// props : { title : String,
//           doc   : { 'title' : ReactElement },
//           winsz : [Int,Int],
//           minsz : [Int,Int],
//           totsz : [Int,Int] }
export var Tabs = React.createClass({
    getInitialState() {
        return { selected: false };
    },

    onClick(idx, event) {
        event.preventDefault();
        if(this.state.selected !== idx) {
            this.setState({ selected: idx });
        } else {
            this.setState({ selected: false });
        }
    },

    _renderTitles() {
        var _this = this;
        let keys = Object.keys(this.props.doc);
        return keys.map(function(idx) {
            let selected = (_this.state.selected === idx ? "true" : "false");
            return (
              <div className="cell link" key={idx} role="row"
                   aria-selected={selected}
                   onClick={_this.onClick.bind(_this, idx)}>
                {idx}
              </div>
            );
        });
    },
  
    _renderContent() {
        var idx = this.state.selected;
        if(idx)
            return React.cloneElement(this.props.doc[idx], {
                          winsz : [100, 100],
                   });
        return <div className="empty" />;
    },

    render() {
        return ( 
                <div className="container">
                  <div className="capsule"><div className="table">
                    <div className="tabs">
                      <div className="title"> {this.props.title} </div>
                      <div className="cell hfill" style={{width:"100px"}}>
                           &nbsp;</div>
                      {this._renderTitles()}
                    </div>
                  </div></div>
                  <div className="vspace">&nbsp;</div> 
                  { this._renderContent() }
                </div>
        );
    }
});

