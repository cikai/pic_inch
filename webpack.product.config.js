var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  devtool: "source-map",
  entry: "./src/js/main.js",
  output: {
    path: "./build",
    filename: "build_[hash].js"
  },
  resolve: {
    // 将js , image , css的路径加入到搜索路径中
    root: [
      path.join(__dirname, "src", "js"),
      path.join(__dirname, "src", "images"),
      path.join(__dirname, "src", "css"),
    ]
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader","css-loader") },
      { test: /\.less$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader") },
      { test: /\.html$/, loader: "html" },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"},
      { test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192'},
      { test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,   loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,    loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,    loader: "url?limit=10000&mimetype=image/svg+xml" }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
        title : 'Vue Test',
        template : 'index_template.html',
        inject : 'body', 
        filename : "index.html"
    }),
    new ExtractTextPlugin("[name]_[hash].css"),

    // 每次build前，清空dist目录
    new CleanWebpackPlugin(["build"], {
        verbose : true
    }),
  ]
}