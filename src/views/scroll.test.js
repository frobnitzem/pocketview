import test from 'ava'
import React from 'react';
import {shallow} from 'enzyme';

import { Scroll } from './scroll'

test('has a .scroll class name', t => {
    const wrapper = shallow(<Scroll />);
    t.true(wrapper.hasClass('scroll'));
});

test('renders children when passed in', t => {
    const wrapper = shallow(
                      <Scroll>
                        <div className="unique"/>
                      </Scroll>
                    );
    t.true(wrapper.contains(<div className="unique"/>));
});
