const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, options) => ({
  // TODO: Try simplifying to just a single path (app.js)
  // Orig: {app: ['./js/app.js'].concat(glob.sync('./vendor/**/*.js'))}
  entry: './js/app.js',
  module: {
    // Specifies transformation rules for each file type
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          // options: {presets: ["@babel/preset-env", "@babel/preset-react"]},
          query: {presets: ["@babel/preset-react"]}
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, '../priv/static/js')
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({ cache: true, parallel: true, sourceMap: false }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '../css/app.css' }),
    new CopyWebpackPlugin([{ from: 'static/', to: '../' }])
  ],
  // Make sure webpack checks here when looking for modules required by another module
  // (react-phoenix was giving errors until I added this)
  resolve: {
    modules: [path.join(__dirname, "node_modules")]
  }
});
