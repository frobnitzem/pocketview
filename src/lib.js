export function toggleSorted(array, value) {
    var start = 0;
    var end = array.length;
    
    while(start < end) {
        let m = start + Math.floor((end - start)/2);
        
        if(value < array[m]) {
            end = m;
        } else if(value == array[m]) {
            array.splice(m, 1); // delete element
            return;
        } else {
            start = m+1;
        }
    }
    array.splice(start, 0, value);
}

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas
               || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

export function titleWidth(text) {
    return getTextWidth(text, "20pt FinalNew")+10;
}
export function linkWidth(text) {
    return getTextWidth(text, "12pt Osaka-mono"+10);
}
export function textWidth(text) {
    return getTextWidth(text, "12pt Osaka-mono");
}

export function max2(a, b) {
    a[0] = a[0] >= b[0] ? a[0] : b[0];
    a[1] = a[1] >= b[1] ? a[1] : b[1];
}

export function add2(a, b) {
    a[0] += b[0];
    a[1] += b[1];
}

