const shell = require("./shell");

async function cleanDb() {
  await shell(`rm -rf ${process.env.DB_PATH}`);
}

module.exports = cleanDb;
