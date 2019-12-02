import { splitMultiname, joinMultiname } from "../utils/multiname";

interface RegularHash {
  label: string;
}

/**
 * Regular hash associated asset
 *
 * type:
 * `hash-content`
 *
 * multiname structure:
 * `hash-content/<label>`
 */

export const type = "hash-content";

export const parseMultiname = (multiname: string): RegularHash => {
  const [_type, label] = splitMultiname(multiname);
  if (_type !== type) throw Error(`multiname must be of type: ${type}`);
  if (!label) throw Error(`No "label" in multiname: ${multiname}`);
  return { label };
};

export const getMultiname = ({ label }: RegularHash): string => {
  return joinMultiname([type, label]);
};
