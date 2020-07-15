import * as eventBus from "../eventBus";
import { parseType } from "../utils/multiname";
import { logs } from "../logs";
import omit from "lodash/omit";
import throttle from "lodash/throttle";
import {
  PollSourceFunction,
  SourceOwn,
  Asset,
  AssetOwn,
  CacheState,
  StateChange,
  State,
  Source,
  SourceAdd,
  SourceOwnAdd,
  PollStatus,
  PollStatusObj
} from "../types";

// Throttle this function since it can be called very quickly
// and can trigger db writes and socket emits
const logPollStatus = throttle((pollStatus: PollStatus) => {
  eventBus.pollStatus.emit(pollStatus);
}, 200);

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
  const sourcesToAdd: SourceAdd[] = [];
  const sourcesToRemove: Source[] = [];
  const assetsToAdd: Asset[] = [];
  const assetsToRemove: Asset[] = [];

  // Report polling status to the UI
  const sourcePollStatus = currentSources.reduce(
    (obj: PollStatusObj, source) => {
      return { ...obj, [source.multiname]: { message: "", done: false } };
    },
    {}
  );
  const finishedPolling = (multiname: string): void => {
    sourcePollStatus[multiname].done = true;
    logPollStatus(sourcePollStatus);
  };
  logPollStatus(sourcePollStatus);

  await Promise.all(
    currentSources.map(async source => {
      const { multiname } = source;
      const type = parseType(multiname);

      // Ignore sources that are not supported
      if (!pollFunctions[type])
        return logs.debug("Ignoring source of unknown type", { multiname });

      // Aux methods to manipulate the from field
      /* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
      function getOwn<T extends Basic>(arr: T[]) {
        return arr
          .filter(({ from }) => from === multiname)
          .map(e => omit(e, "from"));
      }
      function markOwnSourceAdd(source: SourceOwnAdd): SourceAdd {
        return { ...source, from: multiname };
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
        sourcesToAdd.push(...ownSourcesToAdd.map(markOwnSourceAdd));
        sourcesToRemove.push(...ownSourcesToRemove.map(markOwnSource));
        assetsToAdd.push(...ownAssetsToAdd.map(markOwnAsset));
        assetsToRemove.push(...ownAssetsToRemove.map(markOwnAsset));
      } catch (e) {
        logs.error(`Error polling source ${multiname}: `, e);
      } finally {
        finishedPolling(multiname);
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

  logs.debug("Finished polling all sources", { stateChange });
  logPollStatus(undefined);

  return stateChange;
}
