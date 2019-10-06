import * as sourcesDb from "../sourcesDb";
import * as ipfsCluster from "../ipfsCluster";
import * as eventBus from "../eventBus";
import { SourcesAndAssetsToEdit, Source, Asset } from "../types";
import { addChildSourcesAndAssetsToRemove } from "./utils";
import Logs from "../logs";
const logs = Logs(module);

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
  for (const source of sourcesToAdd) {
    try {
      logs.info(`Adding source ${source.multiname}`);
      sourcesDb.addSource(source);
    } catch (e) {
      logs.error(`Error adding source ${JSON.stringify(source)}: ${e.stack}`);
    }
  }

  for (const source of sourcesToRemove) {
    try {
      logs.info(`Removing source ${source.multiname}`);
      sourcesDb.removeSource(source);
    } catch (e) {
      logs.error(`Error removing source ${JSON.stringify(source)}: ${e.stack}`);
    }
  }

  for (const asset of assetsToAdd) {
    try {
      logs.info(`Pinning ${asset.multiname}...`);
      await ipfsCluster.addAsset(asset);
    } catch (e) {
      logs.error(`Error pinning ${JSON.stringify(asset)}: ${e.stack}`);
    }
  }

  for (const asset of assetsToRemove) {
    try {
      logs.info(`Pinning ${asset.multiname}...`);
      await ipfsCluster.removeAsset(asset);
    } catch (e) {
      logs.error(`Error unpinning ${JSON.stringify(asset)}: ${e.stack}`);
    }
  }
}

export {};
