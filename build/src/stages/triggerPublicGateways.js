const db = require("../db");
const ipfs = require("../ipfs");
const getPublicGateways = require("../utils/getPublicGateways");
require("../utils/arrayPrototype");

async function triggerPublicGateways() {
  // gateways = ["https://gateway.ipfs.io/ipfs/", ... ]
  const ipfsHashes = await db.getIpfsHashes();
  const gateways = await getPublicGateways();

  await ipfsHashes.mapAsyncParallel(({ name, version, asset, hash }) =>
    gateways.mapAsyncParallel(async gateway => {
      const id = [name, version, asset.replace("Hash", ""), gateway].join(" ");
      try {
        console.log(`Fetching ${id}...`);
        const url = gateway + hash.replace("/ipfs/", "");
        await ipfs.addFromUrl(url);
        console.log(`Fetched ${id}`);
      } catch (e) {
        console.error(`Error fetching ${id}: ${e.stack}`);
      }
    })
  );
}

triggerPublicGateways();
