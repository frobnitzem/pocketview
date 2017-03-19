
site: js/bundle.js css/main.css
	echo "Done"

js/bundle.js:	src/*.js src/*.js src/views/*.js
	./node_modules/webpack/bin/webpack.js

css/main.css:	css/main.scss
	sass css/main.scss css/main.css
