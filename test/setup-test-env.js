require('babel-register')
require('babel-polyfill')

global.document = require('jsdom').jsdom(' <head> <link rel="stylesheet" type="text/css" href="css/reset.css" /> <link rel="stylesheet" type="text/css" href="css/main.css" /> </head> <body></body>')
global.window = document.defaultView
global.navigator = window.navigator
