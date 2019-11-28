import provider from "./provider";

/**
 * Gets the latest blockNumber
 *
 * @returns {number} blockNumber 7532643
 */
export default async function getBlockNumber(): Promise<number> {
  return await provider.getBlockNumber();
}
