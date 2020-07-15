import flatten from "lodash/flatten";
import semver from "semver";
import {
  PollSourceFunction,
  PollSourceFunctionArg,
  AssetOwn,
  VerifySourceFunction,
  SourceAdd
} from "../types";
import fetchNewApmVersions from "../fetchers/fetchNewApmVersions";
import fetchDnpIpfsReleaseAssets, {
  BrokenManifestError
} from "../fetchers/fetchDnpIpfsReleaseAssets";
import { splitMultiname, joinMultiname } from "../utils/multiname";
import * as apmRepoReleaseContent from "../assets/apmRepoReleaseContent";
import { timeoutErrorMessage } from "../ipfs";
import isIpfsHash from "../utils/isIpfsHash";
import resolveEnsDomain from "../fetchers/fetchEnsAddress";
import { checkIfContractIsRepo } from "../web3/checkIfContractIsRepo";
import { logs } from "../logs";
import { knownLastBrokenVersions } from "../params";

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
export const fields = [{ id: "name", required: true, label: "Repo ENS" }];

export const parseMultiname = (multiname: string): ApmDnpRepo => {
  const [_type, name] = splitMultiname(multiname);
  if (_type !== type) throw Error(`multiname must be of type: ${type}`);
  if (!name) throw Error(`No "name" in multiname: ${multiname}`);
  return { name };
};

export const getMultiname = ({ name }: ApmDnpRepo): string => {
  if (!name) throw Error(`Arg "name" missing`);
  return joinMultiname([type, name]);
};

export const verify: VerifySourceFunction = async function(source: SourceAdd) {
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
  currentOwnAssets,
  internalState: brokenVersionsString
}: PollSourceFunctionArg) {
  const { name } = parseMultiname(source.multiname);
  const latestVersions = await fetchNewApmVersions(name, numOfVersions);
  // Construct an object to check if the latest version are already here
  const currentAssetsByVersion = getAssetsByVersions(currentOwnAssets);
  // Parse broken versions object
  const brokenVersions = parseBrokenVersions(brokenVersionsString);

  const assetsToAdd: AssetOwn[] = [];
  await Promise.all(
    latestVersions.map(async ({ version, contentUri }) => {
      try {
        // Version has already been fetched
        if (currentAssetsByVersion[version]) return;

        // Ignore broken versions
        if (
          // Malformed hashes
          !isIpfsHash(contentUri) ||
          // Hardcoded, known broken versions
          (knownLastBrokenVersions[name] &&
            !semver.gt(version, knownLastBrokenVersions[name])) ||
          // Dynamically found broken versions
          brokenVersions[contentUri]
        )
          return;

        logs.debug(`Found new version ${name} ${version}, resolving...`);

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

        logs.debug(`Resolved assets of version ${name} ${version}`);
      } catch (e) {
        // Ignore timeout errors silently
        if (e.message.includes(timeoutErrorMessage)) {
          logs.debug(e.message, { contentUri });
        } else if (e instanceof BrokenManifestError) {
          logs.debug(
            `Ignoring release ${name} @ ${version}, broken manifest e.message`,
            { contentUri }
          );
          brokenVersions[contentUri] = true;
        } else {
          logs.error(`Error resolving release ${name} @ ${version}: `, e);
        }
      }
    })
  );

  // Remove old assets
  return {
    ...computeAssetsToEdit(assetsToAdd, currentOwnAssets, numOfVersions),
    internalState: stringifyBrokenVersions(brokenVersions)
  };
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
   * Compute the latest n versions, which will be kept
   * - Then, add the new versions found in this array
   * - Remove current versions NOT found in this array
   */
  const versionsToKeep = Object.keys({
    ...assetsToAddByVersion,
    ...currentAssetsByVersion
  })
    .sort(semver.rcompare)
    .slice(0, numOfVersions);

  return {
    assetsToAdd: flatten(
      Object.keys(assetsToAddByVersion)
        .filter(version => versionsToKeep.includes(version))
        .sort(semver.rcompare)
        .map(version => assetsToAddByVersion[version])
    ),
    assetsToRemove: flatten(
      Object.keys(currentAssetsByVersion)
        .filter(version => !versionsToKeep.includes(version))
        .sort(semver.rcompare)
        .map(version => currentAssetsByVersion[version])
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

interface BrokenVersions {
  [contentUri: string]: boolean;
}

function parseBrokenVersions(s: string): BrokenVersions {
  try {
    if (!s) return {};
    return JSON.parse(s);
  } catch (e) {
    logs.warn(`Error parsing brokenVersions of apmRepo: ${e.message}`);
    return {};
  }
}

function stringifyBrokenVersions(brokenVersions: BrokenVersions): string {
  try {
    return JSON.stringify(brokenVersions);
  } catch (e) {
    logs.warn(`Error stringifying brokenVersions of apmRepo: ${e.message}`);
    return JSON.stringify({});
  }
}
