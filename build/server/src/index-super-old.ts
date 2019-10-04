// Stages
const fetchFromRegistries = require("./stages/fetchFromRegistries");
const fetchFromRepos = require("./stages/fetchFromRepos");
const manageDnpsPinnedData = require("./stages/manageDnpsPinnedData");
const portMissingAssetsFromGithubToIpfs = require("./stages/portMissingAssetsFromGithubToIpfs");
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

start();

async function start() {
  /**
   * Initialize database entries with CSV passed through ENVs
   * - REGISTRY_CSV="dnp.dappnode.eth, public.dappnode.eth"
   */
  await registriesToAdd.mapAsyncParallel(async (name: any) => {
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
    await manageDnpsPinnedData();

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
  });
}

export {};
