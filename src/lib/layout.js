import { navWidth } from './helpers'
import { GrowingPacker } from './packer'
import { ColLayout } from './packer.cols'

function msort(blocks) {
    const sorts = [
        function (a,b) { return Math.max(b.w, b.h) - Math.max(a.w, a.h); },
        function (a,b) { return Math.min(b.w, b.h) - Math.min(a.w, a.h); },
        function (a,b) { return b.h - a.h; },
        function (a,b) { return b.w - a.w; }
    ]
    blocks.sort(function (a,b) {
      for(var i=0; i<sorts.length; i++) {
        const diff = sorts[i](a,b);
        if (diff != 0)
          return diff;
      }
      return 0;
    })
}

/* Top-level layout algorithms
 * using packer and packer.cols
 */

/* Takes an array of [{plan: planElem, ... }]-s
 * and a maximum window size.
 * Creates a grid layout for it by either
 * adding new properties to each object:
 *          { w: Number, h: Number, x: Number, y: Number }
 * or else moving the object to a 'reject' list,
 *
 *   after adding { w: Number, h: Number }
 *   and sorting the elems by decreasing size.
 */
export function addGrid(elems, sz) {
    elems.forEach(function(it) {
        it.w = it.plan.sz[0]
        it.h = it.plan.sz[1]
    })
    msort(elems)
    let pack = new GrowingPacker(sz[0], sz[1])
    pack.fit(elems)

    let reject = []
    for(var i=0; i<elems.length; i++) {
        let it = elems[i]
        if(it.fit) {
            it.x = it.fit.x
            it.y = it.fit.y
            delete it.fit
        } else {
            reject.push(it)
            elems.splice(i, 1)
            i--
        }
    }

    return reject
}

/* Takes an object containing planElems
 * and creates a column layout for it by
 * adding the folling properties to each planElem:
 * 'name' : {
 *    x: [Number],
 *    y: Number,
 *    w: [Number],
 *    h: Number
 * }
 * (x,y are >= 0 and <= totsz)
 * returns totsz: [width, height]
 */
export function planCols(subs) {
    var blocks = []
    for(var k in subs) {
        const plan = subs[k]
        blocks.push({
            k,
            w: [navWidth(k), plan.sz[0]],
            h: plan.sz[1]
        })
    }
    msort(blocks)
    var pack = new ColLayout(2, 0.8)
    pack.assign(blocks)
    const x = pack.colStarts()

    blocks.forEach(function(block) {
        let plan = subs[block.k]
        plan.x = x[block.fit.col]
        plan.y = block.fit.y
        plan.w = block.w
        plan.h = block.h
    });

    return [pack.wid, pack.ht]
}

