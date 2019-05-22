
const Path = require("path");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const BuildVars = require("../../build/vars.json");


module.exports = (env, argv) => {
  const out = {
    entry: {
      app_header: "./src/header/Header.tsx",
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            // {
            //   loader: "cache-loader",
            // },
            {
              loader: "ts-loader",
              options: {
                configFile: "tsconfig.json",
                transpileOnly: true,
                experimentalWatchApi: true,
              },
            },
          ],
        },
        {
          test: /\.(scss)$/,
          use: [
            // {
            //   loader: "cache-loader",
            // },
            // {
            //   loader: MiniCssExtractPlugin.loader,
            // },
            {
              loader: 'css-loader', // translates CSS into CommonJS modules
            },
            {
              loader: 'sass-loader' // compiles Sass to CSS
            }
          ],
        },
        {
          test: /.*\.(gif|png|jpe?g|svg)$/i,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        }
      ],
    },
    output: {
      filename: "[name].min.js",
      // restore this setting when venezuela can deduce the latest cache_name
      path: Path.resolve(__dirname, "../../build/", BuildVars.cache_name)
      // path: Path.resolve(__dirname, "../assets/webpack"),
    },
    performance: {
      maxAssetSize: 400000,
      maxEntrypointSize: 600000,
    },
    plugins: [
    ],
    resolve: {
      extensions: [ ".tsx", ".ts", ".js", ".json", ".scss" ]
    },
  };

  if (argv.mode === "production") {
    out.devtool = "source-map";
    out.plugins.push(new UglifyJSPlugin({
      cache: true,
      parallel: true,
      sourceMap: true,
    }));
  } else {
    out.devtool = "inline-source-map";
    // out.devServer = {
    //   contentBase: "./",
    //   port: 8081,
    // };
  }
  return out;
}
