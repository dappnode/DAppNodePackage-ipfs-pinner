import mapKeys from "lodash/mapKeys";
import concat from "lodash/concat";
import uniqBy from "lodash/uniqBy";
import differenceBy from "lodash/differenceBy";
import { Source, Asset, StateChange, State } from "../types";
import { parseType } from "../utils/multiname";
import { pipe } from "../utils/functions";

/**
 * MUST return a unique string for EVERY asset
 */
const assetId = ({ multiname }: { multiname: string }): string => multiname;
/**
 * MUST return a unique string for EVERY source
 */
const sourceId = ({ multiname }: { multiname: string }): string => multiname;
/**
 * If a source if from a user input or not
 */
const isUserSource = ({ from = "" }): boolean => parseType(from) === "user";

/**
 * - Remove child sources and child assets
 * - Compute the upstream state change if any and drop
 *   stateChange that are related to that change
 */
export function processStateChange({
  stateChange,
  prevState,
  nextState
}: {
  stateChange: StateChange;
  prevState: State;
  nextState: State;
}): StateChange {
  return pipe(
    (arg: StateChange) => addChildNodesToRemove(arg, prevState),
    (arg: StateChange) => removeAssetsWithoutUserParent(arg, nextState)
  )(stateChange);
}

interface BasicItem {
  from: string;
  multiname: string;
}

/**
 * Only keep items if
 *
 * sourcesToAdd:
 *  - If parent is still there
 *  - If it is not being removed
 * sourcesToRemove:
 *  - If parent is still there
 *  - If it is not being added
 * assetsToAdd:
 *  - If parent is still there
 *  - If it is not being removed
 * assetsToRemove:
 *  - If parent is still there
 *  - If it is not being added
 */
function removeAssetsWithoutUserParent(
  {
    sourcesToAdd,
    sourcesToRemove,
    assetsToAdd,
    assetsToRemove,
    ...other
  }: StateChange,
  nextState: State
): StateChange {
  const byHasUserParent = (item: BasicItem): boolean =>
    Boolean(getUserParent(item, nextState));
  return {
    ...other,
    sourcesToAdd: sourcesToAdd.filter(byHasUserParent),
    sourcesToRemove: sourcesToRemove.filter(byHasUserParent),
    assetsToAdd: assetsToAdd.filter(byHasUserParent),
    assetsToRemove: assetsToRemove.filter(byHasUserParent)
  };
}

export function getUserParent(
  item: BasicItem | undefined,
  state: State
): string | undefined {
  if (!item || !item.from) return;
  if (isUserSource(item)) return item.from;
  return getUserParent(
    state.sources.find(source => source.multiname === item.from),
    state
  );
}

/**
 * lodash.difference reference / demo
 * returns the elements that are no longer in the first argument
 * _.difference([1,2], [2,3]) = [1]
 * _.difference([2,3], [1,2]) = [3]
 */

/**
 * Computes assets changed from state 1 to 2
 */
export function computeAssetsChange(s1: State, s2: State): Asset[] {
  return differenceBy(s1.assets, s2.assets, assetId);
}

/**
 * Computes sources changed from state 1 to 2
 * [NOTE]: "multiname" property MUST be unique
 */
export function computeSourcesChange(s1: State, s2: State): Source[] {
  return differenceBy(s1.sources, s2.sources, sourceId);
}

/**
 * Computes state change from two states
 */
export function computeStateChange(
  prevState: State,
  nextState: State
): StateChange {
  return {
    sourcesToAdd: computeSourcesChange(nextState, prevState),
    sourcesToRemove: computeSourcesChange(prevState, nextState),
    assetsToAdd: computeAssetsChange(nextState, prevState),
    assetsToRemove: computeAssetsChange(prevState, nextState),
    cacheChange: {}
  };
}

/**
 * [UTIL] Recursively add all child sources and assets to remove
 */
export function addChildNodesToRemove(
  { sourcesToRemove, assetsToRemove, assetsToAdd, sourcesToAdd }: StateChange,
  { sources, assets }: State
): StateChange {
  // Recursively find all child sources of the sources to remove and add them
  const childSourcesToRemove = getChildSources(sourcesToRemove, sources);
  sourcesToRemove.push(...childSourcesToRemove);

  // Also, find the child assets of the sources to remove and remove them
  const childAssetsToRemove = getChildAssets(sourcesToRemove, assets);
  assetsToRemove.push(...childAssetsToRemove);

  // Make sure there are no duplicated sources or assets, they can be added
  // in ovelapping fetches or in the recursive getChilds function
  return {
    sourcesToAdd: uniqBy(sourcesToAdd, sourceId),
    sourcesToRemove: uniqBy(sourcesToRemove, sourceId),
    assetsToAdd: uniqBy(assetsToAdd, assetId),
    assetsToRemove: uniqBy(assetsToRemove, assetId),
    cacheChange: {}
  };
}

/**
 * [UTIL] Recursively find all child sources and child assets of
 * a source array recursively
 */
function getChildSources(
  sourcesToRemove: Source[],
  sources: Source[]
): Source[] {
  const parentNames = mapKeys(sourcesToRemove, source => source.multiname);
  const childSources = sources.filter(({ from }) => parentNames[from]);
  return concat(
    childSources,
    childSources.length ? getChildSources(childSources, sources) : []
  );
}

/**
 * [UTIL] Find all child assets of an array of sources
 */
function getChildAssets(sourcesToRemove: Source[], assets: Asset[]): Asset[] {
  const parentNames = mapKeys(sourcesToRemove, source => source.multiname);
  return assets.filter(({ from }) => parentNames[from]);
}
