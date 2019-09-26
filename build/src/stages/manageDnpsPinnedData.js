const getRepoVersionAssetsToPinAndUnpin = require("../db/methods/getRepoVersionAssetsToPinAndUnpin");
const db = require("../db");
const ipfs = require("../ipfs");
const isIpfsHash = require("../utils/isIpfsHash");
require("../utils/arrayPrototype");

/**
 * 1. Aggregate list of IPFS hashes that should be pinned:
 *    - 3 versions below latest of all DNPs
 * 2. Aggregate list of IPFS hashes that should NOT be pinned:
 *    - rest of versions
 * 3. Contrast both lists with the current pin list and execute
 */

async function manageDnpsPinnedData() {
  // Compute the assets to pin and unpin
  const { assetsToPin, assetsToUnpin } = getRepoVersionAssetsToPinAndUnpin();

  // Fetch the current pinned state
  const alreadyPinned = await ipfs.pinList({ type: "recursive" }).catch(e => {
    console.error(`Error fetching already pinned content: ${e.stack}`);
    return {};
  });
  const isAlreadyPinned = hash => alreadyPinned[hash.replace("/ipfs/", "")];

  // Pin assets
  for (const [action, assets] of [
    ["pin", assetsToPin],
    ["unpin", assetsToUnpin]
  ]) {
    await assets.mapAsyncParallel(async ({ hash, name, version, asset }) => {
      const id = [name, version, asset].join(" ");
      try {
        if (!isIpfsHash(hash)) throw Error(`Invalid IPFS hash: "${hash}"`);
        if (action === "pin") {
          if (!isAlreadyPinned(hash)) {
            await ipfs.pinAdd(hash);
            console.log(`Pinned ${id} at ${hash}`);
          }
          db.updatePinStatus.justPinned(hash);
        } else {
          if (isAlreadyPinned(hash)) {
            await ipfs.pinRemove(hash);
            console.log(`Unpinned ${id} at ${hash}`);
          }
        }
      } catch (e) {
        // If the error is a timeout, the stack is useless
        const message = e.message || "";
        const error =
          message.includes("Timeout") || message.includes("not available")
            ? e.message
            : e.stack;
        console.error(`Error ${action}ning ${id}: ${error}`);
      }
    });
  }
}

module.exports = manageDnpsPinnedData;
