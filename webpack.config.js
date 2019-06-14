const CopyWebpackPlugin = require("copy-webpack-plugin");

const pathHelpers = require("path");

// Expect `__dirname` to be `/`.
const ROOT_PATH = pathHelpers.resolve(__dirname);
const TARGET_PATH = pathHelpers.join(ROOT_PATH, "./target/");
const SRC_PATH = pathHelpers.join(ROOT_PATH, "./src/");

const ENTRY_FILENAME = "index.tsx";
const OUTPUT_FILENAME = "index.js";

const RESOLVED_EXTENSIONS = [
  // start defaults
  ".js",
  ".json",
  // end defaults
  ".ts",
  ".tsx"
];

const config = {
  mode: "development",
  devtool: "eval-source-map",
  entry: pathHelpers.resolve(SRC_PATH, ENTRY_FILENAME),
  output: {
    path: TARGET_PATH,
    filename: OUTPUT_FILENAME
  },
  resolve: {
    extensions: RESOLVED_EXTENSIONS
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: "ts-loader" }]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: pathHelpers.resolve(SRC_PATH, "./index.html"), to: "index.html" }
    ])
  ]
};

module.exports = config;
