import * as ipfsCluster from "../ipfsCluster";
import * as cacheDb from "../cacheDb";
import * as eventBus from "../eventBus";
import { StateChange, State } from "../types";
import { processStateChange } from "./utils";
import stringify from "json-stringify-safe";
import { logs } from "../logs";

export async function modifyState(
  stateModifierFn: (state: State) => Promise<StateChange>
): Promise<void> {
  const prevState = await getState();

  const stateChangeIntent = await stateModifierFn(prevState);

  /**
   * - Remove child sources and child assets
   * - Compute the upstream state change if any and drop
   *   stateChange that are related to that change
   *
   * [MAYBE]: Make sure the state has not changed before updating
   * Or don't commit this state changes
   */
  const stateChange = processStateChange({
    stateChange: stateChangeIntent,
    prevState,
    nextState: await getState()
  });

  // Make sure the sources to remove have a hash
  logs.debug("Applying state change", { stateChange });
  await applyStateChange(stateChange);

  /**
   * When new sources are added, poll them through an eventBus.
   * WATCH OUT FOR INFINITE LOOPS!
   * Consider passing an array of sources to poll so not every is re-polled multiple
   * times in recursive iterations
   */
  if (stateChange.sourcesToAdd.length) eventBus.pollSources.emit([]);

  if (stateChange.sourcesToAdd.length || stateChange.sourcesToRemove.length)
    eventBus.sourcesChanged.emit();

  if (
    stateChange.sourcesToAdd.length ||
    stateChange.sourcesToRemove.length ||
    stateChange.assetsToAdd.length ||
    stateChange.assetsToRemove.length
  )
    eventBus.assetsChanged.emit();
}

async function getState(): Promise<State> {
  const {
    sourcesWithMetadata,
    assets
  } = await ipfsCluster.getAssetsAndSources();
  return {
    sources: sourcesWithMetadata,
    assets,
    cache: cacheDb.getInternalCache()
  };
}

async function applyStateChange({
  sourcesToAdd,
  sourcesToRemove,
  assetsToAdd,
  assetsToRemove,
  cacheChange
}: StateChange): Promise<void> {
  await iterate(sourcesToAdd, ipfsCluster.addSource, "add source");
  await iterate(sourcesToRemove, ipfsCluster.removeSource, "remove source");
  await iterate(assetsToAdd, ipfsCluster.addAsset, "pin asset");
  await iterate(assetsToRemove, ipfsCluster.removeAsset, "unpin asset");
  cacheDb.mergeInternalCache(cacheChange);
}

/**
 * DRY, abstract the logging and looping away
 */
async function iterate<T extends { multiname: string }, R>(
  items: T[],
  fn: (item: T) => Promise<R> | R,
  label: string
): Promise<void> {
  await Promise.all(
    items.map(async item => {
      try {
        await fn(item);
        logs.info(`${label} ${item.multiname}`);
      } catch (e) {
        logs.error(`Error on ${label} ${stringify(item)}: `, e);
      }
    })
  );
}

export {};
