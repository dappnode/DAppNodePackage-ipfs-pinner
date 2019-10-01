import * as web3 from "../web3";
import { ApmRepo, ApmRegistry } from "../types";

// #### TODO: Move this to a db
const cacheMemoryLastestBlock: { [registryAddress: string]: number } = {};

const firstRegistryDeployBlock = 5254891;

const repoBlacklist: { [name: string]: true } = {
  "apm-registry.dnp.dappnode.eth": true,
  "apm-enssub.dnp.dappnode.eth": true,
  "apm-repo.dnp.dappnode.eth": true,
  "testing.dnp.dappnode.eth": true,
  "telegram-mtpproto.dnp.dappnode.eth.dnp.dappnode.eth": true
};

interface ApmRepoEvent {
  id: string;
  name: string;
  address: string;
  blockNumber: number;
}

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

  const repos: ApmRepoEvent[] = rawEvents.map(event => ({
    id: event.returnValues.id,
    name: [event.returnValues.name, registry.name].join("."),
    address: event.returnValues.repo,
    blockNumber: event.blockNumber
  }));

  const latestBlock = await web3.getBlockNumber();
  cacheMemoryLastestBlock[registry.address] = latestBlock;

  return cleanRepos(repos).map(repo => ({
    name: repo.name,
    address: repo.address,
    fromRegistry: registry.name
  }));
}

// Utils

function cleanRepos(repos: ApmRepoEvent[]): ApmRepoEvent[] {
  return filterOutDuplicatedRepos(filterBlacklistedRepos(repos));
}

/**
 * Deal with duplicated repos
 * If two events have the same id, the latest will be pinned
 *
 * @param {array} events
 */
function filterOutDuplicatedRepos(events: ApmRepoEvent[]): ApmRepoEvent[] {
  const uniqueIdEvents: { [repoId: string]: ApmRepoEvent } = {};
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
function filterBlacklistedRepos(events: ApmRepoEvent[]): ApmRepoEvent[] {
  return events.filter(({ name }) => !repoBlacklist[name]);
}
