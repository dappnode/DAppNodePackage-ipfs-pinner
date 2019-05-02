const wrapDb = require("./dbWrap");
const db = wrapDb(require("level")(process.env.DB_PATH || "./pinner-db"));

const REGISTRY_ENTRY_PREFIX = "registry-entry-";
const REPO_ENTRY_PREFIX = "repo-entry-";
const REPO_VERSION_PREFIX = "repo-version-";
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
  for (const contentUri of Object.values(contentUris)) {
    if (contentUri) await db.set(contentUri, "");
  }
}

async function getIpfsHashes() {
  const items = await db.getRangeFromPrefix({ prefix: "/ipfs/" });
  return items.map(({ key, value }) => ({
    hash: key,
    lastPinned: parseInt(value || 0)
  }));
}

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

module.exports = {
  addRegistry,
  getRegistries,
  addRepo,
  getRepos,
  addRepoVersion,
  getIpfsHashes,
  // Cache
  registryLatestBlockCache,
  repoLatestIndexCache
};
