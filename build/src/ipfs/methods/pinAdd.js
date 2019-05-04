const ipfs = require("../ipfsSetup");
const { timeoutError, timeoutTime } = require("../timeoutParams");

/**
 * Pins a file to local storage.
 *
 * @param {string} hash "QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD"
 * @returns {*} pinset
 */
function pinAdd(hash) {
  return new Promise((resolve, reject) => {
    // Timeout cancel mechanism
    const timeoutToCancel = setTimeout(() => {
      reject(Error(timeoutError));
    }, timeoutTime);

    ipfs.pin.add(hash, (err, pinset) => {
      clearTimeout(timeoutToCancel);
      if (err) return reject(err);
      else resolve(pinset);
    });
  });
}

module.exports = pinAdd;
