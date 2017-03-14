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
