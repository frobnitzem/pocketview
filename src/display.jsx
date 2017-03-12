import { Tabs } from "./views/tabs.jsx";
import { Elbow } from "./views/elbow.jsx";

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

// assumes doc : {}
function count_vals(doc) {
    var num = { "array" : 0, "object" : 0, "token" : 0,
                "text"  : 0, "other" : 0 };
    for(var key in doc) {
        var u = doc[key];
        switch(realTypeOf(u)) {
        case "Array":
            num.array += 1;
            break;
        case "Object":
            num.object += 1;
            break;
        case "String":
            if(u.length > 400) {
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
}

// TODO: add more display types and use count_vals to
// decide whether to use tabs or "just show" the data.
// must return a React class instance.
export function Display(title, doc) {
    switch(realTypeOf(doc)) {
    case "Array":
        return React.createElement('div', { className:"array" },
                                   doc.map(Display));
    case "Object":
        return ( <Elbow title={title} doc={doc} /> );
    case "String":
        if(doc.length > 400) {
            return React.createElement('div', { className:"text" }, doc);
        }
    case "Number":
    case "Boolean":
    case "Null":
        return React.createElement('span', { className:"token" }, doc);
    default:
        return React.createElement('span', { className:"token" }, doc);
    }
}

