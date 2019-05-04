const wrapDb = require("./dbWrap");
const db = wrapDb(require("level")(process.env.DB_PATH || "./pin-data-db"));

const REGISTRY_ENTRY_PREFIX = "entry-registry-";
const REPO_ENTRY_PREFIX = "entry-repo-";
const REPO_VERSION_PREFIX = "entry-version-";
// Caches
const REGISTRY_LATEST_BLOCK_PREFIX = "registry-latestBlock-";
const REPO_LATEST_INDEX_PREFIX = "repo-latestIndex-";

const getRegistryEntryId = name => REGISTRY_ENTRY_PREFIX + name;
const getRepoEntryId = name => REPO_ENTRY_PREFIX + name;
const getRepoVersionId = (name, version) =>
  REPO_VERSION_PREFIX + [name, version].join("-");
// Caches
const getRegistryLatestBlockId = registryAddress =>
  REGISTRY_LATEST_BLOCK_PREFIX + registryAddress;
const getRepoLatestIndexId = registryAddress =>
  REPO_LATEST_INDEX_PREFIX + registryAddress;

/**
 * [ENTRIES]
 * Repos and registries are stored with a fixed prefix,
 * to be retrieved using the getRange utility
 * - The app will only fetch items that are stored with
 *   either of the two prefixes
 * - This architecture decouples the process of adding
 *   registries / repos, and the process of reading and
 *   updating their info
 */

async function addRegistry({ name, address }) {
  const id = getRegistryEntryId(name);
  await db.set(id, address);
}

/**
 * @returns {array} registries = [{
 *   name: "dnp.dappnode.eth",
 *   address: "0x1234abcd..."
 * }, ... ]
 */
async function getRegistries() {
  const items = await db.getRangeFromPrefix({
    prefix: REGISTRY_ENTRY_PREFIX,
    stripPrefix: true
  });
  return items.map(({ key, value }) => ({
    name: key,
    address: value
  }));
}

async function addRepo({ name, address }) {
  const id = getRepoEntryId(name);
  await db.set(id, address);
}

/**
 * @returns {array} repos = [{
 *   name: "admin.dnp.dappnode.eth",
 *   address: "0x1234abcd..."
 * }, ... ]
 */
async function getRepos() {
  const items = await db.getRangeFromPrefix({
    prefix: REPO_ENTRY_PREFIX,
    stripPrefix: true
  });
  return items.map(({ key, value }) => ({
    name: key,
    address: value
  }));
}

/**
 * [IPFS-HASHES]
 * Store a reference of IPFS hashes of a specific repo and version,
 * for tracking purposes
 */
async function addRepoVersion({ name, version, contentUris }) {
  const id = getRepoVersionId(name, version);
  // Store a relational reference to the IPFS hashes
  await db.set(id, JSON.stringify(contentUris));
  // Store the hashes individually to be picked up by the pinner
  for (const [asset, contentUri] of Object.entries(contentUris)) {
    if (contentUri)
      await db.merge(contentUri, { name, version, asset, lastPinned: 0 });
  }
}

/**
 * @returns {array} repos = [{
 *   name: "admin.dnp.dappnode.eth",
 *   address: "0x1234abcd..."
 * }, ... ]
 */
async function getRepoVersions() {
  const items = await db.getRangeFromPrefix({
    prefix: REPO_VERSION_PREFIX,
    stripPrefix: true
  });
  return items.map(({ key, value }) => {
    // Split by last occurence of the character "-"
    const name = key.substring(0, key.lastIndexOf("-"));
    const version = key.substring(key.lastIndexOf("-") + 1, key.length);
    const hashes = JSON.parse(value);
    return { name, version, hashes };
  });
}

async function getIpfsHashes() {
  const items = await db.getRangeFromPrefix({ prefix: "/ipfs/" });
  return items.map(({ key, value }) => ({
    hash: key,
    ...JSON.parse(value)
  }));
}

/**
 *
 * @param {string} contentUri "/ipfs/Qm..."
 * @param {object} data = {lastPinned: 1537472813, notInGithub: true }
 */
const updatePinStatus = {
  justPinned: hash => db.merge(hash, { lastPinned: String(Date.now()) }),
  notInGithub: hash => db.merge(hash, { notInGithub: true }),
  data: (hash, data) => db.merge(hash, data)
};

/**
 * [CACHES]
 * Store data about what was the last fetch of a specific piece of data
 */
function cacheFactory(getId) {
  return {
    get: idArg => db.get(getId(idArg)),
    set: (idArg, value) => db.set(getId(idArg), value)
  };
}

const registryLatestBlockCache = cacheFactory(getRegistryLatestBlockId);
const repoLatestIndexCache = cacheFactory(getRepoLatestIndexId);

/**
 * [COMPUTED-DATA]
 * More complex data manipulations
 */

/**
 * @returns {array} assets = [{
 *   name: "admin.dnp.dappnode.eth",
 *   version: "0.1.11",
 *   asset: "imageHash",
 *   hash: "/ipfs/QmUJ9xNAhAG3iUzmFrwJ7koPckNXT7qP2eYSa361dcJWaT"
 * }, ... ]
 */
async function getReposUnpinnedAssets() {
  const versions = await getRepoVersions();
  const assets = [];
  for (const { name, version, hashes } of versions) {
    for (const [asset, hash] of Object.entries(hashes)) {
      const { lastPinned, notInGithub } = await db.getObj(hash);
      if (lastPinned || notInGithub) continue;
      // If there is not lastPinned value it means it's unavailable
      assets.push({ name, version, asset, hash });
    }
  }
  return assets;
}

module.exports = {
  addRegistry,
  getRegistries,
  addRepo,
  getRepos,
  addRepoVersion,
  getRepoVersions,
  getIpfsHashes,
  updatePinStatus,
  // Data manipulations
  getReposUnpinnedAssets,
  // Cache
  registryLatestBlockCache,
  repoLatestIndexCache
};
