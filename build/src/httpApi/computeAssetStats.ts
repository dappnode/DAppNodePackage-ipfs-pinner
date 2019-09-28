import * as assetDb from "../assetsDb";

export interface ApmAssetsStats {
  registryCount: number;
  registryNames: string[];
  repoCount: number;
  repoNames: string[];
  processingVersions: string[];
}

export function computeApmAssetStats(): ApmAssetsStats {
  const registries = assetDb.apmRegistry.getAll();
  const repos = assetDb.apmRepo.getAll();
  const processingVersions = assetDb.apmProcessingVersion.getAll();

  return {
    registryCount: registries.length,
    registryNames: registries.map(({ name }) => name),
    repoCount: repos.length,
    repoNames: repos.map(({ name }) => name),
    processingVersions: processingVersions.map(
      ({ name, version }) => `${name} @ ${version}`
    )
  };
}
