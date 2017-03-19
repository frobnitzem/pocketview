import test from 'ava'
import React from 'react';
import {shallow} from 'enzyme';

import { Grid } from './grid'
import { Scroll } from './scroll'

test('has a .grid class name', t => {
    const wrapper = shallow(<Grid />);
    t.true(wrapper.hasClass('grid'));
});

test('renders children when passed in', t => {
    const wrapper = shallow(
                      <Grid>
                        <div className="unique"/>
                      </Grid>
                    );
    t.true(wrapper.contains(<div className="unique"/>));
});
