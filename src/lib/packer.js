/******************************************************************************

Source: https://github.com/jakesgordon/bin-packing
[jake@codeincomplete.com](mailto:jake@codeincomplete.com)
[Code inComplete](http://codeincomplete.com/posts/2011/5/7/bin_packing/)

Copyright (c) 2011, 2012, 2013, 2014, 2015, 2016 Jake Gordon and contributors.
This file is released under the MIT license.

This is a binary tree based bin packing algorithm that is more complex than
the simple Packer (packer.js).  It makes fewer cuts by leaving open space
between the already-cut (and allocated) areas and the maximum container
size.  Instead of starting off with a fixed width and
height, the cutting area starts with the width and height of the
first block passed and then grows into the unallocated space
as necessary to accomodate each subsequent block.
When it needs to grow, it puts the new block on the side that makes
the final dimensions closest to the proportions of the enclosing area.

The algorithm can grow eigher right OR down as size permits.

Best results occur when the input blocks are sorted by height, or even better
when sorted by max(width,height).

Inputs:
------

  blocks: array of any objects that have .w and .h attributes

Outputs:
-------

  marks each block that fits with a .fit attribute pointing to a
  node with .x and .y coordinates

Example:
-------

  var blocks = [
    { w: 100, h: 100 },
    { w: 100, h: 100 },
    { w:  80, h:  80 },
    { w:  80, h:  80 },
    etc
    etc
  ];

  // For essentially unbounded area:
  var packer = new GrowingPacker(10000, 10000);
  packer.fit(blocks);

  for(var n = 0 ; n < blocks.length ; n++) {
    var block = blocks[n];
    if (block.fit) {
      Draw(block.fit.x, block.fit.y, block.w, block.h);
    }
  }


******************************************************************************/

export var GrowingPacker = function(w, h) {
  this.init(w, h);
};

GrowingPacker.prototype = {

  init: function(w, h) {
    //console.log("avail: " + w+" x "+h);
    this.maxw = w;
    this.maxh = h;
    this.root = { x: 0, y: 0, w: 0, h: 0 };
  },


  fit: function(blocks) {
    blocks.forEach(this.add.bind(this));
  },

  add: function(block) {
    const node = this.findNode(this.root, block.w, block.h);
    if (node)
      block.fit = this.splitNode(node, block.w, block.h);
    else
      block.fit = this.grow(block.w, block.h);
  },

  findNode: function(root, w, h) {
    if(w > root.w || h > root.h) // early search termination
      return null;
    if(root.used)
      return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);

    return root;
  },

  splitNode: function(node, w, h) {
    node.used = true;
    node.down  = { x: node.x,     y: node.y + h, w: node.w,     h: node.h - h };
    node.right = { x: node.x + w, y: node.y,     w: node.w - w, h: h          };
    return node;
  },

  grow: function(w, h) {
    const rem_w = this.maxw - (this.root.w + w),
          rem_h = this.maxh - (this.root.h + h);
    var canGrowRight = rem_w >= 0 && h <= this.maxh;
    var canGrowDown  = rem_h >= 0 && w <= this.maxw;

    var shouldGrowRight = canGrowRight && (rem_w >= rem_h);
    var shouldGrowDown  = canGrowDown  && (rem_w <= rem_h);


    if (shouldGrowRight)
      return this.growRight(w, h);
    else if (shouldGrowDown)
      return this.growDown(w, h);
    else if (canGrowRight)
     return this.growRight(w, h);
    else if (canGrowDown)
      return this.growDown(w, h);
    else
      return null;
  },

  growRight: function(w, h) {
    this.root = {
      used: true,
      x: this.root.w,
      y: 0,
      w: this.root.w + w,
      h: this.root.h,
      right: this.root, // really left
      down: { x: this.root.w, y: h, w: w, h: this.root.h-h }
    };
    if(h > this.root.h) { // grow both directions
        this.root.down = { x: 0, y: this.root.h,
                           w: this.root.w - w,
                           h: h - this.root.h };
        this.root.h = h;
    }
    //console.log(this.root.w+ " x " + this.root.h);
    return this.root;
  },

  growDown: function(w, h) {
    this.root = {
      used: true,
      x: 0,
      y: this.root.h,
      w: this.root.w,
      h: this.root.h + h,
      right:  { x: w, y: this.root.h, w: this.root.w - w, h: h },
      down: this.root // really up
    };
    if(w > this.root.w) {
        this.root.right = { x: this.root.w, y: 0,
                            w: w - this.root.w,
                            h: this.root.h-h };
        this.root.w = w;
    }
    //console.log(this.root.w+ " x " + this.root.h);
    return this.root;
  }

}


