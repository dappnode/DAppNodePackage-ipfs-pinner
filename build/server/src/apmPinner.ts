import * as eventBus from "./eventBus";
import * as sourcesDb from "./sourcesDb";
import fetchNewApmRepos from "./fetchers/fetchNewApmRepos";
import fetchNewApmVersions from "./fetchers/fetchNewApmVersions";
import fetchIpfsRelease from "./fetchers/fetchIpfsRelease";
import isVersionBlacklisted from "./utils/isVersionBlacklisted";

export default function runApmPinner() {
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
    sourcesDb.apmProcessingVersion.set(version);
    const files = await fetchIpfsRelease(version);
    sourcesDb.apmProcessingVersion.del(version);
    files.forEach(eventBus.pinFile.emit);
  });

  /**
   * Persist dynamic sources of assets:
   * - APM registry
   * - APM repo
   *
   * Then, poll them the check for new assets
   */
  eventBus.apmRegistry.on(async registry => {
    sourcesDb.apmRegistry.set(registry);
  });
  eventBus.apmRepo.on(async repo => {
    sourcesDb.apmDnpRepo.set(repo);
  });

  setInterval(() => {
    sourcesDb.apmRegistry.getAll().forEach(eventBus.apmRegistry.emit);
    sourcesDb.apmDnpRepo.getAll().forEach(eventBus.apmRepo.emit);
    sourcesDb.apmProcessingVersion.getAll().forEach(eventBus.apmVersion.emit);
  }, 5 * 60 * 1000);
}
