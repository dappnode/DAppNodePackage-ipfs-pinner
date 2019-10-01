import dbFactory from "./dbFactory";
import {
  ApmRegistry,
  ApmRepo,
  ApmVersion,
  SourcesApi,
  SourceType,
  sourceTypes,
  SourcesApiItem
} from "./types";

const sourcesDb = dbFactory("sourcesdb.json");

// Static db keys
const addedKey = "added";

interface SourcesDb {
  apm: {
    registry: {
      [registryId: string]: ApmRegistry;
    };
    repo: {
      [repoId: string]: ApmRepo;
    };
  };
}

/**
 * Removes all special characters:
 * @param str "hello world & hello universe"
 * @returns "hello-world-hello-universe"
 */
function cleanId(str: string): string {
  return str.replace(/[^A-Z0-9]+/gi, "-");
}

/**
 * Creates an object of methods for dynamic sub-keys
 * @param rootPath "apm.registry"
 * @param idGetter must return a locally unique id for this source type
 */
function dynamicSubKeyFactory<T>(
  type: SourceType,
  idGetter: (arg: T) => string,
  getDisplayName: (arg: T) => string
) {
  const rootPath = type;
  const getPathById = (id: string) => [rootPath, cleanId(id)].join(".");
  const getPath = (arg: T) => getPathById(idGetter(arg));

  function set(arg: T): SourcesApiItem {
    sourceAdded(getPath(arg));
    sourcesDb.set(getPath(arg), arg);
    return formatItem(arg);
  }

  function getAll(): T[] {
    return Object.values(sourcesDb.get(rootPath) || {});
  }

  function formatItem(item: T): SourcesApiItem {
    return {
      type,
      id: idGetter(item),
      displayName: getDisplayName(item),
      added: getSourceAdded(getPath(item))
    };
  }

  function getAllFormated(): SourcesApi {
    return getAll().map(formatItem);
  }

  function del(arg: T): void {
    sourcesDb.del(getPath(arg));
  }

  /**
   * Deletes a source item by ID. This ID is given by `getAllFormated`
   * @param id "/apm-registry/dnp.dappnode.eth"
   */
  function delById(id: string): SourcesApiItem {
    const key = getPathById(id);
    const oldItem: T = sourcesDb.get(key);
    if (!oldItem) throw Error(`No ${type} found for id ${id}`);
    sourcesDb.del(key);
    return formatItem(oldItem);
  }

  return { set, getAll, getAllFormated, del, delById };
}

export const apmRegistry = dynamicSubKeyFactory<ApmRegistry>(
  sourceTypes.apmRegistry,
  registry => registry.name,
  registry => registry.name
);
export const apmDnpRepo = dynamicSubKeyFactory<ApmRepo>(
  sourceTypes.apmDnpRepo,
  repo => repo.name,
  repo => repo.name
);

/**
 * Data manipulation
 */
export function getRegistryChildRepos(id: string) {
  return apmDnpRepo.getAll().filter(repo => repo.fromRegistry === id);
}

/**
 * Store the `added` data as a separate object
 */
function getAddedKey(dbPath: string) {
  return [addedKey, dbPath.replace(/\./g, "")].join(".");
}
function sourceAdded(dbPath: string): void {
  const key = getAddedKey(dbPath);
  if (!sourcesDb.get(key)) sourcesDb.set(key, Date.now());
}
function getSourceAdded(dbPath: string): number {
  return sourcesDb.get(getAddedKey(dbPath));
}

/**
 * Temporal DB for keeping track of the apm processing versions
 */

export const apmProcessingVersion = dynamicSubKeyFactory<ApmVersion>(
  "apm-processing-version" as SourceType,
  version => `${version.name}-${version.version}`,
  version => `${version.name} @ ${version.version}`
);

// For API

export function getAllFormated(): SourcesApi {
  return [...apmRegistry.getAllFormated(), ...apmDnpRepo.getAllFormated()];
}
