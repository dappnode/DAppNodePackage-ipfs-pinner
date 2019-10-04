import * as sourcesDb from "../sourcesDb";
import { Source } from "../types";
import { modifyState } from "../state";

/**
 * @param type "apm-registry"
 * @param name Must contain all data necessary to identify this source type
 */
export async function addSource(sourceMultiname: string): Promise<void> {
  if (!sourceMultiname) throw Error(`Arg sourceMultiname required`);

  await modifyState(async () => {
    const source = { multiname: sourceMultiname, from: `user/userId` };
    return {
      sourcesToAdd: [source],
      sourcesToRemove: [],
      assetsToAdd: [],
      assetsToRemove: []
    };
  });
}

/**
 * @param type "apm-registry"
 * @param id ID is given by `getAllFormated`, "dnp.dappnode.eth"
 */
export async function deleteSource(sourceMultiname: string): Promise<void> {
  if (!sourceMultiname) throw Error(`Arg sourceMultiname required`);

  await modifyState(async (currentSources: Source[]) => {
    const source = currentSources.find(
      ({ multiname }) => multiname === sourceMultiname
    );
    if (!source) throw Error(`Source ${sourceMultiname} not found`);
    return {
      sourcesToAdd: [],
      sourcesToRemove: [source],
      assetsToAdd: [],
      assetsToRemove: []
    };
  });
}

export function getSources() {
  return sourcesDb.getSourcesWithMetadata();
}
