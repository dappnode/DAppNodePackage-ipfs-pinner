const db = require("./db");
const fetchNewReposFromRegistry = require("./fetchers/fetchNewReposFromRegistry");
const fetchNewVersionsFromRepo = require("./fetchers/fetchNewVersionsFromRepo");
const fetchManifestHashes = require("./fetchers/fetchManifestHashes");
// Utils
const isIpfsHash = require("./utils/isIpfsHash");

/**
 * Calls the async function `fn` on each array item in paralel
 *
 * @param {function} fn async function
 * @param {function} getIdForError function to format the error messages
 */
Object.defineProperty(Array.prototype, "mapAsyncParallel", {
  value: function mapAsyncParallel(fn) {
    return Promise.all(this.map(item => fn(item)));
  }
});

async function registry() {
  /**
   * Fetch new repos
   * 1. Collect known registries form the DB, returns: [{
   *   name: "dnp.dappnode.eth",
   *   address: "0x1234abcd..."
   * }, ... ]
   * 2. Fetch new repos for each registry
   */
  const registries = await db.getRegistries();
  console.log(`Fetching new repos from ${registries.length} registries...`);

  await registries.mapAsyncParallel(async registry => {
    try {
      const repos = await fetchNewReposFromRegistry(registry.address);
      // repos = [{ name: 'livepeer', address: '0x1234abcd', }, ... ]
      for (const { name, address } of repos) {
        console.log(`Fetched new repo ${name}`);
        await db.addRepo({ name, address });
      }
    } catch (e) {
      console.error(
        `Error on fetchNewReposFromRegistry ${registry.name}: ${e.stack}`
      );
    }
  });

  /**
   * Fetch new versions of repos
   * 1. Collect known repos from the DB, returns: [{
   *   name: "admin.dnp.dappnode.eth",
   *   address: "0x1234abcd..."
   * }, ... ]
   */
  const repos = await db.getRepos();
  console.log(`Fetching new version from ${repos.length} repos...`);

  await repos.mapAsyncParallel(async repo => {
    try {
      // versions = [{ version: "0.1.4", contentUri: "/ipfs/Qm..." }, ... ]
      const versions = await fetchNewVersionsFromRepo(repo.address);
      await versions.mapAsyncParallel(async ({ version, contentUri }) => {
        try {
          if (isIpfsHash(contentUri)) {
            const hashes = await fetchManifestHashes(contentUri);
            await db.addRepoVersion({
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

  /**
   * Re-pin everything
   */
  const ipfsHashes = await db.getIpfsHashes();
  ipfsHashes.mapAsyncParallel(({ hash, lastPinned }) => {
    console.log(`pinning ${hash}, lastPinned: ${lastPinned} `);
  });
}

module.exports = registry;
