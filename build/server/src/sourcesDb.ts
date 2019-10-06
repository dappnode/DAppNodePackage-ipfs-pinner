import omit from "lodash/omit";
import { dbFactory } from "./dbFactory";
import { Source, SourceWithMetadata } from "./types";

const db = dbFactory("sourcesdb.json");

interface SourcesDb {
  sources: {
    [subPath: string]: SourceWithMetadata;
  };
}

/**
 * Create binded DB instances so everything is typed
 */

const sourceIdGetter = (source: { multiname: string }) => source.multiname;
const sourcesDb = db.dynamicSubKeyFactory<SourceWithMetadata>(
  "sources",
  sourceIdGetter
);

const pollInternalStateDb = db.simpleDynamicSubKeyFactory<string>(
  "poll-internal-state"
);

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
