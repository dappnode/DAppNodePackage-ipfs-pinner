const db = require("../db");
const fetchNewReposFromRegistry = require("../fetchers/fetchNewReposFromRegistry");
require("../utils/arrayPrototype");

/**
 * Fetch new repos
 * 1. Collect known registries form the DB, returns: [{
 *   name: "dnp.dappnode.eth",
 *   address: "0x1234abcd..."
 * }, ... ]
 * 2. Fetch new repos for each registry
 */
async function fetchFromRegistries() {
  const registries = db.getRegistries();
  console.log(`Fetching new repos from ${registries.length} registries...`);

  await registries.mapAsyncParallel(async registry => {
    try {
      const repos = await fetchNewReposFromRegistry(registry.address);
      // repos = [{ name: 'livepeer', address: '0x1234abcd', }, ... ]
      for (const { name, address } of repos) {
        console.log(`Fetched new repo ${name}`);
        db.addRepo({ name: [name, registry.name].join("."), address });
      }
    } catch (e) {
      console.error(
        `Error on fetchNewReposFromRegistry ${registry.name}: ${e.stack}`
      );
    }
  });
}

module.exports = fetchFromRegistries;
