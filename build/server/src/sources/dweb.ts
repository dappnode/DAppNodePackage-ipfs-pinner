import { PollSourceFunction, VerifySourceFunction, Source } from "../types";
import { splitMultiname, joinMultiname } from "../utils/multiname";
import fetchDweb from "../fetchers/fetchDweb";
import * as dwebContent from "../assets/dwebContent";

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

export const verify: VerifySourceFunction = async function(source: Source) {
  const { domain } = parseMultiname(source.multiname);
  await fetchDweb(domain);
};

export const poll: PollSourceFunction = async function({
  source,
  currentOwnAssets
}) {
  const { domain } = parseMultiname(source.multiname);
  const hash = await fetchDweb(domain);
  if (hash && hash !== (currentOwnAssets[0] || {}).hash)
    return {
      assetsToAdd: [{ multiname: dwebContent.getMultiname({ domain }), hash }],
      assetsToRemove: currentOwnAssets
    };
  else return {};
};
