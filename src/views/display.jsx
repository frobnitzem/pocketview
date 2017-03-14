import { Tabs } from "./tabs.jsx";
import { Elbow } from "./elbow.jsx";
import { ArrTbl } from "./array.jsx";

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas
               || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

function titleWidth(text) {
    return getTextWidth(text, "bolder 14pt sans-serif");
}
function linkWidth(text) {
    return getTextWidth(text, "12pt Osaka-mono");
}
function labelWidth(text) {
    return getTextWidth(text, "12pt Osaka-mono");
}
function textWidth(text) {
    return getTextWidth(text, "12pt Osaka-mono");
}

function max2(a, b) {
    a[0] = a[0] >= b[0] ? a[0] : b[0];
    a[1] = a[1] >= b[1] ? a[1] : b[1];
}
function add2(a, b) {
    a[0] += b[0];
    a[1] += b[1];
}

function elbow_adj_size(title, children, minsz, totsz, name_width, names) {

    let col1_w = name_width < 60 ? 60 : name_width;
    let col2_w = 25 + titleWidth(title) + 15*2 + 30;

    let row1_h = 120;
    let row2_h = 25 + 30*names + 60;

    let content_pad = [15, 15];

    add2(minsz, content_pad);
    add2(totsz, content_pad);

    max2(minsz, [row2_h, col2_w]);
    max2(totsz, [row2_h, col2_w]);

    add2(minsz, [row1_h, col1_w]);
    add2(totsz, [row1_h, col1_w]);

    var disp = <Elbow title={title} doc={children} csz={[row2_h, col2_w]}
                  winsz={[480,640]}
                  minsz={minsz} totsz={totsz} />
    return [disp, minsz, totsz];
}

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
// for which a 'good' display function exists.
//
// Returns the following:
// [ disp,  // e.g. <ArrTbl  f=id />
//   minsz, // e.g. [ 10, 10 ] -- h x w, minimum to display element
//          // This is actually the size of the largest sub-element
//          // inside the container.
//   totsz  // e.g. [ 40, 60 ] -- preference (also describes req'd area)
// ]

var identity = (x) => { return x; }

// Reactify-s the JSON data by transforming it into
// a display, modeled as a tree of React elements.
function size_up(title, doc) {
    var minsz = [0, 0];
    var totsz = [0, 0];

    switch(realTypeOf(doc)) {
    case "Array":
        //var num = count_arr(doc);
        //if(is_pure(num)) {
        //} 
        let vpad = 10;
        var names = 0;
        var children = [];
        doc.forEach( (u) => {
            names += 1;

            let ret = size_up("", u);
            children.push(ret[0]);
            max2(minsz, ret[1]);
            add2(totsz, ret[2]);
        });
        totsz[0] += 2*vpad;
        minsz[0] += names*2*vpad;
        var disp = <ArrTbl title={title} doc={children} winsz={[480,640]}
                           minsz={minsz} totsz={totsz} fn={identity} /> ;
        return [disp, minsz, totsz];
    case "Object":
        var name_width = 0;
        var names = 0;
        var children = {};
        for(var key in doc) {
            let width = linkWidth(key);
            name_width = width > name_width ? width : name_width;
            names += 1;

            let ret = size_up(key, doc[key])
            children[key] = ret[0];
            max2(minsz, ret[1]);
            add2(totsz, ret[2]);
        }
        return elbow_adj_size(title, children, minsz, totsz, name_width, names);
    case "String":
        if(doc.match(/\n/)) {
            var lines = 0;
            var wid = 0;
            doc.split(/\r?\n/).forEach( (line) => {
                let w = textWidth(line);
                lines += 1;
                wid = wid >= w ? wid : w;
            });
            return [<div className="text"> {doc} </div>,
                     [lines*30, wid], [lines*30, wid]
                   ]
        }
    case "Number":
    case "Boolean":
    case "Null":
        let wid = textWidth(doc) + 15;
        return [<div className="token"> {doc} </div>,
                 [30, wid], [30, wid]
               ]
    default:
        return [ <span className="unknown" />, [0,0], [0,0] ]
    }
}

// This is a top-level component.  Please do not use unless
// the display size is not known beforehand.
// { 'title' : String, 'doc' : {} }
export var Display = React.createClass({
    getInitialState() {
        return ({
            winsz:  [480, 640], // height x width
            doc:    size_up(this.props.title, this.props.doc)
        });
    },

    updateDimensions() {
        let width  = window.innerWidth  < 450 ? 450 : window.innerWidth;
        let height = window.innerHeight < 450 ? 450 : window.innerHeight;
        this.setState({ winsz: [height - height%10, width - width%10] });
        console.log("New Display State: ", this.state);
    },

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions);
    },

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    },

    render() {
        return React.cloneElement(this.state.doc[0],
                                  { winsz: this.state.winsz });
    }
});
