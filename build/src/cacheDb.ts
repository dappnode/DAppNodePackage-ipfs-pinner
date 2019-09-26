import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { ApmRegistry, ApmRepo } from "./types";

const adapter = new FileSync("cachedb.json");
const db = low(adapter);

interface CacheDb {
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
const cleanId = (str: string): string => str.replace(/[^A-Z0-9]+/gi, "-");

/**
 * Creates an object of methods for dynamic sub-keys
 * @param rootPath "apm.registry"
 * @param idGetter must return a locally unique id for this asset type
 */
function dynamicSubKeyFactory<T>(
  rootPath: string,
  idGetter: (arg: T) => string
) {
  const getPath = (arg: T) => [rootPath, cleanId(idGetter(arg))].join(".");
  return {
    has: (arg: T): boolean => Boolean(db.get(getPath(arg)).value()),
    set: (arg: T): void => db.set(getPath(arg), arg).write(),
    getAll: (): T[] => Object.values(db.get(rootPath).value())
  };
}

export const apmRegistry = dynamicSubKeyFactory<ApmRegistry>(
  "apm.registry",
  registry => registry.name
);
export const apmRepo = dynamicSubKeyFactory<ApmRepo>(
  "apm.repo",
  repo => repo.name
);
