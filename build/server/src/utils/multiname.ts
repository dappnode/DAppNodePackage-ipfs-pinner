const separator = "/";

const separatorSearch = new RegExp(separator, "g");
const removeSeparator = (str: string): string =>
  (str || "").replace(separatorSearch, "");

export const joinMultiname = (parts: string[]): string =>
  parts
    .map(encodeURIComponent)
    .map(removeSeparator)
    .join(separator);

export const splitMultiname = (multiname: string): string[] =>
  multiname
    .replace(/^\/+|\/+$/g, "")
    .split(separator)
    .filter(p => p)
    .map(decodeURIComponent)
    .map(s => s.trim());

export const parseType = (multiname: string): string =>
  splitMultiname(multiname)[0];
