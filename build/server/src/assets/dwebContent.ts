import { splitMultiname, joinMultiname } from "../utils/multiname";

export interface DwebContent {
  domain: string;
  blockNumber: number;
}

/**
 * Dweb content
 *
 * type:
 * `dweb-content`
 *
 * multiname structure:
 * `dweb-content/<domain>/<blockNumber>`
 */

export const type = "dweb-content";

export const parseMultiname = (multiname: string): DwebContent => {
  const [_type, domain, blockNumber] = splitMultiname(multiname);
  if (_type !== type) throw Error(`multiname must be of type: ${type}`);
  if (!domain) throw Error(`No "domain" in multiname: ${multiname}`);
  if (!blockNumber) throw Error(`No "blockNumber" in multiname: ${multiname}`);
  return { domain, blockNumber: parseInt(blockNumber) };
};

export const getMultiname = ({ domain, blockNumber }: DwebContent) => {
  return joinMultiname([type, domain, String(blockNumber)]);
};
