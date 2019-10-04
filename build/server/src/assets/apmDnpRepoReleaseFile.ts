import { splitMultiname, joinMultiname } from "../utils/multiname";

interface ApmDnpReleaseFile {
  name: string;
  version: string;
  filename: string;
}

/**
 * APM DNP Release file
 *
 * type:
 * `apm-dnp-release-file`
 *
 * multiname structure:
 * `apm-dnp-release-file/<dnpName>/<version>/<filename>`
 */

export const type = "apm-dnp-release-file";

export const parseMultiname = (multiname: string): ApmDnpReleaseFile => {
  // `apm-dnp-release-file/<dnpName>/<version>/<filename>`
  const [_type, name, version, filename] = splitMultiname(multiname);
  if (!name) throw Error(`No "name" in multiname: ${multiname}`);
  if (!version) throw Error(`No "version" in multiname: ${multiname}`);
  if (!filename) throw Error(`No "filename" in multiname: ${multiname}`);
  return { name, version, filename };
};

export const getMultiname = ({
  name,
  version,
  filename
}: ApmDnpReleaseFile) => {
  return joinMultiname([type, name, version, filename]);
};
