import React from 'react'

import { textWidth } from "../lib/helpers"
import { planText } from "./text"
import { planToken } from "./token"
import { planArch } from "./arch"
import { planArray } from "./array"

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

function tokey(path) {
    return path.join(".");
}

// Reactify-s the JSON data by transforming it into
// a display, modeled as a tree of React elements.
//
// Calculate display attributes for each leaf node
// assuming it can be rendered in its entirety.
//
// Returns an object of type planElem
export function planDisplay(path, doc) {
    switch(realTypeOf(doc)) {
    case "Array":
        return planArray(path, doc);
    case "Object":
        return planArch(path, doc);
    case "String":
        if(doc.length > 30 || doc.match(/\r?\n/)) {
            return planText(path, doc)
        }
    case "Number":
    case "Boolean":
    case "Null":
        return planToken(path, doc)
    default:
        return { elem: <span key={tokey(path)} className="unknown" />,
                 sz: [0,0],
                 path: path
               }
    }
}

