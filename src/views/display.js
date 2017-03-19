import React from 'react'

import { Tabs } from "./tabs"
import { Elbow, planElbow } from "./elbow"
import { ArrTbl, planArrTbl } from "./array"
import { textWidth } from "../lib/helpers"
import { planText } from "./text"

// [] -> Array
// {} -> Object
// "" -> String
// 0 or 0.0 -> Number
// function() {} -> Function
// false -> Boolean
// null -> Null
// /[]/ -> RexExp
function realTypeOf(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
};

function add_count(num, u) {
    switch(realTypeOf(u)) {
    case "Array":
        num.array += 1;
        break;
    case "Object":
        num.object += 1;
        break;
    case "String":
        if(u.match(/\n/)) {
            num.text += 1;
            break;
        }
    case "Number":
    case "Boolean":
    case "Null":
        num.token += 1;
        break;
    default:
        num.other += 1;
    }
}

function is_pure(num) {
    var count = (num.array > 0) + (num.object > 0) + (num.token > 0)
              + (num.text  > 0) + (num.other > 0);
    return count < 2;
}
function count_arr(doc) {
    var num = { "array" : 0, "object" : 0, "token" : 0,
                "text"  : 0, "other" : 0 };
    doc.forEach( u => { add_count(num, u) } );
    return num;
}
function count_obj(doc) {
    var num = { "array" : 0, "object" : 0, "token" : 0,
                "text"  : 0, "other" : 0 };
    for(var key in doc) {
        add_count(num, doc[key]);
    }
    return num;
}

// Calculate display attributes for each leaf node
// assuming it can be rendered in its entirety.
//
// Returns the following:
// [ disp,  // e.g. <ArrTbl  f=id />
//   sz,    // e.g. [ 10, 10 ] -- h x w required to display element
// ]

// Reactify-s the JSON data by transforming it into
// a display, modeled as a tree of React elements.
export function planDisplay(title, doc) {
    switch(realTypeOf(doc)) {
    case "Array":
        //var num = count_arr(doc);
        //if(is_pure(num)) { // make better plans...
        //} 
        console.log("Planning array sz " + doc.length)
        return planArrTbl(title, doc);
    case "Object":
        return planElbow(title, doc);
    case "String":
        if(doc.length > 30 || doc.match(/\r?\n/)) {
            return planText(title, doc)
        }
    case "Number":
    case "Boolean":
    case "Null":
        let wid = textWidth(doc) + 30;
        return [<div className="token">{doc}</div>, [30+21, wid] ]
    default:
        return [ <span className="unknown" />, [0,0] ]
    }
}

function lowerbound(a) {
    return a < 300 ? 300 : a;
}

// This is a top-level component.  Please do not use unless
// the display size is not known beforehand.
// { 'title' : String, 'doc' : {} }
export var Display = React.createClass({
    getInitialState() {
        return ({ // width x height
            winsz:  [window.innerWidth, window.innerHeight].map(lowerbound),
            plan:   planDisplay(this.props.title, this.props.doc)
        });
    },

    updateDimensions() {
        this.setState({ winsz: [window.innerWidth,
                                window.innerHeight].map(lowerbound)
                      });
    },

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions);
    },

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    },

    render() {
        return React.cloneElement(this.state.plan[0],
                                  { winsz: this.state.winsz });
    }
});
