//import "./array.jsx";
import { Tabs } from "./views/tabs.jsx";
import { Display } from "./display.jsx";

// Leading causes of death in the City of New York.
// Dataset courtesy of:
// https://catalog.data.gov/dataset/new-york-city-leading-causes-of-death-ce97f/resource/e6d99f7d-da1f-4559-ad6b-9d57df0610c2
import doc from './nymortality.json';
//var doc = {"ok": 1};

// Helper for retrieving json data dynamically.
function Retrieve(title, path) {
  return React.createClass({
    getInitialState() {
        return {
            doc: "Loading..."
        };
    },

    componentDidMount() {
        axios.get(path).then(res => {
                const doc = res.data;
                this.setState({ doc });
            });
    },
  
    render() {
      return Display(title, this.state.doc);
    }
  });
}

ReactDOM.render( <Tabs title={"System"} doc={doc} />, document.getElementById('containment') );
//var Completed = Retrieve("Completed", "https://sque.predictivestatmech.org/api/v1/completed/");
//ReactDOM.render( <Completed />, document.getElementById('containment') );

