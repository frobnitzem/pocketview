require('babel-register')
require('babel-polyfill')

global.document = require('jsdom').jsdom(' <head> <link rel="stylesheet" type="text/css" href="css/reset.css" /> <link rel="stylesheet" type="text/css" href="css/main.css" /> </head> <body></body>')
global.window = document.defaultView
global.navigator = window.navigator

global.isPlanElem = function (t, plan) {
  t.true(plan.hasOwnProperty('elem'))
  t.true(plan.hasOwnProperty('sz'))
  t.true(plan.hasOwnProperty('path'))
  t.true(plan.path.length >= 0)
  t.is(plan.sz.length, 2)
}

