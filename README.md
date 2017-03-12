# Pocket JSON Viewer

A clean viewer for hierarchical data trees.

Assumptions and Design Principles
---------------------------------

1. All content display is of a digraph.
2. Parent nodes may contain links to display children,
   but the parent nodes must either remain intact
   or become minified on click.
3. There are a few catch-all displays for JSON objects/arrays:
  - wrap-left nav (upside-down L shape)
  - capsule header / horizontal nav
  - table format (for regular arrays)
  - box text / graphics / video
    - must be able to control "current location" in these elements
4. Additional specialized displays will be added based on content
   analysis -- e.g. highly structured JSON objects, base64 images, etc.
5. All text is styled by content type, independent of its place
   in the hierarchy.
6. Some updates to the underlying data model may occur,
   but should be relatively uncommon (mostly at top-level).

Example data structure:
 { 'nav1' : { ... },
   'nav2' : "text",
   'nav3' : { ... },
 }

Development Process
-------------------

Step 1: determine display class by 'depth' of data.
  - no sub-dirs => display immediately
  - some sub-dirs => display with right-area for pop-out
  - all sub-dirs => display with menu
  - mostly sub-dirs => menu + capsule

Step 2: render data into designated div
  - one function per display class

Step 3: respond to links requesting re-display of child data
  - this is done within React

Step 4: detect 'out of space' condition
  - need clever way to minify parents when
    the condition is called anywhere
  - Preferred solution = pass-down available width x height
    as discussed by 
    [Daniel Iwaniuk](https://www.hawatel.com/blog/handle-window-resize-in-react).

Step 5: add special styling for errors / warnings
     and components that change/update the page json
     or send json of current data element elsewhere


Stack
-----

- React
- Babel
- Webpack


Quick Start
-----------

```shell
$ git clone https://github.com/frobnitzem/pocketview
$ cd pocketview
$ webpack
```

Contributors
------------

Original inspiration for css styling from
[Leathan Lund](http://www.king-con.com/sto/console/).

