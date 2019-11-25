import * as ipfsCluster from "../ipfsCluster";
import { verifyFunctions, getMultinameFunctions } from "../sources";
import { SourceTypeAndInputs, State } from "../types";
import { modifyState } from "../state";

/**
 * @param type "apm-registry"
 * @param name Must contain all data necessary to identify this source type
 */
export async function addSource(
  inputsAndType: SourceTypeAndInputs
): Promise<void> {
  if (!inputsAndType) throw Error(`Arg inputsAndType required`);
  if (typeof inputsAndType !== "object")
    throw Error(`Arg inputsAndType must be an object`);

  const { type, ...inputs } = inputsAndType;

  // Verify that the source exists
  if (!verifyFunctions[type]) throw Error(`Source type not supported: ${type}`);

  // Get source multiname
  const sourceMultiname = getMultinameFunctions[type](inputs);

  // Add an ID referencing the user
  const source = { multiname: sourceMultiname, from: `user/userId` };

  await verifyFunctions[type](source);

  await modifyState(async () => {
    return {
      sourcesToAdd: [source],
      sourcesToRemove: [],
      assetsToAdd: [],
      assetsToRemove: [],
      cacheChange: {}
    };
  });
}

/**
 * @param type "apm-registry"
 * @param id ID is given by `getAllFormated`, "dnp.dappnode.eth"
 */
export async function deleteSource(sourceMultiname: string): Promise<void> {
  if (!sourceMultiname) throw Error(`Arg sourceMultiname required`);

  await modifyState(async ({ sources }: State) => {
    const source = sources.find(
      ({ multiname }) => multiname === sourceMultiname
    );
    if (!source) throw Error(`Source ${sourceMultiname} not found`);
    return {
      sourcesToAdd: [],
      sourcesToRemove: [source],
      assetsToAdd: [],
      assetsToRemove: [],
      cacheChange: {}
    };
  });
}

export function getSources() {
  return ipfsCluster.getSourcesWithMetadata();
}
