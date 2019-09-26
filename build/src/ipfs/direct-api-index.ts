import request from "request";
import prettyBytes from "pretty-bytes";

const defaultTimeout = 15 * 60 * 1000;
const apiUrl =
  process.env.IPFS_API_URL || "http://my.ipfs.dnp.dappnode.eth:5001";

console.log(`IPFS connection to ${apiUrl}`);
const baseUrl = `${apiUrl}/api/v0`;

function call(subUrl: string, timeout?: number): Promise<string> {
  if (!timeout) timeout = defaultTimeout;
  const url = `${baseUrl}${subUrl}`;
  return new Promise((resolve, reject) => {
    request(url, { timeout }, function(err, res, body) {
      if (err) reject(err);
      if (res.statusCode === 200) resolve(body);
      else reject(Error(`${body} - url: ${url}`));
    });
  });
}

/**
 * Streams file from url to IPFS
 * Methodology reference
 *  - `form.append` https://github.com/form-data/form-data#usage
 *
 * @param url "https://raw.githubusercontent.com/danfinlay/ethereum-ens-network-map/master/index.js"
 * @returns res = {
 *   Hash: "QmVqbBsi4jswchAvBK4USLhcUPKQVXN7893PxtFq85xrtH",
 *   Size: 164
 * }
 */
export const addFromUrl = (
  url: string
): Promise<{ Hash: string; Size: number }> =>
  new Promise((resolve, reject) => {
    const req = request(`${baseUrl}/add`, (err, res, body) => {
      /**
       * - If the url does not resolve, request will return this object
       *   { Message: 'multipart: NextPart: EOF', Code: 0, Type: 'error' }
       * - If the IPFS API is not available, the promise will reject
       */
      if (err) reject(err);
      else {
        const bodyJson = JSON.parse(body);
        if (bodyJson.Hash) resolve(bodyJson.Hash);
        else if (bodyJson.Type === "error")
          if ((bodyJson.Message || "").includes("EOF")) reject(Error("404"));
          else reject(Error(bodyJson.Message));
        else reject(Error(`Unknown body format: ${body}`));
      }
    });
    const form = req.form();
    form.append("file", request(url));
  });

/**
 * Downloads IPFS hash contents
 * @param hash
 * @returns contents
 */
export const cat = (hash: string): Promise<string> => call(`/cat?arg=${hash}`);

export const ls = (hash: string) => call(`/ls?arg=${hash}`).then(parseJson);

/**
 * Returns list of all pinned hashes
 *
 * @param {string} hash "QmNMCAWCc1EAfQ7BdVfpH9HnV1W9FiP9ztdAasdfghjksd"
 * @returns {string} hash "QmNMCAWCc1EAfQ7BdVfpH9HnV1W9FiP9ztdAasdfghjksd"
 * If the upload was successful, the returned hash is the same
 */
export const pinAdd = (hash: string) =>
  call(`/pin/add?arg=${hash}`).then(parseJson);

/**
 * Returns list of all pinned hashes
 *
 * @returns {object} pinList = {
 *   QmNMCAWCc1EAfQ7BdVfpH9HnV1W9FiP9ztdAasdfghjksd: true,
 *   QmNNcdkFZuS17hdAWNWFbsCe3QHLpVJ5cCdAasdfghjksd: true,
 */
export const pinList = () =>
  call(`/pin/ls?type=recursive`)
    .then(parseJson)
    .then(body => body.Keys);

/**
 * Remove pinned objects from local storage
 * @param {string} hash "QmNMCAWCc1EAfQ7BdVfpH9HnV1W9FiP9ztdAasdfghjksd"
 */
export const pinRemove = (hash: string) =>
  call(`/pin/rm?arg=${hash}`).then(parseJson);

/**
 * Returns IPFS object stats
 * Use it to check if the file is available before downloading
 *
 * @param hash "QmVqbBsi4jswchAvBK4USLhcUPKQVXN7893PxtFq85xrtH"
 * @param timeout HTTP request timeout in ms
 * @returns stats = {
 *   Hash: "QmVqbBsi4jswchAvBK4USLhcUPKQVXN7893PxtFq85xrtH",
 *   NumLinks: 0,
 *   BlockSize: 164,
 *   LinksSize: 3,
 *   DataSize: 161,
 *   CumulativeSize: 164
 * }
 */
export const objectStats = (
  hash: string,
  timeout = 30 * 1000
): Promise<{ Hash: string }> =>
  call(`/object/stat?arg=${hash}`, timeout).then(parseJson);

/**
 * Returns current stats of the IPFS node
 *
 * @returns stats = {
 *   size: 4.22 GB,
 *   maxSize: 50 GB
 * }
 */
export const repoStats = (): Promise<{ size: string; maxSize: string }> =>
  call(`/stats/repo?size-only=true`)
    .then(parseJson)
    .then(({ RepoSize, StorageMax }) => ({
      size: prettyBytes(RepoSize),
      maxSize: prettyBytes(StorageMax)
    }));

/**
 * Returns current node ID
 *
 * @returns {object} stats = {
 *   "ID": "<string>"
 *   "PublicKey": "<string>"
 *   "Addresses": [ "<string>", ... ]
 *   "AgentVersion": "<string>"
 *   "ProtocolVersion": "<string>"
 * }
 */
export const id = (): Promise<{
  ID: string;
  PublicKey: string;
  Addresses: string[];
  AgentVersion: string;
  ProtocolVersion: string;
}> => call(`/id`).then(parseJson);

/**
 * [PARSER]
 */
function parseJson(s: string): any {
  return JSON.parse(s);
}
