const fs = require("fs");
const path = require("path");

function ensureDir(_path) {
  const dir = path.parse(_path).dir;
  fs.mkdirSync(dir, { recursive: true });
}

module.exports = ensureDir;
