import { PollSourceFunction, VerifySourceFunction, SourceAdd } from "../types";
import { splitMultiname, joinMultiname } from "../utils/multiname";
import isIpfsHash, { normalizeIpfsHash } from "../utils/isIpfsHash";
import * as regularHash from "../assets/regularHash";

/**
 * Regular IPFS hash
 *
 * type:
 * `hash`
 *
 * multiname structure:
 * `/hash/<hash>/<label>`
 */

export interface HashSource {
  hash: string;
  label: string;
}

export const type = "hash";
export const label = "Hash";
export const fields = [
  { id: "hash", required: true, label: "IPFS hash" },
  { id: "label", required: true, label: "Label or name" }
];

export const parseMultiname = (multiname: string): HashSource => {
  const [_type, hash, label] = splitMultiname(multiname);
  if (_type !== type) throw Error(`multiname must be of type: ${type}`);
  if (!hash) throw Error(`No "hash" in multiname: ${multiname}`);
  if (!label) throw Error(`No "label" in multiname: ${multiname}`);
  return { hash, label };
};

export const getMultiname = ({ hash, label }: HashSource): string => {
  if (!hash) throw Error(`Arg "hash" missing`);
  if (!label) throw Error(`Arg "label" missing`);
  return joinMultiname([type, hash, label]);
};

export const verify: VerifySourceFunction = async function(source: SourceAdd) {
  const { hash } = parseMultiname(source.multiname);
  if (!isIpfsHash(hash)) throw Error(`Invalid IPFS hash: ${hash}`);
};

export const poll: PollSourceFunction = async function({
  source,
  currentOwnAssets
}) {
  if (!currentOwnAssets.length) {
    const { hash: multihash, label } = parseMultiname(source.multiname);
    const hash = normalizeIpfsHash(multihash);
    return {
      assetsToAdd: [
        {
          multiname: regularHash.getMultiname({ label }),
          hash
        }
      ]
    };
  } else {
    return {};
  }
};
