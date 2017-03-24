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

// percent of space occupied by nav
const nrat   = 0.22
const winsz  = [600,700] // minumum height = 300!
let h      = Math.min(Math.max(winsz[1]*nrat, 100), 1000)
h = Math.ceil((h-30)/53)*53 + 30 // exactly fit an integer number of rows
const gridsz = [winsz[0], winsz[1]-h]

const title = "System"
const plan = planDisplay([title], doc, gridsz)
const store = createStore(mk_reducer(plan, winsz, gridsz))

render( <Provider store={store}>
          <App />
        </Provider>,
        document.getElementById('containment')
      )
