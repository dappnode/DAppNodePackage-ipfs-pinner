// User defined DB_PATH
const dbPath = process.env.DB_PATH || "./pin-data-db.json";
// ////////////////////

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync(dbPath);

const wrapDb = require("./dbWrap");
const db = wrapDb(low(adapter));

const reposId = "repos";
const registriesId = "registries";
const repoVersionsId = "repoVersions";
const ipfsHashesId = "ipfsHashes";
const getIpfsHashId = hash => joinIds(ipfsHashesId, hash);
// Id utils

/**
 *
 * @param {string} key
 * @param {string} correctedKey
 */
function removeDots(key) {
  return (key || "").replace(new RegExp(/\./, "g"), "_");
}

function getValues(key) {
  return Object.values(db.get(key) || {});
}
function joinIds(...ids) {
  return ids.map(removeDots).join(".");
}

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
function addRegistry({ name, address }) {
  db.set(joinIds(registriesId, name), { name, address });
}

/**
 * @returns {array} registries = [{
 *   name: "dnp.dappnode.eth",
 *   address: "0x1234abcd..."
 * }, ... ]
 */
function getRegistries() {
  return getValues(registriesId);
}

function addRepo({ name, address }) {
  db.set(joinIds(reposId, name), { name, address });
}

/**
 * @returns {array} repos = [{
 *   name: "admin.dnp.dappnode.eth",
 *   address: "0x1234abcd..."
 * }, ... ]
 */
function getRepos() {
  return getValues(reposId);
}

/**
 * [IPFS-HASHES]
 * Store a reference of IPFS hashes of a specific repo and version,
 * for tracking purposes
 */
function addRepoVersion({ name, version, contentUris }) {
  // Store a relational reference to the IPFS hashes
  db.set(joinIds(repoVersionsId, name, version), {
    name,
    version,
    contentUris
  });
  // Store the hashes individually to be picked up by the pinner
  for (const [asset, contentUri] of Object.entries(contentUris)) {
    if (contentUri) {
      const id = getIpfsHashId(contentUri);
      db.merge(id, { hash: contentUri, name, version, asset, lastPinned: 0 });
    }
  }
}

/**
 * @returns {array} repos = [{
 *   name: "admin.dnp.dappnode.eth",
 *   address: "0x1234abcd..."
 * }, ... ]
 */
function getRepoVersions() {
  return getValues(repoVersionsId);
}

function getIpfsHashes() {
  return getValues(ipfsHashesId);
}

/**
 *
 * @param {string} contentUri "/ipfs/Qm..."
 * @param {object} data = {lastPinned: 1537472813, notInGithub: true }
 */
const updatePinStatus = {
  justPinned: hash =>
    db.merge(getIpfsHashId(hash), { lastPinned: String(Date.now()) }),
  notInGithub: hash => db.merge(getIpfsHashId(hash), { notInGithub: true }),
  data: (hash, data) => db.merge(getIpfsHashId(hash), data)
};

/**
 * [CACHES]
 * Store data about what was the last fetch of a specific piece of data
 */
function cacheFactory(id) {
  const getId = idArg => joinIds("cache", id, idArg);
  return {
    get: idArg => db.get(getId(idArg)),
    set: (idArg, value) => db.set(getId(idArg), value)
  };
}

const registryLatestBlockCache = cacheFactory("registryLatestBlock");
const repoLatestIndexCache = cacheFactory("repoLatestIndex");

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
function getReposUnpinnedAssets() {
  const repos = getRepoVersions();
  const assets = [];
  for (const versions of Object.values(repos)) {
    for (const { name, version, contentUris } of Object.values(versions)) {
      for (const [asset, hash] of Object.entries(contentUris)) {
        const hashInfo = db.get(getIpfsHashId(hash));
        if (!hashInfo) continue;
        const { lastPinned, notInGithub } = hashInfo;
        if (lastPinned || notInGithub) continue;
        // If there is not lastPinned value it means it's unavailable
        assets.push({ name, version, asset, hash });
      }
    }
  }
  return assets;
}

/**
 * ##### TODO, are out
 * getObj
 * setObj
 */

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
