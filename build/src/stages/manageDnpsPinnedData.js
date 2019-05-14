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

  // Log current pinData. Will not log if data is the same. Wrapped in try / catch
  await logPinData({ assetsToPin, assetsToUnpin, isAlreadyPinned });

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

let cacheInfoId = "";
async function logPinData({ assetsToPin, assetsToUnpin, isAlreadyPinned }) {
  /**
   * Informative data
   * Wrap non-essential logging in try / catch for safety
   */
  try {
    const assetsToPinPinned = assetsToPin.filter(({ hash }) =>
      isAlreadyPinned(hash)
    );
    const assetsToUnpinUnpinned = assetsToUnpin.filter(
      ({ hash }) => !isAlreadyPinned(hash)
    );
    const percent = (a, b) => (b ? ((100 * a) / b).toFixed(2) + "%" : "-");

    /**
     * ipfs.repoStats returns {
     *   size: 4223045026,
     *   maxSize: 50000000000
     * }
     */
    const repo = await ipfs.repoStats({ human: true });

    /**
     * Cache this data to prevent repetitive logging
     * If the variables don't change, don't log stats
     */
    const infoId = JSON.stringify({
      assetsToPin,
      assetsToUnpin,
      assetsToPinPinned,
      assetsToUnpinUnpinned,
      repo
    });
    if (cacheInfoId === infoId) return;
    else cacheInfoId = infoId;

    console.log(`
  Current repo size: ${repo.size} (max: ${repo.maxSize})
  Current assets stats:`);
    console.table({
      "to pin": {
        total: assetsToPin.length,
        done: assetsToPinPinned.length,
        percent: percent(assetsToPinPinned.length, assetsToPin.length)
      },
      "to unpin": {
        total: assetsToUnpin.length,
        done: assetsToUnpinUnpinned.length,
        percent: percent(assetsToUnpinUnpinned.length, assetsToUnpin.length)
      }
    });
  } catch (e) {
    console.error(`Error reporting pin stats: ${e.stack}`);
  }
}

module.exports = manageDnpsPinnedData;
