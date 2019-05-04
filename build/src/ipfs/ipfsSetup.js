const Ipfs = require("ipfs-http-client");

const ipfsProvider = { host: "my.ipfs.dnp.dappnode.eth" };
// const ipfsProvider = { host: "ipfs.infura.io", protocol: "https" };

let ipfs;

/**
 * Prevents web3 from executing to unit-testing.
 * It can result in infinite non-ending tests
 */
if (!process.env.TEST) {
  ipfs = initIPFS();
}

function initIPFS() {
  console.log(`Attempting IPFS connection to : ${ipfsProvider.host}`);
  const ipfs = Ipfs(ipfsProvider);
  // verify on the background, don't stop execution
  verifyIPFS(ipfs);
  return ipfs;
}

function verifyIPFS(ipfs) {
  ipfs.id((err, identity) => {
    if (err) {
      console.error(`IPFS error: ${err.message}`);
    } else {
      console.log(`Connected to IPFS, id: ${(identity || {}).id}`);
    }
  });
}

module.exports = ipfs;
