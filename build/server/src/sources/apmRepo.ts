import flatten from "lodash/flatten";
import semver from "semver";
import {
  PollSourceFunction,
  PollSourceFunctionArg,
  AssetOwn,
  Source,
  VerifySourceFunction
} from "../types";
import fetchNewApmVersions from "../fetchers/fetchNewApmVersions";
import fetchDnpIpfsReleaseAssets from "../fetchers/fetchDnpIpfsReleaseAssets";
import { splitMultiname, joinMultiname } from "../utils/multiname";
import * as apmRepoReleaseContent from "../assets/apmRepoReleaseContent";
import { timeoutErrorMessage } from "../ipfs";
import isIpfsHash from "../utils/isIpfsHash";
import resolveEnsDomain from "../fetchers/fetchEnsDomain";
import { checkIfContractIsRepo } from "../web3/checkIfContractIsRepo";
import logs from "../logs";

// Define somewhere else
const numOfVersions = 3;

/**
 * APM Repo
 *
 * type:
 * `apm-repo`
 *
 * multiname structure:
 * `/apm-repo/amazing.dnp.dappnode.eth`
 */

export interface ApmDnpRepo {
  name: string;
}

export const type = "apm-repo";
export const label = "APM repo";
export const placeholder = "Repo ENS";

export const parseMultiname = (multiname: string): ApmDnpRepo => {
  const [_type, name] = splitMultiname(multiname);
  if (_type !== type) throw Error(`multiname must be of type: ${type}`);
  if (!name) throw Error(`No "name" in multiname: ${multiname}`);
  return { name };
};

export const getMultiname = ({ name }: ApmDnpRepo): string => {
  return joinMultiname([type, name]);
};

export const verify: VerifySourceFunction = async function(source: Source) {
  const { name } = parseMultiname(source.multiname);
  // Resolve name first to separate errors
  const address = await resolveEnsDomain(name);
  try {
    await checkIfContractIsRepo(address);
  } catch (e) {
    logs.debug(`${name} is not an APM repo: `, e);
    throw Error(`${name} is not an APM repo (${e.message})`);
  }
};

export const poll: PollSourceFunction = async function({
  source,
  currentOwnAssets
}: PollSourceFunctionArg) {
  const { name } = parseMultiname(source.multiname);
  const latestVersions = await fetchNewApmVersions(name, numOfVersions);
  // Construct an object to check if the latest version are already here
  const currentAssetsByVersion = getAssetsByVersions(currentOwnAssets);

  const assetsToAdd: AssetOwn[] = [];
  await Promise.all(
    latestVersions.map(async ({ version, contentUri }) => {
      try {
        // Version has already been fetched
        if (currentAssetsByVersion[version]) return;

        // Ignore broken versions
        if (!isIpfsHash(contentUri)) return;

        const assets = await fetchDnpIpfsReleaseAssets(contentUri);
        assetsToAdd.push(
          ...assets.map(asset => ({
            multiname: apmRepoReleaseContent.getMultiname({
              name,
              version,
              filename: asset.filename
            }),
            hash: asset.hash
          }))
        );
      } catch (e) {
        // Ignore timeout errors silently
        if (e.message.includes(timeoutErrorMessage)) {
          logs.debug(e.message, { contentUri });
        } else {
          logs.error(`Error resolving release ${name} @ ${version}: `, e);
        }
      }
    })
  );

  // Remove old assets
  return computeAssetsToEdit(assetsToAdd, currentOwnAssets, numOfVersions);
};

/**
 * [UTIL] Compute the assets to remove, so there are only `numOfVersions`
 * versions at all times
 * exported for testing
 * @param assetsToAdd
 * @param assetsToRemove
 */
function computeAssetsToEdit(
  assetsToAdd: AssetOwn[],
  currentOwnAssets: AssetOwn[],
  numOfVersions: number
): { assetsToAdd: AssetOwn[]; assetsToRemove: AssetOwn[] } {
  // There is no overlap in versions, no need to diff the arrays
  const assetsToAddByVersion = getAssetsByVersions(assetsToAdd);
  const currentAssetsByVersion = getAssetsByVersions(currentOwnAssets);

  /**
   * Rules for seletion:
   * - Keep all new versions up to numOfVersions
   * - Remove all but the newest current version so the total num
   *   of versions is numOfVersions
   */
  const allVersionsToAdd = getVersionsDescendingOrder(assetsToAddByVersion);
  const currentVersions = getVersionsDescendingOrder(currentAssetsByVersion);
  const versionsToAdd = allVersionsToAdd.slice(0, numOfVersions);
  const versionsToRemove = currentVersions.slice(
    numOfVersions - versionsToAdd.length
  );

  return {
    assetsToAdd: flatten(
      versionsToAdd.map(version => assetsToAddByVersion[version])
    ),
    assetsToRemove: flatten(
      versionsToRemove.map(version => currentAssetsByVersion[version])
    )
  };
}

type AssetsByVersion = { [version: string]: AssetOwn[] };

/**
 * [UTIL] Get release assets organized by version
 * @returns: { "0.2.0": [asset1, asset2] }
 */
function getAssetsByVersions(assets: AssetOwn[]): AssetsByVersion {
  const assetsByVersion: AssetsByVersion = {};
  for (const asset of assets) {
    const { version } = apmRepoReleaseContent.parseMultiname(asset.multiname);
    assetsByVersion[version] = [...(assetsByVersion[version] || []), asset];
  }
  return assetsByVersion;
}

/**
 * [UTIL] Get a versions array in descending order
 * @returns ["0.2.4", "0.2.3", "0.2.2"]
 */
function getVersionsDescendingOrder(
  assetsByVersion: AssetsByVersion
): string[] {
  return Object.keys(assetsByVersion).sort(semver.rcompare);
}
