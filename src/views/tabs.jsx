import { Display } from "../display.jsx";

// props : { title : String, doc : {} }
export class Tabs extends React.Component {
  constructor(props) {
    super(props);  
    this.state = { selected: 0 };
  }
  
  onClick(idx, event) {
    event.preventDefault();
    this.setState({
      selected: idx
    });
  }
  
  _renderTitles() {
    var titles = [];
    var _this = this;
    Object.keys(this.props.doc).forEach(function(idx) {
      var selected = (_this.state.selected === idx ? "true" : "false");
      titles.push(
         <div className="cell obj_color opaque_link row_nav" role="tab"
              key={idx} aria-controls={`panel${idx}`} aria-selected={selected}
              onClick={_this.onClick.bind(_this, idx)}>
           {idx}
         </div>
      );
    });
        //<a onClick={_this.onClick.bind(_this, idx)} href="#">
        //</a>
  
    return (
      <div className="table"><div className="row">
        <div className="cell area_dark_color lcap">&nbsp;</div>
        <div className="cell section_title">{this.props.title}</div>
        <div className="cell area_dark_color hbar">&nbsp;</div>
        {titles}
        <div className="cell area_dark_color rcap">&nbsp;</div>
      </div></div>
    );
  }
  
  _renderContent() {
      var idx = this.state.selected;
      if(idx)
          return Display(idx, this.props.doc[idx]);
      return <div className="empty" />;
  }

  render() {
    return ( <div className="tabs">
                { this._renderTitles() }
                { this._renderContent() }
             </div>
           );
  }
}

