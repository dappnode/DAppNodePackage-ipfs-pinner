import { assetTypes, AssetType } from "../types";

export const separator = "/";
export const apmTag = "apm";

interface ApmFileId {
  name: string;
  version: string;
  filename: string;
}

// Automatically remove the separator character from each field
const separatorSearch = new RegExp(separator, "g");
const removeSeparator = (str: string): string =>
  (str || "").replace(separatorSearch, "");

const joinFileId = (idParts: string[]): string =>
  idParts.map(removeSeparator).join(separator);

const splitFileId = (fileId: string): string[] => fileId.split(separator);

function multiNameFactory<T>(
  type: AssetType,
  idGetter: (arg: T) => string[],
  idParser: (parts: string[]) => T,
  getDisplayName: (arg: T) => string
) {
  function get(arg: T): string {
    return joinFileId([type, ...idGetter(arg)]);
  }
  function parse(multiname: string): T {
    const [_type, ...parts] = splitFileId(multiname);
    if (_type !== type) throw Error(`Invalid type ${_type}, expected ${type}`);
    return idParser(parts);
  }
  function parseDisplayName(multiname: string): string {
    return getDisplayName(parse(multiname));
  }
  return { get, parse, parseDisplayName };
}

/**
 * @returns Returns a CID style fileId:
 * "/apm-dnp-repo-file/admin.dnp.dappnode.eth/0.2.6/manifest"
 */
export const apmDnpRepoFile = multiNameFactory<ApmFileId>(
  assetTypes.apmDnpRepoFile,
  ({ name, version, filename }: ApmFileId): string[] => [
    name,
    version,
    filename
  ],
  ([name, version, filename]: string[]) => {
    if (!name) throw Error(`Missing name`);
    if (!version) throw Error(`Missing version`);
    if (!filename) throw Error(`Missing filename`);
    return { name, version, filename };
  },
  ({ name, version, filename }: ApmFileId): string =>
    `${name} @ ${version} - ${filename}`
);

const parsers = {
  [assetTypes.apmDnpRepoFile]: apmDnpRepoFile
};

export function parseType(multiname: string): AssetType {
  const [_type] = splitFileId(multiname);
  return _type as AssetType;
}

export function parseAssetTypeAndName(
  multiname: string
): { type: AssetType; displayName: string } {
  const type = parseType(multiname);
  if (!parsers[type]) throw Error(`Unknown type ${type}`);
  return {
    type,
    displayName: parsers[type].parseDisplayName(multiname)
  };
}
