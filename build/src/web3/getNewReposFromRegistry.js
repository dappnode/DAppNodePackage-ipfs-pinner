const eth = require("./eth");
const getTopic = require("./utils/getTopic");
const abi = require("ethjs-abi");

const registryAbi = {
  newRepoEvent: {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "id",
        type: "bytes32"
      },
      {
        indexed: false,
        name: "name",
        type: "string"
      },
      {
        indexed: false,
        name: "repo",
        type: "address"
      }
    ],
    name: "NewRepo",
    type: "event"
  }
};

const newRepoEventTopic = getTopic(registryAbi.newRepoEvent);

/**
 * Fetches the new repos logs from a registry
 *
 * @param {string} address "0x266bfdb2124a68beb6769dc887bd655f78778923"
 * @param {object} options [{
 *   address: '0x266bfdb2124a68beb6769dc887bd655f78778923',
 *   blockHash:
 *    '0xef234a05b3fbff3f0a1abff127ee1f95c2a80449adbb1995f5570f52908fd39e',
 *   blockNumber: 7534349,
 *   data:
 *    '0x779809cb8a44dac10ed6de506b7e81a119e59bb7779835dc8ecf98d3e9daf3680000000000000000000000000000000000000000000000000000000000000060000000000000000000000000b185207e58bdf71b6aaf9a4c3c47ddbadf61483700000000000000000000000000000000000000000000000000000000000000077669706e6f646500000000000000000000000000000000000000000000000000',
 *   logIndex: <BN: 47>,
 *   removed: false,
 *   topics:
 *    [ '0x526d4ccf8c3d7b6f0b6d4cc0de526d515c87d1ea3bd264ace0b5c2e70d1b2208' ],
 *   transactionHash:
 *    '0x08b592c227a0e92a2e42499f282b6f0099349e328c8f22d836f3bb674b4c795e',
 *   transactionIndex: <BN: 28>,
 *   returnValues: {
 *     id: '0x779809cb8a44dac10ed6de506b7e81a119e59bb7779835dc8ecf98d3e9daf368',
 *     name: 'vipnode',
 *     repo: '0xb185207e58bdf71b6aaf9a4c3c47ddbadf614837',
 *   }
 * }, ... ]
 */
async function getNewReposFromRegistry(address, options = {}) {
  const result = await eth.getLogs({
    fromBlock: options.fromBlock || "0",
    toBlock: options.toBlock || "latest",
    address,
    topics: [newRepoEventTopic]
  });
  return result.map(event => ({
    ...event,
    blockNumber: event.blockNumber.toNumber(),
    returnValues: abi.decodeEvent(registryAbi.newRepoEvent, event.data)
  }));
}

module.exports = getNewReposFromRegistry;
