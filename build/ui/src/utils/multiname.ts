import { prettyRepoEns, prettyRegistryEns } from "./format";

const separator = "/";

function getDisplayName(type: string, parts: string[]): string {
  switch (type) {
    case "hash": {
      const [hash, label] = parts;
      return label || hash;
    }

    case "apm-repo-release-content": {
      const [name, version, filename] = parts;
      return `${prettyRepoEns(name)} - ${version} ${
        filename === "directory" ? "" : `(${filename})`
      }`;
    }

    case "dweb-content": {
      const [domain] = parts;
      return domain;
    }

    // Sources

    case "apm-repo": {
      const [name] = parts;
      return prettyRepoEns(name);
    }

    case "apm-registry": {
      const [name] = parts;
      return prettyRegistryEns(name);
    }

    default:
      return parts.join(" ");
  }
}

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
    .map(decodeURIComponent);

export const parseType = (multiname: string): string =>
  splitMultiname(multiname)[0];

export const parseTypeAndDisplayName = (
  multiname: string
): { type: string; displayName: string } => {
  const [type, ...parts] = splitMultiname(multiname);
  return {
    type,
    displayName: getDisplayName(type, parts)
  };
};
