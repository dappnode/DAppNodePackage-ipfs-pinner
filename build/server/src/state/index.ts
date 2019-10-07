import * as sourcesDb from "../sourcesDb";
import * as ipfsCluster from "../ipfsCluster";
import * as eventBus from "../eventBus";
import { SourcesAndAssetsToEdit, Source, Asset } from "../types";
import { addChildSourcesAndAssetsToRemove } from "./utils";
import logs from "../logs";

export async function modifyState(
  stateModifierFn: (
    currentSources: Source[],
    currentAssets: Asset[]
  ) => Promise<SourcesAndAssetsToEdit>
) {
  const currentSources = sourcesDb.getSources();
  const currentAssets = await ipfsCluster.getAssets();
  const stateChange = await stateModifierFn(currentSources, currentAssets);

  const stateChangeWithChild = addChildSourcesAndAssetsToRemove(
    stateChange,
    currentSources,
    currentAssets
  );

  await applyStateChange(stateChangeWithChild);

  /**
   * When new sources are added, poll them through an eventBus.
   * WATCH OUT FOR INFINITE LOOPS!
   * Consider passing an array of sources to poll so not every is re-polled multiple
   * times in recursive iterations
   */
  if (stateChangeWithChild.sourcesToAdd.length)
    eventBus.pollSources.emit(stateChangeWithChild.sourcesToAdd);

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
  assetsToRemove
}: SourcesAndAssetsToEdit) {
  await iterate(sourcesToAdd, sourcesDb.addSource, "removing source");
  await iterate(sourcesToRemove, sourcesDb.removeSource, "removing source");
  await iterate(assetsToAdd, ipfsCluster.addAsset, "pinning asset");
  await iterate(assetsToRemove, ipfsCluster.removeAsset, "unpinning asset");
}

/**
 * DRY, abstract the logging and looping away
 */
async function iterate<T extends Source, R>(
  items: T[],
  fn: (item: T) => Promise<R> | R,
  label: string
) {
  for (const item of items) {
    try {
      logs.info(`${label} ${item.multiname}...`);
      await fn(item);
    } catch (e) {
      logs.error(`Error ${label} ${JSON.stringify(item)}: `, e);
    }
  }
}

export {};
