export const separator = "/";
export const apmTag = "apm";

interface ApmFileId {
  name: string;
  version: string;
  file: string;
}

// Automatically remove the separator character from each field
const separatorSearch = new RegExp(separator, "g");
const removeSeparator = (str: string): string =>
  (str || "").replace(separatorSearch, "");

const joinFileId = (idParts: string[]): string =>
  idParts.map(removeSeparator).join(separator);

const splitFileId = (fileId: string): string[] => fileId.split(separator);

/**
 * @returns Returns a CID style fileId:
 * "/apm/admin.dnp.dappnode.eth/0.2.6/manifest"
 */
export function getApmFileId({ name, version, file }: ApmFileId): string {
  return joinFileId([apmTag, name, version, file]);
}

/**
 * Parses an APM file ID
 * @param fileId "/apm/admin.dnp.dappnode.eth/0.2.6/manifest"
 */
export function parseApmFileId(fileId: string): ApmFileId {
  const [tag, name, version, file] = splitFileId(fileId);
  if (tag !== apmTag) throw Error(`Parsing an invalid apm fileId: ${fileId}`);
  if (!name) throw Error(`Invalid apm fileId, no name: ${fileId}`);
  if (!version) throw Error(`Invalid apm fileId, no version: ${fileId}`);
  if (!file) throw Error(`Invalid apm fileId, no file: ${fileId}`);
  return { name, version, file };
}

/**
 * Parses a file ID supported by this pinner
 * @param fileId "/apm/admin.dnp.dappnode.eth/0.2.6/manifest"
 */
export function parseFileId(fileId: string) {
  const [tag] = splitFileId(fileId);
  switch (tag) {
    case apmTag:
      return parseApmFileId(fileId);
    default:
      throw Error(`Unknown fileId tag: ${tag}`);
  }
}
