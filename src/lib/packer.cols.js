/******************************************************************************

This is a column layout algorithm that positions
blocks within columns to achieve a ratio as
close to the input as possible.

Each object has a single height and multiple widths,
representing vertical divisions within a column.
This is to accomodate columns within columns --
for example titles on the left and items on the right.

Best results occur when the input blocks are sorted by height, or even better
when sorted by max(width,height).

Inputs:
------

    n : number of sub-columns within each column
    r : target ratio of width per height
    blocks: [ {
                h: Number,
                w: [ Number ] -- w.length === n (const. for all blocks)
            } ]
      

Outputs:
-------

  col_widths : [ [ Number] ]
          -- Widths of each sub-column.
          col_widths.length === number of columns
          col_widths[i].length === n

  marks each block that fits with a .fit attribute containing
  { col : Int, -- assigned column number (index of col_widths)
    y   : Number -- vertical position of top of block
  }

Example:
-------

  var blocks = [
    { w: [100], h: 100 },
    { w: [100], h: 100 },
    { w: [ 80], h:  80 },
    { w: [ 80], h:  80 },
    { w: [ 98], h:  59 },
    { w: [102], h:  44 }
  ];

  var layout = new ColLayout(1, 1.381); // input is desired width / height
  layout.assign(blocks);

  const x = layout.colStarts();

  blocks.forEach(function(block) {
      Draw(x[block.fit.col][0], block.fit.y, block.w[0], block.h);
  });


******************************************************************************/

// given:
//   [starting widths]
//   [new widths]
// returns
//  - sum of empty widths
//  - sum of expansion widths
function maxExpand(w1, w2) {
    var ret = [0,0];
    for(var i=0; i<w1.length; i++) {
        if(w1[i] >= w2[i]) // empty
            ret[0] += w1[i] - w2[i];
        else // expand
            ret[1] += w2[i] - w1[i];
    }
    return ret;
}

// Area of perfect enclosing rect.
function area(r, w,h) {
    return w < r*h ? r*h*h : w*w/r;
}

ColLayout = function(n, r) {
    this.init(n, r);
};

ColLayout.prototype = {
  // Internally, this function always
  // maintains an "empty" last column.
  init: function(n, r) {
    this.wid = 0;
    this.ht  = 0;
    this.cols = [ Array(n).fill(0) ];
    this.n = n;
    this.r = r;
    this.vert = [ 0 ]; // vert. space used within ea. col.
  },

  assign: function(blocks) {
    blocks.forEach(this.add.bind(this));
  },

  // Calculate the increase in 'empty' space,
  // given by this placement.
  // The formula is always Delta A - w*h.
  //
  // However, we also add permanently 'lost' space
  // due to expansion / unrealized contraction of widths.
  cost: function(i, w, h) {
      const expand = maxExpand(this.cols[i], w);
      const wid = this.wid + expand[1]; // final total width
      let ht = h + this.vert[i];
      ht = ht < this.ht ? this.ht : ht; // final total height
      const A = area(this.r, wid, ht); // old area + diff. in area

      // Double-count permanently 'lost' space.
      return A + h*expand[0] + this.vert[i]*expand[1];
  },

  // Determine 'best' column based
  // on the internal cost function :
  // (col#, w, h) => penalty
  //
  // It does not modify the state.
  findBest: function(w, h) {
      let best = Infinity, col=0;
      const _this = this;
      this.cols.forEach(function(wid, i) {
          const c = _this.cost(i, w, h);
          if(c < best) {
              best = c;
              col = i;
          }
      });
      return col;
  },

  // add the given block
  add: function(block) {
      const col = this.findBest(block.w, block.h);

      block.fit = { col, y: this.vert[col] };

      if(col === this.cols.length-1) {
          this.cols.push(Array(this.n).fill(0)); // new empty col.
          this.vert.push(0);
      }

      // Update dimensions.
      let expand = 0; // total width expansion
      for(var i=0; i<this.n; i++) {
          const delta = block.w[i] - this.cols[col][i];
          if(delta > 0) {
              expand += delta;
              this.cols[col][i] += delta;
          }
      }
      this.wid += expand;
      this.vert[col] += block.h;
      this.ht = Math.max(this.ht, this.vert[col]);
  },

  colStarts: function() {
      let x0 = 0.0;
      let x = [];

      this.cols.forEach(function(wid) {
          let x1 = [];
          wid.forEach(function(w) {
             x1.push(x0);
             x0 += w;
          });
          x.push(x1);
      });
      return x;
  }
}

