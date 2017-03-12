import { Display } from "../display.jsx";

// props : { title : String, doc : {} }
export class Elbow extends React.Component {
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
        <div className="left_nav_list area_light_color opaque_link" role="tab"
             key={idx} aria-controls={`panel${idx}`} aria-selected={selected}
             onClick={_this.onClick.bind(_this, idx)} >
          {idx}
        </div>
      );
    });
  
    return (
      <div>
      <div className="area_med_color left_nav_elbot">
        <div className="left_nav_elbot_corner" />
      </div>
      <div className="left_nav">
          {titles}
          <div className="area_med_color left_nav_elup" />
          <div className="area_med_color left_nav_elbow_bottom"></div>
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
               <div className="row">
                 <div className="cell area_med_color left_nav_elbow" />
                 <div className="cell section_header">
                   {this.props.title}
                 </div>
                 <div className="cell area_med_color span_top" />
               </div>
               { this._renderTitles() }
               { this._renderContent() }
             </div>
           );
  }
}

