import { PollSourceFunction } from "../types";
import { splitMultiname, joinMultiname } from "../utils/multiname";
import fetchDweb from "../fetchers/fetchDweb";

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

export const parseMultiname = (multiname: string): Dweb => {
  const [_type, domain] = splitMultiname(multiname);
  return { domain };
};

export const getMultiname = ({ domain }: Dweb): string => {
  return joinMultiname([type, domain]);
};

export const poll: PollSourceFunction = async function({
  source,
  currentOwnAssets
}) {
  const { domain } = parseMultiname(source.multiname);
  const hash = await fetchDweb(domain);
  if (hash !== (currentOwnAssets[0] || {}).hash)
    return {
      assetsToAdd: [{ multiname: `dweb-content/${source.multiname}`, hash }],
      assetsToRemove: currentOwnAssets
    };
  else return {};
};
