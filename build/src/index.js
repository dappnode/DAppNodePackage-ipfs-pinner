require("./utils/arrayPrototype");
// Stages
const fetchFromRegistries = require("./stages/fetchFromRegistries");
const fetchFromRepos = require("./stages/fetchFromRepos");
const pinCollectedHashes = require("./stages/pinCollectedHashes");
const pinCollectedHashesToExternalNode = require("./stages/pinCollectedHashesToExternalNode");
const portMissingAssetsFromGithubToIpfs = require("./stages/portMissingAssetsFromGithubToIpfs");
const triggerPublicGateways = require("./stages/triggerPublicGateways");
const portLatestGithubRelease = require("./stages/portLatestGithubRelease");
// DB
const db = require("./db");
// Utils
const runEvery = require("./utils/runEvery");
const { ens } = require("./web3");
const parseCsv = require("./utils/parseCsv");
const resolveWhenIpfsIsReady = require("./utils/resolveWhenIpfsIsReady");

const registriesToAdd = parseCsv(
  process.env.REGISTRY_CSV || "dnp.dappnode.eth"
);
const externalIpfsApis = parseCsv(process.env.EXTERNAL_IPFS_API_CSV || "");

start();

async function start() {
  /**
   * Initialize database entries with CSV passed through ENVs
   * - REGISTRY_CSV="dnp.dappnode.eth, public.dappnode.eth"
   */
  await registriesToAdd.mapAsyncParallel(async name => {
    const address = await ens.lookup(name);
    console.log(`Adding registry: ${name} ${address}`);
    db.addRegistry({ name, address });
  });

  /**
   * [NOTE] runEvery will make sure that the async function function is run
   * every interval or less dependening on how much time the task takes
   */

  await runEvery("5 minutes", async () => {
    await resolveWhenIpfsIsReady();

    /**
     * 1. Fetch new repos
     *   - Collect known registries form the DB.
     *   - Fetch new repos for each registry and store to the DB
     */
    await fetchFromRegistries();

    /**
     * 2. Fetch new versions of repos
     *   - Collect known repos from the DB.
     *   - Fetch new version for each repo
     *   - For each version resolve the contentUris and store to the DB
     * }, ... ]
     */
    await fetchFromRepos();

    /**
     * 3. Pin collected hashes
     *   - Collect aggregated hashes from previous stages
     *   - Get the pin list from the node
     *   - Pin the not yet pinned hashes
     */
    await pinCollectedHashes();
    await externalIpfsApis.mapAsyncParallel(apiUrl =>
      pinCollectedHashesToExternalNode(apiUrl)
    );

    console.log(`Finished run`);
  });

  // Run every day after the first run of the previous block
  await runEvery("1 day", async () => {
    await resolveWhenIpfsIsReady();

    /**
     * 4. Port missing assets from Github to IPFS
     * - Collects all fetched repo's assets for each version
     * - Collects pinned hashes and checks which assets are not pinned
     * - Checks if those assets are available in a github release
     * - If so, it add the file to IPFS with a stream
     * - If Github replies with 404, it will NOT try to fetch the fail again
     */
    await portMissingAssetsFromGithubToIpfs();

    /**
     * 5. Trigger public gateways
     * - Collects all fetched repo's assets but only for:
     *   - Already pinned and available hashes
     *   - The latest available version
     * - Collects a list of available and active gateways
     * - Queries every single gateway to download each asset
     */
    await triggerPublicGateways();
  });

  /**
   * Github's unauthenticated rate limiting is 60 req / hour.
   * Right now there are only 19 repos, so this stage can be run
   * every 19 minutes, the quickest
   *
   * [NOTE] no need to wait for the previous block
   */
  await runEvery("30 minutes", async () => {
    await resolveWhenIpfsIsReady();

    /**
     * 6. Port latest Github release
     * - Fetch the latest release from Github
     * - Check if it matches the current latest from APM
     * - Check if it matches the current latest from Github
     * - If it matches any, clean or remove,
     * - Else, pin it and cache the result
     */
    await portLatestGithubRelease();
  });
}
