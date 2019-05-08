const db = require("../db");
const ipfs = require("../ipfs")();
const getPublicGateways = require("../utils/getPublicGateways");
require("../utils/arrayPrototype");

/**
 * - Collects all fetched repo's assets but only for:
 *   - Already pinned and available hashes
 *   - The latest available version
 * - Collects a list of available and active gateways
 * - Queries every single gateway to download each asset
 */
async function triggerPublicGateways() {
  const assets = db.getReposLatestVersionPinnedAssets();

  // gateways = ["https://gateway.ipfs.io/ipfs/", ... ]
  const gateways = await getPublicGateways();

  await assets.mapAsyncParallel(({ name, version, asset, hash }) =>
    gateways.mapAsyncParallel(async gateway => {
      const id = [name, version, asset.replace("Hash", "")].join(" ");
      try {
        const url = gateway + hash.replace("/ipfs/", "");
        await ipfs.addFromUrl(url);
      } catch (e) {
        console.error(`Error on public gateway ${gateway} - ${id}: ${e.stack}`);
      }
      console.log(`Triggered public gateways for ${id}`);
    })
  );
}

module.exports = triggerPublicGateways;
