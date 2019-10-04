const separator = "/";

const separatorSearch = new RegExp(separator, "g");
const removeSeparator = (str: string): string =>
  (str || "").replace(separatorSearch, "");

export const joinMultiname = (parts: string[]): string =>
  parts.map(removeSeparator).join(separator);

export const splitMultiname = (multiname: string): string[] =>
  multiname
    .replace(/^\/+|\/+$/g, "")
    .split(separator)
    .filter(p => p);

export const parseType = (multiname: string): string =>
  splitMultiname(multiname)[0];

export const parseTypeAndDisplayName = (
  multiname: string
): { type: string; displayName: string } => {
  const [type, ...parts] = splitMultiname(multiname);
  return {
    type,
    displayName: parts.join(" ")
  };
};
