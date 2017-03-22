import { renderToStaticMarkup } from 'react-dom/server';

export const capsule_wid = 13*2;
export const margin = [5*2, 5*2];
export const title_ht = 32;
export const line_ht = 31;

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

/* This is useless because even the same HTML can be
 * rendered with different sizes!!! */
export function getSize(cpt) {
    var elem = getSize.elem;
    if(!elem) {
        elem = document.createElement("div");
        elem.style.visibility = 'hidden';
        elem.style.position = 'absolute';
        elem.style.top = '-8000px';
        elem.style.left = '-8000px';
        elem.width = 'auto';
        elem.style.display = 'inline';
        getSize.elem = elem;
    }
    elem.innerHTML = renderToStaticMarkup(cpt);
    const sz = [elem.scrollWidth, elem.scrollHeight];
    elem.innerHTML = "";
    return sz;
}

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas
               || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    return context.measureText(text).width;
}

export function titleSize(text) {
    var tsz = [getTextWidth(text, "20pt FinalNew, serif")
                        +margin[0]+capsule_wid,
               title_ht];
    add2(tsz, margin);
    return tsz;
}
export function linkWidth(text) {
    return getTextWidth(text, "14pt Osaka") + margin[0];
}
export function navWidth(text) {
    return getTextWidth(text, "14pt Osaka") + margin[0];
}
export function textWidth(text) {
    return getTextWidth(text, "14pt Osaka");
}
export function textSize(text) {
    return [textWidth(text), line_ht];
}

export function max2(a, b) {
    a[0] = a[0] >= b[0] ? a[0] : b[0];
    a[1] = a[1] >= b[1] ? a[1] : b[1];
}

export function add2(a, b) {
    a[0] += b[0];
    a[1] += b[1];
}

