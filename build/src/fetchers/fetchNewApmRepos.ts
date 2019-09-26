import * as web3 from "../web3";
import { ApmRepo, ApmRegistry } from "../types";

// #### TODO: Move this to a db
const cacheMemoryLastestBlock: { [registryAddress: string]: number } = {};

const firstRegistryDeployBlock = 5254891;

const repoBlacklist: { [shortName: string]: true } = {
  "apm-registry": true,
  "apm-enssub": true,
  "apm-repo": true,
  testing: true,
  "telegram-mtpproto.dnp.dappnode.eth": true
};

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
export default async function fetchNewApmRepos(
  registry: ApmRegistry
): Promise<ApmRepo[]> {
  const fromBlock = cacheMemoryLastestBlock[registry.address] || 0;
  const rawEvents = await web3.getNewReposFromRegistry(
    registry.address,
    fromBlock || firstRegistryDeployBlock
  );

  const repos: ApmRepo[] = rawEvents.map(event => ({
    id: event.returnValues.id,
    name: [event.returnValues.name, registry.name].join("."),
    shortName: event.returnValues.name,
    address: event.returnValues.repo,
    blockNumber: event.blockNumber
  }));

  const latestBlock = await web3.getBlockNumber();
  cacheMemoryLastestBlock[registry.address] = latestBlock;

  return cleanRepos(repos);
}

// Utils

function cleanRepos(repos: ApmRepo[]): ApmRepo[] {
  return filterOutDuplicatedRepos(filterBlacklistedRepos(repos));
}

/**
 * Deal with duplicated repos
 * If two events have the same id, the latest will be pinned
 *
 * @param {array} events
 */
function filterOutDuplicatedRepos(events: ApmRepo[]): ApmRepo[] {
  const uniqueIdEvents: { [repoId: string]: ApmRepo } = {};
  for (const event of events) {
    const { id } = event;
    if (uniqueIdEvents[id]) {
      if (event.blockNumber > uniqueIdEvents[id].blockNumber)
        uniqueIdEvents[id] = event;
    } else {
      uniqueIdEvents[id] = event;
    }
  }
  return Object.values(uniqueIdEvents);
}

/**
 * Filter dummy repos or known broken repos
 */
function filterBlacklistedRepos(events: ApmRepo[]): ApmRepo[] {
  return events.filter(({ shortName }) => !repoBlacklist[shortName]);
}
