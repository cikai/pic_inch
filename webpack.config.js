var path = require("path");

module.exports = {
  devtool: "source-map",
  entry: "./src/main.js",
  output: {
    path: "./build",
    publicPath: "http://localhost:9090/build",
    filename: "build.js"
  },
  resolve: {
    // 将js , image , css的路径加入到搜索路径中
    root: [
      path.join(__dirname, "src", "js"),
      path.join(__dirname, "src", "images"),
      path.join(__dirname, "src", "css"),
    ],
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style!css" },
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.html$/, loader: "html" },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
      { test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192'},
      { test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,   loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&mimetype=image/svg+xml" }
    ]
  }
}