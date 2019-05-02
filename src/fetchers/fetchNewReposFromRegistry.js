const registryAbi = require("../contracts/registryAbi.json");
const web3 = require("../web3");
const db = require("../db");

const firstRegistryDeployBlock = 5254891;

/**
 * Get registry's new repos from the last cached blockNumber
 *
 * @param {string} registryAddress
 * @param {array} newRepos = [{
 *   id: '0xd7ec73ef33cd0720e49cbc4bfb1a912840535bee540dcf01d1cc4caae0129631',
 *   name: 'livepeer',
 *   address: '0xf655173FAfb85f9f2943b2F2518146a4c149c70b',
 * }, ... ]
 */
async function fetchNewReposFromRegistry(registryAddress) {
  const fromBlock = await db.registryLatestBlockCache.get(registryAddress);

  const registry = new web3.eth.Contract(registryAbi, registryAddress);
  const events = await registry
    .getPastEvents("NewRepo", {
      fromBlock: fromBlock || firstRegistryDeployBlock,
      toBlock: "latest"
    })
    .then(filterOutDuplicatedRepos);

  const latestBlock = await web3.eth.getBlockNumber();
  await db.registryLatestBlockCache.set(registryAddress, latestBlock);

  return events.map(event => {
    const { id, name, repo: address } = event.returnValues;
    return { id, name, address };
  });
}

// Utils

/**
 * Deal with duplicated repos
 * If two events have the same id, the latest will be pinned
 *
 * @param {array} events
 */
function filterOutDuplicatedRepos(events) {
  const uniqueIdEvents = {};
  for (const event of events) {
    const { id, repo, name } = event.returnValues;
    if (uniqueIdEvents[id]) {
      if (event.blockNumber > uniqueIdEvents[id].blockNumber) {
        console.log(
          `Ignoring repo ${name} - ${
            uniqueIdEvents[id].returnValues.repo
          }, another most recent repo has the same id ${event.blockNumber} > ${
            uniqueIdEvents[id].blockNumber
          }`
        );
        uniqueIdEvents[id] = event;
      } else {
        console.log(
          `Ignoring repo ${name} - ${repo}, another most recent repo has the same id ${
            uniqueIdEvents[id].blockNumber
          } > ${event.blockNumber}`
        );
      }
    } else {
      uniqueIdEvents[id] = event;
    }
  }
  return Object.values(uniqueIdEvents);
}

module.exports = fetchNewReposFromRegistry;
