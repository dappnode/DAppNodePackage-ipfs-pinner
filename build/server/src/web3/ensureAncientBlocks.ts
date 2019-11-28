import provider from "./provider";

const blockToTest = 7000000;
/**
 * [NOTE] only valid if the underlying web3 library is `ethjs`
 */
const ethjsErrorMessage = "Ancient block sync is still in progress";
const errorMessage = `Ancient blocks are not synced.

This IPFS pinner will not be able to aggregate new repo versions
Please,
 - wait for your node to sync
 - enable ancient blocks sync (remove --no-ancient-blocks flag on your node)
 - or, use an external web3 provider
 `;

export default async function ensureAncientBlocks(): Promise<void> {
  try {
    await provider.getBlock(blockToTest);
  } catch (e) {
    if ((e.message || "").includes(ethjsErrorMessage))
      throw Error(errorMessage);
    else throw Error(`Error: ${e.message} \n${errorMessage}`);
  }
}
