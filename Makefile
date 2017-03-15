
site: js/bundle.js css/main.css
	echo "Done"

js/bundle.js:	src/*.js src/*.jsx src/views/*.jsx
	./node_modules/webpack/bin/webpack.js

css/main.css:	css/main.scss
	sass css/main.scss css/main.css
