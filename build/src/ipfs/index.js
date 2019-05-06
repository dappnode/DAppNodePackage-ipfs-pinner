const wrapMethodsWithQueue = require("../utils/wrapMethodsWithQueue");
const isIpfsHash = require("../utils/isIpfsHash");
const parseJson = require("./parseJson");
const Ipfs = require("./Ipfs");

const apiUrl =
  process.env.IPFS_API_URL || "http://my.ipfs.dnp.dappnode.eth:5001";
const ipfs = Ipfs(apiUrl);

const params = {
  // For the async queue
  times: 3,
  concurrency: 10,
  intervalBase: 225,
  // For the request timeout
  timeout: 30 * 1000
};

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
      throw Error(`Error checking ipfs hash ${hash} availability: ${e.stack}`);
  }
}

/**
 * Wrap with `isAvailable` only the methods that involve
 * pulling content of yet unknown availability
 */

const cat = wrapMethodWithIsAvailable(ipfsWithQueue.cat);
const pinAdd = wrapMethodWithIsAvailable(ipfsWithQueue.pinAdd);
const catObj = (...args) => cat(...args).then(parseJson);

module.exports = {
  ...ipfsWithQueue,
  cat,
  catObj,
  pinAdd
};
