
// props : { title : String, doc : [] }
class ATbl extends React.Component {
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
  
  renderTitles() {
      var objs = [];
      this.props.doc.forEach(function(val) {
          objs.push(<div className="sector_indent area_light_text trans_link spot_link">{val}</div>);
      });
      return <div> {objs} </div>;
  }

  renderContent() {
  }

  render() {
    return ( <table style={width: "95%"}>
               <tr>
                 <td className="area_med_color arrhead"></td>
                 <td className="arrtitle">{this.props.title}</td>
                 <td className="area_med_color rcap"></td>
               </tr>
               <tr>
                 <td className="area_med_color"></td>
                 <td colspan="3" style={"padding-left": "5px"}>
                   { this.renderTitles() }
                 </td>
               </tr>
               <tr>
                 <td className="area_med_color botcap"></td>
                 <td></td>
                 <td></td>
               </tr>
             </table>
            );
  }
}

//<div class="table" style="width:100%;margin-bottom:10px;">
//  <div class="row">
//    <div class="cell" style="width:50%;">
