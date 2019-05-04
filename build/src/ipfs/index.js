const wrapMethodsWithQueue = require("../utils/wrapMethodsWithQueue");
const isIpfsHash = require("../utils/isIpfsHash");
const parseJson = require("./parseJson");
const { timeoutError } = require("./timeoutParams");
const ipfs = require("./ipfsSetup");

// Methods
const methods = {
  cat: require("./methods/cat"),
  catStreamToFs: require("./methods/catStreamToFs"),
  objectSize: require("./methods/objectSize"),
  pinAdd: require("./methods/pinAdd"),
  addFromUrl: require("./methods/addFromUrl")
};
// Params
const params = {
  times: 3,
  concurrency: 10,
  intervalBase: 225
};

/**
 * First, wrap methods with a concurrency and retry async queue.
 * This wrap ensures that many concurrent calls will not overload the
 * node, increasing the chances of failure.
 */
const wrappedMethods = wrapMethodsWithQueue(methods, params);

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
    await wrappedMethods.objectSize(hash);
  } catch (e) {
    if (e.message === timeoutError)
      throw Error(`Ipfs hash not available: ${hash}`);
    else throw Error(`Ipfs hash ${hash} not available error: ${e.message}`);
  }
}

/**
 * Wrap with `isAvailable` only the methods that involve
 * pulling content of yet unknown availability
 */
const cat = wrapMethodWithIsAvailable(wrappedMethods.cat);
const catStreamToFs = wrapMethodWithIsAvailable(wrappedMethods.catStreamToFs);
const catObj = (...args) => cat(...args).then(parseJson);
const pinAdd = wrapMethodWithIsAvailable(wrappedMethods.pinAdd);

module.exports = {
  ...wrappedMethods,
  cat,
  catStreamToFs,
  catObj,
  pinAdd,
  // Provide shortcuts to certain methods
  pinList: ipfs.pin.ls,
  // Export the library not wrapped to test out methods
  raw: ipfs
};
