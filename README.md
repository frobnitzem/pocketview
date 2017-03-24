# Pocket JSON Viewer

A clean viewer for hierarchical data trees.

Assumptions and Design Principles
---------------------------------

1. All content display is of a digraph.
2. Parent nodes may contain links to display children,
   but the parent nodes must either remain intact
   or become minified on click.
   - at present, only one main 'nav' element selects
     children.
3. There are a few catch-all displays for JSON objects/arrays:
  - wrap-left nav (upside-down L shape)
  - capsule header / horizontal nav
  - table format (for regular arrays)
  - box text / graphics / video
    - must be able to control "current location" in these elements
    - currently uses browser scrollbars
    - can rely on initial doc. size to decide display size
      during planning phase
4. Additional specialized displays will be added based on content
   analysis -- e.g. highly structured JSON objects, base64 images, etc.
5. All text is styled by content type, independent of its place
   in the hierarchy.
6. Some updates to the underlying data model may occur,
   but should be relatively uncommon (mostly at top-level).
7. On the calculation of object sizes:
   - Each object may 'wrap' others, which are treated
     as a collection of boxes.
   - The key number for each is the amount of height x width
     taken up by the wrapper itself.
   - This is a fixed constant for the display type used.
     => Every display must be able to calculate this!
   - The default behavior for displays is to show
     all included data if they can do so.
     "sz" is the size of the fully displayed version.
   - Top-level displays include a clickable title bar,
     so every element must also calculate "tsz",
     which is the size of the element plus its title bar.

Display Process
-------------------

Step 1: Traverse the data and use a bottom-up
        sweep to calculate 'immediate' display size.
  - This is the size necessary to display the node
    in its entirety.
  - Special styling for recognizable elements (e.g.
    images or molecular models) can be added here.

Step 2: Set up a redux store to hold a database
        of display elements.  Show a nav and a grid.

Step 3: Every element can be displayed in one of 2 ways:
  a) display the element in its entirety (with a selectable title)
  b) if the item is an array or object that doesn't fit,
     move 'forward' into the object. (see reducers/views.js:forward())
  Therefore, step 3 uses 'GrowingPacker' to put as many
  items as possible in the display space, and sends the rest to the nav,
  where they can be selected for display later.

Step 4: Respond to resize or load events to calculate new plans
        and update the display on special events.


Stack
-----

- Babel
- React
- Redux
- Ava
- Enzyme
- Webpack
- [Bin-Packing](https://github.com/jakesgordon/bin-packing)
- [Typeset](https://github.com/bramstein/typeset)
- SCSS


Quick Start
-----------

```shell
$ git clone https://github.com/frobnitzem/pocketview
$ cd pocketview
$ npm install --save-dev
$ webpack
```


TODO
----

There are many quirks that can (and should) be fixed by
additional development effort.

# The capsule display of titles (views/title.js) should fill the entire horizontal row to make reading clearer!  This requires manually adding the capsule::after div rather than using the default in `css/_capsule.scss`
# The header display of `views/arch.js` should actually look like an arch.  My canvas code had an error, so I scrapped it for now.
# The 'err' morse code message in audio/err.wav could sound a lot better.
# The dynamic resize code in `containers/Resizable.js` should take over the `planDisplay+createStore+render` functions currently at the end of `index.js`.
# Planning sizes can be short-cut when the element size is clearly too large, just by always returning something large like `gridsz*2`.
# The `containers/Nav.js` element should scroll right.  Check out react/canvas
# Overflowing titles / names should be truncated with dots. Some new function in `lib/helpers.js` should do it.
# The top-level demo should add a function to retrieve JSON data from API-s.
# Eventually, incremental size calculation would be nice (but violates the current code organization assumptions).
# More view helpers should be added for special data
## Images in base64-encoding should be easy.
## An amazing plugin library for molecules is at: https://web.chemdoodle.com/tutorial/loading-data/
## This requires detecting which strings contain molfile/pdb data.  A robust solution that also would handle code syntax highlighting could be based on (and use) www.github.com/octocat/linguist


