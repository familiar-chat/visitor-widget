let {DefinePlugin} = require("webpack");
let path           = require("path");

module.exports = {
  entry  : {
    "widget/main.js": [
      "babel-polyfill",
      "familiar-widget-assign/main"
    ],
    "main.js"       : [
      "babel-polyfill",
      "whatwg-fetch",
      "familiar-client/main",
    ]
  },
  module : {
    rules: [
      {
        test: /\.css$/,
        use : [
          {
            loader: "style-loader"
          },
          {
            loader : "css-loader",
            options: {
              modules      : true,
              importLoaders: 1
            }
          },
          {
            loader : "postcss-loader",
            options: {
              plugins: () => [
                require("autoprefixer")
              ]
            }
          }
        ]
      },
      {
        exclude: /node_modules/,
        test   : /\.jsx?$/,
        use    : [
          {
            loader : "babel-loader",
            options: {
              cacheDirectory: true,
              plugins       : [
                "transform-object-rest-spread"
              ],
              presets       : [
                "latest",
                "react"
              ]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new DefinePlugin(
        Object.entries(process.env)
            .map(x => ({["process.env." + x[0]]: JSON.stringify(x[1])}))
            .reduce((x, y) => Object.assign(x, y), {})
    )
  ],
  output : {
    filename  : "[name]",
    path      : path.resolve(__dirname, "build/visitor"),
    publicPath: "/"
  },
  resolve: {
    extensions: [".css", ".js", ".jsx"],
    modules   : ["src", "node_modules"]
  }
}
