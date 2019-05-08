const wrapMethodsWithQueue = require("../utils/wrapMethodsWithQueue");
const isIpfsHash = require("../utils/isIpfsHash");
const parseJson = require("./parseJson");
const Ipfs = require("./Ipfs");

/**
 * - This file returns a factory function. To import it and use the default API:
 *   `require("./ipfs")()`
 * - To use a different API
 *   `require("./ipfs")("infura")`
 *
 * The instances will be cached and only created once
 */

const defaultpiUrl =
  process.env.IPFS_API_URL || "http://my.ipfs.dnp.dappnode.eth:5001";

/**
 * Factory singleton of IPFS instances
 * @param {string} urlOrId
 */
const ipfsInstances = {};
function ipfsFactory(urlOrId, options) {
  const apiUrl = parseUrlOrId(urlOrId);
  if (!ipfsInstances[apiUrl])
    ipfsInstances[apiUrl] = getIpfsInstance(apiUrl, options);
  return ipfsInstances[apiUrl];
}
function parseUrlOrId(urlOrId) {
  if (!urlOrId) return defaultpiUrl;
  if (urlOrId.startsWith("http")) return urlOrId;
  if (urlOrId === "infura") return "https://ipfs.infura.io:5001";
  else throw Error(`Unknown IPFS API url or ID: ${urlOrId}`);
}

/**
 * Creates an IPFS instance
 *
 * @param {string} apiUrl "http://my.ipfs.dnp.dappnode.eth:5001"
 */
function getIpfsInstance(apiUrl, options = {}) {
  const params = {
    // For the async queue
    times: options.times || 3,
    concurrency: options.concurrency || 20,
    intervalBase: options.intervalBase || 225,
    // For the request timeout
    timeout: options.timeout || 30 * 1000
  };

  const ipfs = Ipfs(apiUrl);

  /**
   * First, wrap methods with a concurrency and retry async queue.
   * This wrap ensures that many concurrent calls will not overload the
   * node, increasing the chances of failure.
   */
  const ipfsWithQueue = wrapMethodsWithQueue(ipfs, params);

  /**
   * Second, wrap the wrapped methods with a check to verify if the
   * hash is available in the current peers. This availability check
   * is itself wrapped in a retry async flow.
   */

  function wrapMethodWithIsAvailable(method) {
    return async function(hash, ...args) {
      await isAvailable(hash);
      return await method(hash, ...args);
    };
  }

  async function isAvailable(hash) {
    if (!hash || typeof hash !== "string")
      throw Error(`arg hash must be a string: ${hash}`);
    if (!isIpfsHash(hash)) throw Error(`Invalid IPFS hash: ${hash}`);
    // Reformat the hash, some methods do not tolerate the /ipfs/ prefix
    hash = hash.split("ipfs/")[1] || hash;

    try {
      await ipfsWithQueue.objectStats(hash, params.timeout);
    } catch (e) {
      // This is the timeout error code of the `request` library
      if (e.code === "ESOCKETTIMEDOUT")
        throw Error(`Ipfs hash not available: ${hash}`);
      else
        throw Error(
          `Error checking ipfs hash ${hash} availability: ${e.stack}`
        );
    }
  }

  /**
   * Wrap with `isAvailable` only the methods that involve
   * pulling content of yet unknown availability
   */

  const cat = wrapMethodWithIsAvailable(ipfsWithQueue.cat);
  const pinAdd = wrapMethodWithIsAvailable(ipfsWithQueue.pinAdd);
  const catObj = (...args) => cat(...args).then(parseJson);

  return {
    ...ipfsWithQueue,
    cat,
    catObj,
    pinAdd
  };
}

module.exports = ipfsFactory;
