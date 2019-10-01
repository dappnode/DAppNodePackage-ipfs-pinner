import * as sourcesDb from "../sourcesDb";
import { ens } from "../web3";
import * as eventBus from "../eventBus";
import * as ipfsCluster from "../ipfsCluster";
import {
  SourcesApi,
  sourceTypes,
  SourceType,
  SourcesApiItem,
  ApmRegistry,
  ApmRepo,
  SourceOptionsApi,
  assetTypes
} from "../types";
import { parseType, apmDnpRepoFile } from "../utils/assetMultiname";

async function resolveApmRegistry(name: string): Promise<ApmRegistry> {
  const address = await ens.lookup(name);
  return { name, address };
}

async function resolveApmRepo(name: string): Promise<ApmRepo> {
  const address = await ens.lookup(name);
  return { name, address };
}

/**
 * @param type "apm-registry"
 * @param name Must contain all data necessary to identify this source type
 */
export async function addSource(type: SourceType, name: string): Promise<void> {
  if (!type) throw Error(`Arg type required`);
  if (!name) throw Error(`Arg name required`);

  switch (type) {
    case sourceTypes.apmRegistry:
      const registry = await resolveApmRegistry(name);
      return eventBus.apmRegistry.emit(registry);
    case sourceTypes.apmDnpRepo:
      const repo = await resolveApmRepo(name);
      return eventBus.apmRepo.emit(repo);
    default:
      throw Error(`Unsupported source type: ${type}`);
  }
}

/**
 * @param type "apm-registry"
 * @param id ID is given by `getAllFormated`, "dnp.dappnode.eth"
 */
export async function deleteSource(
  type: SourceType,
  id: string
): Promise<SourcesApiItem> {
  if (!type) throw Error(`Arg type required`);
  if (!id) throw Error(`Arg id required`);

  switch (type) {
    case sourceTypes.apmRegistry:
      const childRepos = sourcesDb.getRegistryChildRepos(id);
      childRepos.forEach(repo => unpinRepoAssets(repo.name));
      return sourcesDb.apmRegistry.delById(id);
    case sourceTypes.apmDnpRepo:
      unpinRepoAssets(id);
      return sourcesDb.apmDnpRepo.delById(id);
    default:
      throw Error(`Unsupported source type: ${type}`);
  }
}

async function unpinRepoAssets(repoName: string) {
  const pinset = await ipfsCluster.allocations();
  for (const pin of pinset)
    if (
      parseType(pin.name) === assetTypes.apmDnpRepoFile &&
      apmDnpRepoFile.parse(pin.name).name === repoName
    )
      eventBus.unpinFile.emit({ id: pin.name, hash: pin.hash, dir: false });
}

export function getSources(): SourcesApi {
  return sourcesDb.getAllFormated();
}

export function getOptions(): SourceOptionsApi {
  const options: SourceOptionsApi = [
    {
      value: sourceTypes.apmDnpRepo,
      label: "APM repo",
      placeholder: "Repo ENS"
    },
    {
      value: sourceTypes.apmRegistry,
      label: "APM registry",
      placeholder: "Registry ENS"
    }
  ];
  return options;
}
