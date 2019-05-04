const ipfs = require("../ipfsSetup");
const { timeoutError } = require("../timeoutParams");

const addFromUrlTimeout = 15 * 60 * 1000;

/**
 * Adds and pins file from URL.
 *
 * [NOTE] The timeout is bigger since it will be cleared once the upload is done
 *
 * @param {string} url "https://github.com/dappnode/DNP_ADMIN/releases/download/v0.2.0/admin.dnp.dappnode.eth_0.2.0.tar.xz"
 * @returns {string} hash "QmU2M8W3YCAieW3st7ym4YTAKFpWwL9MqAm8FW4sdG2966"
 */
function addFromUrl(url) {
  return new Promise((resolve, reject) => {
    // Timeout cancel mechanism
    const timeoutToCancel = setTimeout(() => {
      reject(Error(timeoutError));
    }, addFromUrlTimeout);

    ipfs.addFromURL(url, (err, result) => {
      clearTimeout(timeoutToCancel);
      if (err) return reject(err);
      else resolve(result[0].hash);
    });
  });
}

module.exports = addFromUrl;
