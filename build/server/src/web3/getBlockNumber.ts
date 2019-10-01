const eth = require("./eth");

/**
 * Gets the latest blockNumber
 *
 * @returns {number} blockNumber 7532643
 */
export default async function getBlockNumber() {
  return eth.blockNumber().then((res: any) => res.toNumber());
}
