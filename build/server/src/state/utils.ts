import mapKeys from "lodash/mapKeys";
import concat from "lodash/concat";
import uniqBy from "lodash/uniqBy";
import { Source, Asset, StateChange, State } from "../types";

interface Basic {
  multiname: string;
  from?: string;
}

/**
 * [UTIL] Recursively add all child sources and assets to remove
 */
export function addChildSourcesAndAssetsToRemove(
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
    assetsToAdd: uniqByMultiname(assetsToAdd),
    sourcesToAdd: uniqByMultiname(sourcesToAdd),
    sourcesToRemove: uniqByMultiname(sourcesToRemove),
    assetsToRemove: uniqByMultiname(assetsToRemove),
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

/**
 * [UTIL] Return a copy of unique elements of an array of objects
 * by the propery "name"
 */
export function uniqByMultiname<T extends Basic>(arr: T[]) {
  return uniqBy(arr, e => e.multiname);
}
