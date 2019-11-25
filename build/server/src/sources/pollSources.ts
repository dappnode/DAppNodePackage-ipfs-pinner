import omit from "lodash/omit";
import {
  PollSourceFunction,
  Source,
  SourceOwn,
  Asset,
  AssetOwn,
  CacheState,
  StateChange,
  State
} from "../types";
import { parseType } from "../utils/multiname";
import * as sourcesDb from "../cacheDb";
import logs from "../logs";

interface Basic {
  multiname: string;
  from?: string;
}

/**
 * Polls all sources and returns the state to be modified.
 * In case sources have to be removed, also reomves all
 * its child sources and assets recursively
 *
 * @returns State to be modified
 */
export async function pollSourcesReturnStateChange(
  pollFunctions: { [type: string]: PollSourceFunction },
  { sources: currentSources, assets: currentAssets, cache: currentCache }: State
): Promise<StateChange> {
  const cacheChange: CacheState = {};
  const sourcesToAdd: Source[] = [];
  const sourcesToRemove: Source[] = [];
  const assetsToAdd: Asset[] = [];
  const assetsToRemove: Asset[] = [];

  await Promise.all(
    currentSources.map(async source => {
      const { multiname } = source;
      const type = parseType(multiname);

      // Ignore sources that are not supported
      if (!pollFunctions[type])
        return logs.debug("Ignoring source of unknown type", { multiname });

      // Aux methods to manipulate the from field
      function getOwn<T extends Basic>(arr: T[]) {
        return arr
          .filter(({ from }) => from === multiname)
          .map(e => omit(e, "from"));
      }
      function markOwnSource(source: SourceOwn): Source {
        return { ...source, from: multiname };
      }
      function markOwnAsset(source: AssetOwn): Asset {
        return { ...source, from: multiname };
      }

      try {
        const {
          sourcesToAdd: ownSourcesToAdd = [],
          sourcesToRemove: ownSourcesToRemove = [],
          assetsToAdd: ownAssetsToAdd = [],
          assetsToRemove: ownAssetsToRemove = [],
          internalState = ""
        } = await pollFunctions[type]({
          source,
          currentOwnSources: getOwn(currentSources),
          currentOwnAssets: getOwn(currentAssets),
          internalState: currentCache[multiname] || ""
        });

        logs.debug("Successfully polled", { multiname });

        cacheChange[multiname] = internalState;
        sourcesToAdd.push(...ownSourcesToAdd.map(markOwnSource));
        sourcesToRemove.push(...ownSourcesToRemove.map(markOwnSource));
        assetsToAdd.push(...ownAssetsToAdd.map(markOwnAsset));
        assetsToRemove.push(...ownAssetsToRemove.map(markOwnAsset));
      } catch (e) {
        logs.error(`Error polling source ${multiname}: `, e);
      }
    })
  );

  const stateChange = {
    cacheChange,
    sourcesToAdd,
    sourcesToRemove,
    assetsToAdd,
    assetsToRemove
  };

  logs.debug("Finished polling all sources", stateChange);

  return stateChange;
}
