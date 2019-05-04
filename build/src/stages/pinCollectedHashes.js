const db = require("../db");
const ipfs = require("../ipfs");

require("../utils/arrayPrototype");

/**
 * Re-pin everything
 *
 * ipfs.pinList returns [{
 *   hash: 'QmNMCAWCc1EAfQ7BdVfpH9HnV1W9FiP9ztdAU3bDioiWCw',
 *   type: 'recursive'
 * }, ... ]
 */
async function pinCollectedHashes() {
  const alreadyPinned = await ipfs.pinList({ type: "recursive" }).catch(e => {
    console.error(`Error fetching already pinned content: ${e.stack}`);
    return {};
  });
  const ipfsHashes = db.getIpfsHashes();
  const isAlreadyPinned = hash => alreadyPinned[hash.replace("/ipfs/", "")];

  /**
   * Informative data
   * Wrap non-essential logging in try / catch for safety
   */
  try {
    // #### TODO: Cache this data to prevent repetitive logging
    // If the variables don't change, don't log stats
    const totalCount = ipfsHashes.length;
    const pinnedCount = ipfsHashes.filter(({ hash }) => isAlreadyPinned(hash))
      .length;
    const notInGithubCount = ipfsHashes.filter(({ notInGithub }) => notInGithub)
      .length;
    const percent = count =>
      totalCount ? ((100 * count) / totalCount).toFixed(2) + "%" : "-";

    /**
     * ipfs.repoStats returns {
     *   size: 4223045026,
     *   maxSize: 50000000000
     * }
     */
    const repo = await ipfs.repoStats({ human: true });

    console.log(`
  Current repo size: ${repo.size} (max: ${repo.maxSize})
  Current assets stats:`);
    console.table(
      [
        { id: "pinned", count: pinnedCount },
        {
          id: "not pinned",
          count: totalCount - pinnedCount - notInGithubCount
        },
        { id: "not pinned & not on github", count: notInGithubCount }
      ].reduce((obj, { count, id }) => {
        return { ...obj, [id]: { count, percent: percent(count) } };
      }, {})
    );
    console.log(`Pinning ${totalCount - pinnedCount} hashes...`);
  } catch (e) {
    console.error(`Error reporting pin stats: ${e.stack}`);
  }

  await ipfsHashes.mapAsyncParallel(async ({ name, version, asset, hash }) => {
    const id = [name, version, asset.replace("Hash", "")].join(" ");
    try {
      if (!isAlreadyPinned(hash)) {
        await ipfs.pinAdd(hash);
        console.log(`Pinned hash ${hash}`);
      }
      db.updatePinStatus.justPinned(hash);
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

module.exports = pinCollectedHashes;
