import * as eventBus from "./eventBus";
import * as ipfsCluster from "./ipfsCluster";
import runHttpApi from "./api";
import runApmPinner from "./apmPinner";

/**
 * TODO
 * - Keep or generate a list of hashes that should be pinned
 * - Fetch the list of pinned hashes, and pin the remaining
 * - Instead of pinning directly, add files to a list of "to-be-pinned"
 *   and then iterate over that list periodically, so a nice
 *   throttle can be applied
 */

// Run HTTP API to check pinner status
runHttpApi();

// Run asset scoped pinners
runApmPinner();

// Bind eventBus to pinner
eventBus.pinFile.on(async file => {
  console.log(`Pinning ${file.id}...`);
  await ipfsCluster.pinAdd(file.hash, { name: file.id });
});
eventBus.unpinFile.on(async file => {
  console.log(`unPinning ${file.id}...`);
  await ipfsCluster.pinRm(file.hash);
});

// const testRegistry = {
//   name: "dnp.dappnode.eth",
//   address: "0x266BFdb2124A68beB6769dC887BD655f78778923"
// };

// eventBus.apmRegistry.emit(testRegistry);
// eventBus.pin.emit();

// ipfsCluster.pinLsStatus().then(r => {
//   console.log("\n".repeat(20));
//   console.log(JSON.stringify(r, null, 2));
//   console.log("\n".repeat(20));
// });
