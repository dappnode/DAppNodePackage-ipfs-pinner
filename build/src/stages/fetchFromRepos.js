const db = require("../db");
const fetchNewVersionsFromRepo = require("../fetchers/fetchNewVersionsFromRepo");
const fetchManifestHashes = require("../fetchers/fetchManifestHashes");
const isIpfsHash = require("../utils/isIpfsHash");
require("../utils/arrayPrototype");

/**
 * Fetch new versions of repos
 * 1. Collect known repos from the DB, returns: [{
 *   name: "admin.dnp.dappnode.eth",
 *   address: "0x1234abcd..."
 * }, ... ]
 */
async function fetchFromRepos() {
  const repos = db.getRepos();
  console.log(`Fetching new versions from ${repos.length} repos...`);

  await repos.mapAsyncParallel(async repo => {
    try {
      // versions = [{ version: "0.1.4", contentUri: "/ipfs/Qm..." }, ... ]
      const versions = await fetchNewVersionsFromRepo(repo.address);
      await versions.mapAsyncParallel(async ({ version, contentUri }) => {
        try {
          if (isIpfsHash(contentUri)) {
            const hashes = await fetchManifestHashes(contentUri);
            db.addRepoVersion({
              name: repo.name,
              version,
              contentUris: hashes
            });
          } else {
            throw Error(`Unknown content URI "${contentUri}"`);
          }
          console.log(`Fetched new version ${version} of ${repo.name}`);
        } catch (e) {
          console.error(
            `Error on fetchManifestHashes ${repo.name} ${version}: ${e.stack}`
          );
        }
      });
    } catch (e) {
      console.error(
        `Error on fetchNewVersionsFromRepo ${repo.name}: ${e.stack}`
      );
    }
  });
}

module.exports = fetchFromRepos;
