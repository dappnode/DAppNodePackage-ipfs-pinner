import getRepoContract from "../web3/getRepoContract";

export interface Version {
  version: string;
  contentUri: string;
}

/**
 * Get new versions, using the cached last index
 *
 * @param {string} repoAddress
 * @return {array} versions = [{
 *   version: "0.1.4",
 *   contentUri: "/ipfs/Qm..."
 * }, ... ]
 */
export default async function fetchNewApmVersions(
  repoName: string,
  numOfVersions: number
): Promise<Version[]> {
  const repoContract = getRepoContract(repoName);

  const latestIndex = await repoContract.getVersionsCount();

  // Limit the amount of releases to fetch on init
  const firstIndex = latestIndex - numOfVersions + 1;

  /**
   * Versions called by id are ordered in ascending order.
   * The min version = 1 and the latest = versionCount
   *
   *  i | semanticVersion
   * ---|------------------
   *  1 | [ '0', '0', '1' ]
   *  2 | [ '0', '0', '2' ]
   *  3 | [ '0', '0', '3' ]
   *  4 | [ '0', '0', '4' ]
   *
   *  versionIds = [1, 2, 3, 4, 5, ...]
   */
  const versionIds = [];
  for (let i = firstIndex < 1 ? 1 : firstIndex; i <= latestIndex; i++)
    versionIds.push(i);

  // Paralelize requests since ethereum clients can hanlde many requests well

  const versions = await Promise.all(
    versionIds.map(async versionId => {
      try {
        const res = await repoContract.getVersionById(versionId);
        return { version: res.version, contentUri: res.contentUri };
      } catch (e) {
        // If you request an inexistent ID to the contract, web3 will throw
        // Error: couldn't decode uint16 from ABI. The try, catch block will catch that
        // and log other errors
        if (e.message.includes("decode uint16 from ABI"))
          e.message = `Attempting to fetch an inexistent version. ${e.message}`;

        e.message = `Error get version ${versionId} ${repoName}. ${e.message}`;
        throw e;
      }
    })
  );

  // Use push, to ignore versionId that throw, satisfy the typescript compiler
  const cleanVersions: Version[] = [];
  for (const version of versions) if (version) cleanVersions.push(version);

  return cleanVersions;
}
