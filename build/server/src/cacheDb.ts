import path from "path";
import { dbFactory } from "./dbFactory";
import { omit } from "lodash";
import logs from "./logs";
import { CacheState, SourceWithMetadata, Source } from "./types";

const cacheDbPath = path.join(process.env.DATA_PATH || ".", "cachedb.json");
logs.info("Starting cache DB", { cacheDbPath });

const db = dbFactory(cacheDbPath);

/**
 * Create binded DB instances so everything is typed
 */

const pollInternalStateDb = db.simpleDynamicSubKeyFactory<string>(
  "poll-internal-state"
);
const cacheStateDb = db.simpleKeyFactory<CacheState>("cache-state");

const sourceIdGetter = (source: { multiname: string }) => source.multiname;
const sourcesDb = db.dynamicSubKeyFactory<SourceWithMetadata>(
  "sources",
  sourceIdGetter
);

/**
 * Internal state for the poll functions
 * - Basic set / get in a static root path
 */

export function setPollInternalState(multiname: string, state: string): void {
  pollInternalStateDb.set(multiname, state);
}

export function getPollInternalState(multiname: string): string {
  return pollInternalStateDb.get(multiname);
}

export function getInternalCache(): CacheState {
  return cacheStateDb.get() || {};
}

export function mergeInternalCache(cacheChange: CacheState): void {
  return cacheStateDb.set({ ...cacheStateDb.get(), ...cacheChange });
}

export function addSource(source: Source): void {
  const sourceWithMetadata = {
    ...source,
    added: Date.now()
  };
  if (!sourcesDb.has(sourceWithMetadata)) sourcesDb.set(sourceWithMetadata);
}

export function removeSource(source: Source): void {
  sourcesDb.del(sourceIdGetter(source));
  // Also remove its internal state
  pollInternalStateDb.del(source.multiname);
}

export function getSources(): Source[] {
  return sourcesDb
    .getAll()
    .map(sourceWithMetadata => omit(sourceWithMetadata, ["added"]));
}

export function getSourcesWithMetadata(): SourceWithMetadata[] {
  return sourcesDb.getAll();
}
