import * as sourcesDb from "../sourcesDb";
import { verifyFunctions } from "../sources";
import { Source } from "../types";
import { modifyState } from "../state";
import { parseType } from "../utils/multiname";

/**
 * @param type "apm-registry"
 * @param name Must contain all data necessary to identify this source type
 */
export async function addSource(sourceMultiname: string): Promise<void> {
  if (!sourceMultiname) throw Error(`Arg sourceMultiname required`);

  // Add an ID referencing the user
  const source = { multiname: sourceMultiname, from: `user/userId` };

  // Verify that the source exists
  const type = parseType(sourceMultiname);
  if (!verifyFunctions[type]) throw Error(`Source type not supported: ${type}`);
  await verifyFunctions[type](source);

  await modifyState(async () => {
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
