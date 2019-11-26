import * as ipfsCluster from "../ipfsCluster";
import * as cacheDb from "../cacheDb";
import * as eventBus from "../eventBus";
import { StateChange, Source, State } from "../types";
import { addChildSourcesAndAssetsToRemove } from "./utils";
import stringify from "json-stringify-safe";
import logs from "../logs";

export async function modifyState(
  stateModifierFn: (state: State) => Promise<StateChange>
) {
  const state: State = {
    sources: await ipfsCluster.getSources(),
    assets: await ipfsCluster.getAssets(),
    cache: cacheDb.getInternalCache()
  };

  const stateChange = await stateModifierFn(state);

  const stateChangeWithChild = addChildSourcesAndAssetsToRemove(
    stateChange,
    state
  );

  await applyStateChange(stateChangeWithChild);

  /**
   * When new sources are added, poll them through an eventBus.
   * WATCH OUT FOR INFINITE LOOPS!
   * Consider passing an array of sources to poll so not every is re-polled multiple
   * times in recursive iterations
   */
  if (stateChangeWithChild.sourcesToAdd.length) eventBus.pollSources.emit([]);

  if (
    stateChangeWithChild.sourcesToAdd.length ||
    stateChangeWithChild.sourcesToRemove.length
  )
    eventBus.sourcesChanged.emit();

  if (
    stateChangeWithChild.sourcesToAdd.length ||
    stateChangeWithChild.sourcesToRemove.length ||
    stateChangeWithChild.assetsToAdd.length ||
    stateChangeWithChild.assetsToRemove.length
  )
    eventBus.assetsChanged.emit();
}

async function applyStateChange({
  sourcesToAdd,
  sourcesToRemove,
  assetsToAdd,
  assetsToRemove,
  cacheChange
}: StateChange) {
  await iterate(sourcesToAdd, cacheDb.addSource, "add source");
  await iterate(sourcesToRemove, cacheDb.removeSource, "remove source");
  await iterate(assetsToAdd, ipfsCluster.addAsset, "pin asset");
  await iterate(assetsToRemove, ipfsCluster.removeAsset, "unpin asset");
  cacheDb.mergeInternalCache(cacheChange);
}

/**
 * DRY, abstract the logging and looping away
 */
async function iterate<T extends Source, R>(
  items: T[],
  fn: (item: T) => Promise<R> | R,
  label: string
) {
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
