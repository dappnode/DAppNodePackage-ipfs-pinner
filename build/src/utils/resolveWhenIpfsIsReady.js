const ipfs = require("../ipfs");

const pause = ms => new Promise(r => setTimeout(r, ms));

async function resolveWhenIpfsIsReady() {
  /* eslint-disable no-constant-condition */
  while (true) {
    try {
      return await ipfs.id();
    } catch (e) {
      if (e.code === "ENOTFOUND") {
        // Do nothing, wait for the next check
      } else {
        throw e;
      }
    }
    await pause(1000);
  }
  /* eslint-enable no-constant-condition */
}

module.exports = resolveWhenIpfsIsReady;
