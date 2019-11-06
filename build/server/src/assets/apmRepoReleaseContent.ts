import { splitMultiname, joinMultiname } from "../utils/multiname";

interface ApmRepoReleaseContent {
  name: string;
  version: string;
  filename: string;
}

/**
 * APM DNP Release file
 *
 * type:
 * `apm-repo-release-content`
 *
 * multiname structure:
 * `apm-repo-release-content/<dnpName>/<version>/<filename>`
 */

export const type = "apm-repo-release-content";

export const parseMultiname = (multiname: string): ApmRepoReleaseContent => {
  const [_type, name, version, filename] = splitMultiname(multiname);
  if (_type !== type) throw Error(`multiname must be of type: ${type}`);
  if (!name) throw Error(`No "name" in multiname: ${multiname}`);
  if (!version) throw Error(`No "version" in multiname: ${multiname}`);
  if (!filename) throw Error(`No "filename" in multiname: ${multiname}`);
  return { name, version, filename };
};

export const getMultiname = ({
  name,
  version,
  filename
}: ApmRepoReleaseContent) => {
  return joinMultiname([type, name, version, filename]);
};
