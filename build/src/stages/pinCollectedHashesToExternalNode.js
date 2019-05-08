const db = require("../db");
const ipfsFactory = require("../ipfs");
const isIpfsHash = require("../utils/isIpfsHash");
require("../utils/arrayPrototype");

/**
 * Re-pin already pinned hashes to an external node
 * @param {string} apiUrl
 */
async function pinCollectedHashesToExternalNode(apiUrl) {
  // Dynamically import IPFS
  const ipfs = ipfsFactory(apiUrl, { concurrency: 4 });

  const ipfsHashes = db.getReposPinnedAssets();

  await ipfsHashes.mapAsyncParallel(async ({ name, version, asset, hash }) => {
    const id =
      `(on ${apiUrl})` +
      [apiUrl, name, version, asset.replace("Hash", ""), apiUrl].join(" ");
    try {
      if (!isIpfsHash(hash)) throw Error(`Invalid IPFS hash: "${hash}"`);
      console.log(`Pinning ${id} at ${hash}...`);
      await ipfs.pinAdd(hash);
      console.log(`Pinned ${id} at ${hash}`);
    } catch (e) {
      // If the error is a timeout, the stack is useless
      const message = e.message || "";
      const error =
        message.includes("Timeout") || message.includes("not available")
          ? e.message
          : e.stack;
      console.error(`Error pinning ${id}: ${error}`);
    }
  });
}

module.exports = pinCollectedHashesToExternalNode;
