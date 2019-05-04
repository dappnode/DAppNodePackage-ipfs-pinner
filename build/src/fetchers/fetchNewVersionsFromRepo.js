const web3 = require("../web3");
const db = require("../db");

/**
 * Get new versions, using the cached last index
 *
 * @param {string} repoAddress
 * @return {array} versions = [{
 *   version: "0.1.4",
 *   contentUri: "/ipfs/Qm..."
 * }, ... ]
 */
async function fetchNewVersionsFromRepo(repoAddress) {
  const repo = web3.repoContract(repoAddress);

  const latestIndex = await repo.getVersionsCount();

  // Cache the lastIndex to avoid repeating fetches for known versions
  let cachedLatestIndex = db.repoLatestIndexCache.get(repoAddress);
  if (cachedLatestIndex) cachedLatestIndex = parseInt(cachedLatestIndex);
  if (latestIndex === cachedLatestIndex) return [];

  /**
   * Versions called by id are ordered in ascending order.
   * The min version = 1 and the latest = versionCount
   *
   *  i | semanticVersion
   * ---|------------------
   *  1 | [ '0', '0', '1' ]
   *  2 | [ '0', '0', '2' ]
   *  3 | [ '0', '0', '3' ]
   *  4 | [ '0', '0', '4' ]
   *
   *  versionIds = [1, 2, 3, 4, 5, ...]
   */
  const versionIds = [];
  for (let i = cachedLatestIndex || 1; i <= latestIndex; i++) {
    versionIds.push(i);
  }

  // Paralelize requests since ethereum clients can hanlde many requests well
  const versions = await Promise.all(
    versionIds.map(async versionId => {
      try {
        const { contentUri, version } = await repo.getVersionById(versionId);
        return { contentUri, version };
      } catch (e) {
        // If you request an inexistent ID to the contract, web3 will throw
        // Error: couldn't decode uint16 from ABI. The try, catch block will catch that
        // and log other errors
        if (String(e).includes("decode uint16 from ABI"))
          console.error("Attempting to fetch an inexistent version");
        else
          console.error(
            `Error getting versions of repo ${repoAddress}: ${e.stack}`
          );
      }
    })
  );

  db.repoLatestIndexCache.set(repoAddress, latestIndex);

  // Filter out versions that returned an error
  return versions.filter(version => version);
}

module.exports = fetchNewVersionsFromRepo;
