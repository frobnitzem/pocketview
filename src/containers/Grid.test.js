import test from 'ava'
import React from 'react';
import {shallow} from 'enzyme';

import { Grid } from './Grid'

function setup() {
    const props = {
        grid: [],
        winsz: [300,200],
        toggle: id => console.log("Toggle: "+id)
    }
    return shallow( <Grid grid={props.grid} winsz={props.winsz}
                          toggle={props.toggle} /> );
}

test.skip('Grid renders a grid', t => {
    const output = setup()
    t.true(output.hasClass('grid'));
});

test.skip('renders children when passed in', t => {
    const wrapper = shallow(
                      <Grid>
                        <div className="unique"/>
                      </Grid>
                    );
    t.true(wrapper.contains(<div className="unique"/>));
});
