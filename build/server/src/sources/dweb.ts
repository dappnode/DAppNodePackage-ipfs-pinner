import { PollSourceFunction, VerifySourceFunction, SourceAdd } from "../types";
import { splitMultiname, joinMultiname } from "../utils/multiname";
import fetchDweb from "../fetchers/fetchDweb";
import * as dwebContent from "../assets/dwebContent";
import fetchBlockNumber from "../fetchers/fetchBlockNumber";
import { normalizeIpfsHash } from "../utils/isIpfsHash";

/**
 * DWeb
 *
 * type:
 * `dweb`
 *
 * multiname structure:
 * `/dweb/decentralized.eth`
 */

export interface Dweb {
  domain: string;
}

export const type = "dweb";
export const label = "DWeb";
export const fields = [{ id: "domain", required: false, label: "ENS domain" }];

export const parseMultiname = (multiname: string): Dweb => {
  const [_type, domain] = splitMultiname(multiname);
  if (_type !== type) throw Error(`multiname must be of type: ${type}`);
  if (!domain) throw Error(`No "domain" in multiname: ${multiname}`);
  return { domain };
};

export const getMultiname = ({ domain }: Dweb): string => {
  if (!domain) throw Error(`Arg "domain" missing`);
  return joinMultiname([type, domain]);
};

export const verify: VerifySourceFunction = async function(source: SourceAdd) {
  const { domain } = parseMultiname(source.multiname);
  await fetchDweb(domain);
};

export const poll: PollSourceFunction = async function({
  source,
  currentOwnAssets
}) {
  const { domain } = parseMultiname(source.multiname);
  const hash = await fetchDweb(domain);

  const prevAsset = currentOwnAssets[0];

  if (hash && (!prevAsset || !isHashEqual(hash, prevAsset.hash))) {
    // Now, check which hash is more recent comparing the blockNumber
    const currentBlockNumber = await fetchBlockNumber();
    const prevBlockNumber = prevAsset
      ? dwebContent.parseMultiname(prevAsset.multiname).blockNumber
      : 0;
    if (currentBlockNumber > prevBlockNumber) {
      const newAsset = {
        multiname: dwebContent.getMultiname({
          domain,
          blockNumber: currentBlockNumber
        }),
        hash
      };
      return {
        assetsToAdd: [newAsset],
        assetsToRemove: currentOwnAssets
      };
    }
  }

  return {
    assetsToAdd: [],
    assetsToRemove: []
  };
};

/**
 * [UTIL]
 * Checks if IPFS hashes are equal in a more resilient way
 */
function isHashEqual(hash1: string, hash2: string): boolean {
  return normalizeIpfsHash(hash1) === normalizeIpfsHash(hash2);
}
