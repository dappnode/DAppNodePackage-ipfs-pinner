const path = require("path");
module.exports = {
  mode: "production",
  target: "node",
  // entry: {
  //   app: ["src/index.js"]
  // },
  output: {
    path: path.resolve(__dirname),
    filename: "bundle.js"
  }
};
