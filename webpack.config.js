module.exports = {
    entry: "./src/main.jsx",
    output: {
        path: __dirname,
        filename: "js/bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" },
            { test: /\.jsx$/, exclude: /node_modules/, loader: "babel-loader" } 
        ]
    }
};
