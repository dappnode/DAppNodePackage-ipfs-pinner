const eth = require("./eth");

/**
 * Gets the latest blockNumber
 *
 * @returns {number} blockNumber 7532643
 */
async function getBlockNumber() {
  return eth.blockNumber().then(res => res.toNumber());
}

module.exports = getBlockNumber;
