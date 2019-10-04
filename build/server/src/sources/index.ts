import { omit } from "lodash";
import {
  PollSourceFunction,
  Source,
  SourceOwn,
  Asset,
  AssetOwn,
  SourcesAndAssetsToEdit
} from "../types";
import * as apmDnpRepo from "./apmDnpRepo";
import * as apmRegistry from "./apmRegistry";
import * as dweb from "./dweb";
import { parseType } from "../utils/multiname";
import { modifyState } from "../state";
import * as sourcesDb from "../sourcesDb";
import Logs from "../logs";
const logs = Logs(module);

interface Basic {
  multiname: string;
  from?: string;
}

const pollFunctions: { [type: string]: PollSourceFunction } = {
  [apmDnpRepo.type]: apmDnpRepo.poll,
  [apmRegistry.type]: apmRegistry.poll,
  [dweb.type]: dweb.poll
};

export async function pollSourcesSafe() {
  try {
    await pollSources();
  } catch (e) {
    logs.error(`Error on poll source loop: ${e.stack}`);
  }
}

export async function pollSources() {
  await modifyState(
    async (currentSources: Source[], currentAssets: Asset[]) => {
      return await pollSourcesReturnStateEdit({
        currentAssets,
        currentSources
      });
    }
  );
}

/**
 * Polls all sources and returns the state to be modified.
 * In case sources have to be removed, also reomves all
 * its child sources and assets recursively
 *
 * @returns State to be modified
 */
export async function pollSourcesReturnStateEdit({
  currentSources,
  currentAssets
}: {
  currentSources: Source[];
  currentAssets: Asset[];
}): Promise<SourcesAndAssetsToEdit> {
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
        return console.log(`Ignoring source, unknown type: ${multiname}`);

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
          internalState: sourcesDb.getPollInternalState(multiname)
        });

        sourcesDb.setPollInternalState(multiname, internalState);
        sourcesToAdd.push(...ownSourcesToAdd.map(markOwnSource));
        sourcesToRemove.push(...ownSourcesToRemove.map(markOwnSource));
        assetsToAdd.push(...ownAssetsToAdd.map(markOwnAsset));
        assetsToRemove.push(...ownAssetsToRemove.map(markOwnAsset));
      } catch (e) {
        logs.error(`Error polling source ${multiname}: ${e.stack}`);
      }
    })
  );

  return {
    sourcesToAdd,
    sourcesToRemove,
    assetsToAdd,
    assetsToRemove
  };
}
