import * as eventBus from "./eventBus";
import * as pinDb from "./pinDb";
import * as assetDb from "./assetsDb";
import fetchNewApmRepos from "./fetchers/fetchNewApmRepos";
import fetchNewApmVersions from "./fetchers/fetchNewApmVersions";
import fetchIpfsRelease from "./fetchers/fetchIpfsRelease";
import isVersionBlacklisted from "./utils/isVersionBlacklisted";
import reconcilePinSet from "./reconcilePinSet";
import { runOnlyOneSequentially } from "./utils/asyncFlows";

// On registry, fetch its new repos if any
eventBus.apmRegistry.on(async registry => {
  const newRepos = await fetchNewApmRepos(registry);
  newRepos.forEach(eventBus.apmRepo.emit);
});

// On repo, fetch its new versions if any
eventBus.apmRepo.on(async repo => {
  const versions = await fetchNewApmVersions(repo);
  versions
    .filter(version => !isVersionBlacklisted(version))
    .forEach(eventBus.apmVersion.emit);
});

// On version, fetch its files
eventBus.apmVersion.on(async version => {
  assetDb.apmProcessingVersion.set(version);
  console.log(`Processing version ${version.name} ${version.version}...`);
  const files = await fetchIpfsRelease(version);
  assetDb.apmProcessingVersion.del(version);
  console.log(`New APM version ${version.name} ${version.version} `);
  files.forEach(eventBus.file.emit);
});

// On file, pin it
eventBus.file.on(async file => {
  pinDb.storeFile(file);
  eventBus.pin.emit();
  // Remove other files if necessary
});

// On pin fetch current pins, files to pin, and reconcile
const throttledReconcilePinSet = runOnlyOneSequentially(reconcilePinSet);
eventBus.pin.on(() => {
  throttledReconcilePinSet();
});

/**
 * Persist dynamic sources of assets:
 * - APM registry
 * - APM repo
 *
 * Then, poll them the check for new assets
 */
eventBus.apmRegistry.on(async registry => assetDb.apmRegistry.set(registry));
eventBus.apmRepo.on(async repo => assetDb.apmRepo.set(repo));
eventBus.apmVersion.on(async version =>
  assetDb.apmProcessingVersion.set(version)
);

setInterval(() => {
  assetDb.apmRegistry.getAll().forEach(eventBus.apmRegistry.emit);
  assetDb.apmRepo.getAll().forEach(eventBus.apmRepo.emit);
  assetDb.apmProcessingVersion.getAll().forEach(eventBus.apmVersion.emit);
}, 5 * 1000);

/**
 * TODO
 * - Keep or generate a list of hashes that should be pinned
 * - Fetch the list of pinned hashes, and pin the remaining
 * - Instead of pinning directly, add files to a list of "to-be-pinned"
 *   and then iterate over that list periodically, so a nice
 *   throttle can be applied
 */

const testRegistry = {
  name: "dnp.dappnode.eth",
  address: "0x266BFdb2124A68beB6769dC887BD655f78778923"
};

eventBus.apmRegistry.emit(testRegistry);
