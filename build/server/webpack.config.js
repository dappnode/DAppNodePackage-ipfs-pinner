const path = require("path");
const { NODE_ENV = "production" } = process.env;
module.exports = {
  entry: "./src/index.ts",
  mode: NODE_ENV,
  target: "node",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "index.js"
  },
  optimization: {
    // Minimizing reduces file size 6MB -> 3MB. Not worth it to lose debuggability
    minimize: false
  },
  // externals: [/node_modules/, "bufferutil", "utf-8-validate"],
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"]
      }
    ]
  },
  devtool: "source-map"
};
