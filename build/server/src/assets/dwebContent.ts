import { splitMultiname, joinMultiname } from "../utils/multiname";

interface DwebContent {
  domain: string;
}

/**
 * Dweb content
 *
 * type:
 * `dweb-content`
 *
 * multiname structure:
 * `dweb-content/<domain>`
 */

export const type = "dweb-content";

export const parseMultiname = (multiname: string): DwebContent => {
  const [_type, domain] = splitMultiname(multiname);
  if (_type !== type) throw Error(`multiname must be of type: ${type}`);
  if (!domain) throw Error(`No "domain" in multiname: ${multiname}`);
  return { domain };
};

export const getMultiname = ({ domain }: DwebContent) => {
  return joinMultiname([type, domain]);
};
