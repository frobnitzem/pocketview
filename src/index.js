import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { planDisplay } from "./views/display.js";

import axios from 'axios';

import App from './containers/App'
import mk_reducer from './reducers'

// Leading causes of death in the City of New York.
// Dataset courtesy of:
// https://catalog.data.gov/dataset/new-york-city-leading-causes-of-death-ce97f/resource/e6d99f7d-da1f-4559-ad6b-9d57df0610c2
// Others from recognizable APIs, plus one http://ascii.co.uk/art/maze.
import fib from      '../data/fib.json';
import simple_obj from '../data/simple_obj.json';
import arr2d from    '../data/arr2d.json';
import arr_mix from  '../data/arr_mix.json';
import darkside from '../data/darkside.json';
import events from   '../data/events.json';
import nymort from   '../data/nymortality.json';
var doc = {
    'fib': fib,
    'simple_obj': simple_obj,
    'arr2d': arr2d,
    'arr_mix': arr_mix,
    'darkside': darkside,
    'events': events,
    'nymort': nymort,
};

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

var simple_doc = {
    str: "A test string",
    tok: false,
    arr: [1,2,3,4],
    sub: { a: 1, b: 2 }
}

const title = "System"
const plan = planDisplay([title], doc)
const store = createStore(mk_reducer(plan))

render( <Provider store={store}>
          <App winsz={[600,700]} />
        </Provider>,
        document.getElementById('containment')
      )
