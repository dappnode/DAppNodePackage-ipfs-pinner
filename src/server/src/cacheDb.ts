import path from "path";
import * as eventBus from "./eventBus";
import { dbFactory } from "./dbFactory";
import logs from "./logs";
import { CacheState, PollStatus } from "./types";

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
const pollStatusDb = db.simpleKeyFactory<PollStatus>("poll-status");

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

export function getPollStatus(): PollStatus {
  return pollStatusDb.get() || undefined;
}

eventBus.pollStatus.on(pollStatus => {
  pollStatusDb.set(pollStatus);
});
