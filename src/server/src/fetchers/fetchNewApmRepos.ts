import getNewReposFromRegistry from "../web3/getNewReposFromRegistry";

const shortNameBlacklist = ["apm-registry", "apm-enssub", "apm-repo"];
const firstRegistryInMainnet = 5264766;

// For testing
export interface ApmRegistryRepo {
  shortname: string;
  address: string;
}
interface ApmRepoEvent {
  id: string;
  shortname: string;
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
  registryName: string,
  fromBlock: number
): Promise<ApmRegistryRepo[]> {
  const rawEvents = await getNewReposFromRegistry(
    registryName,
    fromBlock || firstRegistryInMainnet
  );

  const repos: ApmRepoEvent[] = rawEvents
    .map(event => ({
      id: event.returnValues.id,
      shortname: event.returnValues.name,
      address: event.returnValues.repo,
      blockNumber: event.blockNumber
    }))
    .filter(({ shortname }) => !shortNameBlacklist.includes(shortname));

  return cleanRepos(repos).map(repo => ({
    shortname: repo.shortname,
    address: repo.address
  }));
}

// Utils

function cleanRepos(repos: ApmRepoEvent[]): ApmRepoEvent[] {
  return filterOutDuplicatedRepos(repos);
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
